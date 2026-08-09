<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MedicalRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'records' => $this->emptyRecordsPayload(),
            ]);
        }

        $query = Prescription::query()->with([
            'doctor.user',
            'patient.user',
            'appointment.hospital',
            'medicalRecord',
            'items',
        ])->latest('issued_at')->latest();

        if ($user->hasRole('doctor')) {
            if (! $user->doctor) {
                return response()->json([
                    'records' => $this->emptyRecordsPayload(),
                ]);
            }

            $query->where('doctor_id', $user->doctor->id);
        } elseif ($user->hasRole('patient')) {
            if (! $user->patient) {
                return response()->json([
                    'records' => $this->emptyRecordsPayload(),
                ]);
            }

            $query->where('patient_id', $user->patient->id);
        }

        $prescriptions = $query->get()->map(fn (Prescription $prescription) => $this->formatPrescription($prescription))->values();

        $medicalRecordsQuery = MedicalRecord::query()->with([
            'doctor.user',
            'patient.user',
            'appointment.hospital',
        ])->latest('recorded_at')->latest();

        if ($user->hasRole('doctor')) {
            if (! $user->doctor) {
                return response()->json([
                    'records' => $this->emptyRecordsPayload(),
                ]);
            }

            $medicalRecordsQuery->where('doctor_id', $user->doctor->id);
        } elseif ($user->hasRole('patient')) {
            if (! $user->patient) {
                return response()->json([
                    'records' => $this->emptyRecordsPayload(),
                ]);
            }

            $medicalRecordsQuery->where('patient_id', $user->patient->id);
        }

        $medicalRecords = $medicalRecordsQuery->get();

        $notes = $medicalRecords
            ->filter(fn (MedicalRecord $record) => filled($record->clinical_notes) || filled($record->treatment_plan))
            ->map(fn (MedicalRecord $record) => $this->formatMedicalNote($record))
            ->values();

        $uploads = $medicalRecords
            ->flatMap(fn (MedicalRecord $record) => $this->formatAttachments($record))
            ->values();

        return response()->json([
            'records' => [
                'prescriptions' => $prescriptions,
                'diagnostics' => [],
                'notes' => $notes,
                'uploads' => $uploads,
                'invoices' => [],
            ],
        ]);
    }

    public function storeNote(Request $request, string $appointmentId): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->hasRole('doctor') || ! $user->doctor) {
            abort(403);
        }

        $data = $request->validate([
            'notes' => ['required', 'string', 'min:3'],
            'chiefComplaint' => ['nullable', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'treatmentPlan' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array'],
        ]);

        $appointment = $this->appointmentForDoctor($user->doctor->id, $appointmentId);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found.'],
            ]);
        }

        $medicalRecord = MedicalRecord::firstOrNew([
            'appointment_id' => $appointment->id,
            'doctor_id' => $user->doctor->id,
            'record_type' => 'consultation',
        ]);

        $medicalRecord->forceFill([
            'patient_id' => $appointment->patient_id,
            'status' => 'active',
            'chief_complaint' => $data['chiefComplaint'] ?? $medicalRecord->chief_complaint,
            'clinical_notes' => $data['notes'],
            'diagnosis' => array_key_exists('diagnosis', $data) ? $data['diagnosis'] : $medicalRecord->diagnosis,
            'treatment_plan' => array_key_exists('treatmentPlan', $data)
                ? $data['treatmentPlan']
                : $medicalRecord->treatment_plan,
            'attachments' => array_key_exists('attachments', $data)
                ? $data['attachments']
                : ($medicalRecord->attachments ?? []),
            'recorded_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Clinical memo saved successfully.',
            'record' => $this->formatMedicalNote($medicalRecord->loadMissing(['doctor.user', 'patient.user', 'appointment.hospital'])),
        ], 201);
    }

    public function storePrescription(Request $request, string $appointmentId): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->hasRole('doctor') || ! $user->doctor) {
            abort(403);
        }

        $data = $request->validate([
            'prescription' => ['required', 'string', 'min:3'],
            'notes' => ['nullable', 'string'],
            'followUpInDays' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $appointment = $this->appointmentForDoctor($user->doctor->id, $appointmentId);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found.'],
            ]);
        }

        $record = DB::transaction(function () use ($appointment, $user, $data) {
            $medicalRecord = MedicalRecord::firstOrNew([
                'appointment_id' => $appointment->id,
                'doctor_id' => $user->doctor->id,
                'record_type' => 'consultation',
            ]);

            $medicalRecord->forceFill([
                'patient_id' => $appointment->patient_id,
                'status' => 'active',
                'clinical_notes' => array_key_exists('notes', $data) && filled($data['notes'])
                    ? $data['notes']
                    : $medicalRecord->clinical_notes,
                'treatment_plan' => $data['prescription'],
                'recorded_at' => now(),
            ])->save();

            $prescription = Prescription::firstOrNew([
                'appointment_id' => $appointment->id,
                'doctor_id' => $user->doctor->id,
            ]);

            if (! $prescription->exists) {
                $prescription->prescription_no = $this->newPrescriptionNumber();
            }

            $prescription->forceFill([
                'patient_id' => $appointment->patient_id,
                'medical_record_id' => $medicalRecord->id,
                'status' => 'issued',
                'issued_at' => now(),
                'notes' => $data['prescription'],
                'follow_up_in_days' => $data['followUpInDays'] ?? null,
            ])->save();

            return $prescription->loadMissing([
                'doctor.user',
                'patient.user',
                'appointment.hospital',
                'medicalRecord',
                'items',
            ]);
        });

        return response()->json([
            'message' => 'Prescription saved successfully.',
            'record' => $this->formatPrescription($record),
        ], 201);
    }

    private function appointmentForDoctor(int $doctorId, string $appointmentId): ?Appointment
    {
        return Appointment::query()
            ->with(['patient.user', 'doctor.user', 'hospital'])
            ->where('appointment_no', $appointmentId)
            ->where('doctor_id', $doctorId)
            ->first();
    }

    private function newPrescriptionNumber(): string
    {
        return 'RX-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(4));
    }

    private function emptyRecordsPayload(): array
    {
        return [
            'prescriptions' => [],
            'diagnostics' => [],
            'notes' => [],
            'uploads' => [],
            'invoices' => [],
        ];
    }

    private function formatPrescription(Prescription $prescription): array
    {
        return [
            'id' => (string) $prescription->id,
            'title' => $prescription->prescription_no,
            'doctorName' => $prescription->doctor?->user?->name ?? 'Doctor',
            'patientName' => $prescription->patient?->user?->name ?? 'Patient',
            'summary' => $prescription->notes,
            'date' => $prescription->issued_at?->toDateString() ?? $prescription->created_at->toDateString(),
            'issuedAt' => $prescription->issued_at?->toISOString(),
            'appointmentId' => $prescription->appointment_id ? (string) $prescription->appointment_id : null,
            'followUpInDays' => $prescription->follow_up_in_days,
            'items' => $prescription->items->map(fn ($item) => [
                'id' => (string) $item->id,
                'medicineName' => $item->medicine_name,
                'strength' => $item->strength,
                'dosage' => $item->dosage,
                'frequency' => $item->frequency,
                'route' => $item->route,
                'duration' => $item->duration,
                'quantity' => $item->quantity,
                'instructions' => $item->instructions,
            ])->values(),
        ];
    }

    private function formatMedicalNote(MedicalRecord $record): array
    {
        return [
            'id' => (string) $record->id,
            'title' => $record->chief_complaint ?: 'Clinical Memo',
            'doctor' => $record->doctor?->user?->name ?? 'Doctor',
            'facility' => $record->appointment?->hospital?->name ?? 'Consultation',
            'date' => $record->recorded_at?->toDateString() ?? $record->created_at->toDateString(),
            'summary' => $record->clinical_notes ?: $record->treatment_plan,
            'diagnosis' => $record->diagnosis,
            'treatmentPlan' => $record->treatment_plan,
            'appointmentId' => $record->appointment_id ? (string) $record->appointment_id : null,
        ];
    }

    private function formatAttachments(MedicalRecord $record): array
    {
        return collect($record->attachments ?? [])
            ->map(function ($attachment, int $index) use ($record): array {
                $title = is_array($attachment)
                    ? ($attachment['title'] ?? $attachment['name'] ?? $attachment['file_name'] ?? 'Document')
                    : (string) $attachment;

                $url = is_array($attachment)
                    ? ($attachment['url'] ?? $attachment['path'] ?? '#')
                    : '#';

                return [
                    'id' => $record->id . '-attachment-' . $index,
                    'title' => $title,
                    'doctor' => $record->doctor?->user?->name ?? 'Doctor',
                    'date' => $record->recorded_at?->toDateString() ?? $record->created_at->toDateString(),
                    'fileUrl' => $url,
                ];
            })
            ->all();
    }
}
