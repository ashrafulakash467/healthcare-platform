<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\Doctor;
use App\Models\Hospital;
use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function my(Request $request): JsonResponse
    {
        $appointments = $this->appointmentsForUser($request->user())
            ->map(fn (Appointment $appointment) => $this->formatAppointment($appointment))
            ->values();

        return response()->json([
            'appointments' => $appointments,
        ]);
    }

    public function bookingOptions(Request $request): JsonResponse
    {
        $doctorId = (string) $request->query('doctorId', '');
        $doctor = $doctorId !== ''
            ? Doctor::query()->with(['user', 'primaryHospital', 'hospitals', 'schedules'])->findOrFail($doctorId)
            : Doctor::query()->with(['user', 'primaryHospital', 'hospitals', 'schedules'])->where('status', 'active')->firstOrFail();

        $clinics = $this->clinicsForDoctor($doctor);
        $schedule = $doctor->schedules->firstWhere('is_active', true) ?? $doctor->schedules->first();

        return response()->json([
            'doctor' => $this->formatDoctor($doctor, $clinics),
            'clinics' => $clinics,
            'schedule' => [
                'consultationType' => $schedule?->consultation_type ?? 'in_person',
                'slotDurationMinutes' => $schedule?->slot_duration_minutes ?? 15,
                'timezone' => $schedule?->timezone ?? 'Asia/Dhaka',
            ],
        ]);
    }

    public function availableDates(Request $request): JsonResponse
    {
        $doctorId = (string) $request->query('doctorId', '');
        $clinicId = (string) $request->query('clinicId', '');

        $slots = $this->slotQuery($doctorId, $clinicId)
            ->whereDate('slot_date', '>=', now()->toDateString())
            ->orderBy('slot_date')
            ->get();

        return response()->json([
            'doctorId' => $doctorId,
            'clinicId' => $clinicId,
            'dates' => $slots->pluck('slot_date')->map(fn ($date) => Carbon::parse($date)->toDateString())->unique()->values(),
        ]);
    }

    public function availableSlots(Request $request): JsonResponse
    {
        $doctorId = (string) $request->query('doctorId', '');
        $clinicId = (string) $request->query('clinicId', '');
        $date = (string) $request->query('date', now()->toDateString());

        $slots = $this->slotQuery($doctorId, $clinicId)
            ->whereDate('slot_date', $date)
            ->orderBy('start_time')
            ->get()
            ->map(function (AppointmentSlot $slot): array {
                return [
                    'time' => Carbon::createFromFormat('H:i:s', $slot->start_time)->format('h:i A'),
                    'isBooked' => $slot->booked_count >= $slot->capacity || ! $slot->is_bookable || $slot->status !== 'available',
                ];
            })
            ->values();

        return response()->json([
            'date' => $date,
            'slots' => $slots,
        ]);
    }

    public function book(Request $request): JsonResponse
    {
        $data = $request->validate([
            'doctorId' => ['required', 'integer'],
            'clinicId' => ['nullable'],
            'appointmentDate' => ['required', 'date'],
            'slotTime' => ['required', 'string'],
        ]);

        $doctor = Doctor::query()->with(['user', 'primaryHospital', 'hospitals', 'schedules'])->findOrFail($data['doctorId']);
        $clinicId = trim((string) ($data['clinicId'] ?? ''));
        $clinic = is_numeric($clinicId)
            ? Hospital::query()->findOrFail((int) $clinicId)
            : null;
        $patient = $this->resolvePatient($request->user());
        $slot = $this->slotForBooking($doctor->id, $clinicId, $data['appointmentDate'], $data['slotTime']);

        if (! $slot) {
            throw ValidationException::withMessages([
                'slotTime' => ['Selected time slot is not available.'],
            ]);
        }

        if ($slot->booked_count >= $slot->capacity || ! $slot->is_bookable || $slot->status !== 'available') {
            throw ValidationException::withMessages([
                'slotTime' => ['Selected time slot is already booked.'],
            ]);
        }

        $appointment = Appointment::create([
            'appointment_no' => $this->newAppointmentNumber(),
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'hospital_id' => $clinic?->id,
            'appointment_slot_id' => $slot->id,
            'consultation_type' => $slot->schedule?->consultation_type ?? 'in_person',
            'appointment_date' => $data['appointmentDate'],
            'start_time' => $slot->start_time,
            'end_time' => $slot->end_time,
            'status' => 'pending',
            'payment_status' => 'pending',
            'channel' => 'web',
            'reason' => 'General consultation',
            'symptoms' => null,
            'meta' => [
                'source' => 'web',
                'clinic_address' => $clinicId !== '' ? $clinicId : ($doctor->chamber_address ?? null),
            ],
        ]);

        $slot->forceFill([
            'booked_count' => $slot->booked_count + 1,
            'status' => $slot->booked_count + 1 >= $slot->capacity ? 'booked' : $slot->status,
        ])->save();

        $appointment->loadMissing(['patient.user', 'doctor.user', 'doctor.primaryHospital', 'doctor.hospitals', 'hospital']);

        return response()->json([
            'message' => 'Appointment booked successfully.',
            'appointment' => $this->formatAppointment($appointment),
        ], 201);
    }

    public function cancel(Request $request): JsonResponse
    {
        $data = $request->validate([
            'appointmentId' => ['required', 'string'],
            'reason' => ['required', 'string', 'min:3'],
        ]);

        $appointment = $this->findAppointmentForCurrentUser($request->user(), $data['appointmentId']);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found.'],
            ]);
        }

        $this->releaseSlotIfNeeded($appointment);

        $appointment->forceFill([
            'status' => 'cancelled',
            'cancel_reason' => $data['reason'],
        ])->save();

        return response()->json([
            'message' => 'Appointment cancelled successfully.',
            'appointmentId' => $data['appointmentId'],
            'reason' => $data['reason'],
        ]);
    }

    public function payment(string $appointmentId, Request $request): JsonResponse
    {
        $appointment = $this->findAppointmentForCurrentUser($request->user(), $appointmentId);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found.'],
            ]);
        }

        $appointment->loadMissing(['doctor', 'patient', 'hospital', 'payment']);
        $amount = $this->appointmentAmount($appointment);

        $payment = Payment::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'transaction_no' => $this->newTransactionNumber($appointment->appointment_no),
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'hospital_id' => $appointment->hospital_id,
                'payer_user_id' => $request->user()?->id,
                'provider' => 'manual',
                'method' => 'cash',
                'currency' => 'BDT',
                'amount' => $amount / 100,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $amount / 100,
                'paid_amount' => $amount / 100,
                'due_amount' => 0,
                'status' => 'paid',
                'paid_at' => now(),
            ],
        );

        $appointment->forceFill([
            'payment_status' => 'paid',
        ])->save();

        return response()->json([
            'message' => 'Payment created successfully.',
            'payment' => [
                'id' => (string) $payment->id,
                'appointmentId' => (string) $appointment->id,
                'status' => $payment->status,
                'amountCents' => (int) round(((float) $payment->paid_amount) * 100),
                'currency' => $payment->currency,
            ],
        ]);
    }

    public function rescheduleOptions(Request $request): JsonResponse
    {
        $appointmentId = (string) $request->query('appointmentId', '');
        $appointment = $this->findAppointmentForCurrentUser($request->user(), $appointmentId);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found.'],
            ]);
        }

        $appointment->loadMissing(['doctor.user', 'doctor.primaryHospital', 'doctor.hospitals', 'hospital', 'patient.user']);
        $clinicId = $appointment->hospital_id ? (string) $appointment->hospital_id : null;
        $slots = $this->slotQuery((string) $appointment->doctor_id, $clinicId)
            ->whereDate('slot_date', '>=', now()->toDateString())
            ->orderBy('slot_date')
            ->get();

        return response()->json([
            'appointment' => $this->formatAppointment($appointment),
            'dates' => $slots->pluck('slot_date')->map(fn ($date) => Carbon::parse($date)->toDateString())->unique()->values(),
        ]);
    }

    public function rescheduleSlots(Request $request): JsonResponse
    {
        $appointmentId = (string) $request->query('appointmentId', '');
        $date = (string) $request->query('date', now()->toDateString());
        $appointment = $this->findAppointmentForCurrentUser($request->user(), $appointmentId);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found.'],
            ]);
        }

        $clinicId = $appointment->hospital_id ? (string) $appointment->hospital_id : null;
        $slots = $this->slotQuery((string) $appointment->doctor_id, $clinicId)
            ->whereDate('slot_date', $date)
            ->orderBy('start_time')
            ->get()
            ->map(function (AppointmentSlot $slot): array {
                return [
                    'time' => Carbon::createFromFormat('H:i:s', $slot->start_time)->format('h:i A'),
                    'isBooked' => $slot->booked_count >= $slot->capacity || ! $slot->is_bookable || $slot->status !== 'available',
                ];
            })
            ->values();

        return response()->json([
            'slots' => $slots,
        ]);
    }

    public function reschedule(Request $request): JsonResponse
    {
        $data = $request->validate([
            'appointmentId' => ['required', 'string'],
            'appointmentDate' => ['required', 'date'],
            'slotTime' => ['required', 'string'],
        ]);

        $appointment = $this->findAppointmentForCurrentUser($request->user(), $data['appointmentId']);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found.'],
            ]);
        }

        $appointment->loadMissing(['doctor.schedules', 'hospital']);
        $clinicId = $appointment->hospital_id ? (string) $appointment->hospital_id : null;
        $slot = $this->slotForBooking((int) $appointment->doctor_id, $clinicId, $data['appointmentDate'], $data['slotTime']);

        if (! $slot) {
            throw ValidationException::withMessages([
                'slotTime' => ['Selected time slot is not available.'],
            ]);
        }

        if ($slot->booked_count >= $slot->capacity || ! $slot->is_bookable || $slot->status !== 'available') {
            throw ValidationException::withMessages([
                'slotTime' => ['Selected time slot is already booked.'],
            ]);
        }

        $this->releaseSlotIfNeeded($appointment);

        $appointment->forceFill([
            'appointment_slot_id' => $slot->id,
            'appointment_date' => $data['appointmentDate'],
            'start_time' => $slot->start_time,
            'end_time' => $slot->end_time,
            'rescheduled_at' => now(),
            'status' => $appointment->status === 'cancelled' ? 'pending' : $appointment->status,
        ])->save();

        $slot->forceFill([
            'booked_count' => $slot->booked_count + 1,
            'status' => $slot->booked_count + 1 >= $slot->capacity ? 'booked' : $slot->status,
        ])->save();

        $appointment->loadMissing(['patient.user', 'doctor.user', 'doctor.primaryHospital', 'doctor.hospitals', 'hospital']);

        return response()->json([
            'message' => 'Appointment rescheduled successfully.',
            'appointment' => $this->formatAppointment($appointment, [
                'appointmentDate' => $data['appointmentDate'],
                'slotTime' => $this->displaySlotTime($slot),
                'rescheduledAt' => now()->toISOString(),
            ]),
        ]);
    }

    private function appointmentsForUser(?\Illuminate\Contracts\Auth\Authenticatable $user): Collection
    {
        if (! $user instanceof \App\Models\User) {
            return collect();
        }

        $query = Appointment::query()->with([
            'patient.user',
            'doctor.user',
            'doctor.primaryHospital',
            'doctor.hospitals',
            'hospital',
            'slot',
            'payment',
        ])->latest();

        if ($user->hasRole('doctor') && $user->doctor) {
            $query->where('doctor_id', $user->doctor->id);
        } elseif ($user->hasRole('hospital')) {
            $hospital = $user->createdHospitals()->latest()->first();
            if ($hospital) {
                $query->where('hospital_id', $hospital->id);
            } else {
                return collect();
            }
        } else {
            $patient = $user->patient;
            if ($patient) {
                $query->where('patient_id', $patient->id);
            } else {
                return collect();
            }
        }

        return $query->get();
    }

    private function resolvePatient(?\Illuminate\Contracts\Auth\Authenticatable $user): Patient
    {
        if (! $user instanceof \App\Models\User) {
            throw ValidationException::withMessages([
                'patient' => ['Unable to resolve the current patient.'],
            ]);
        }

        if ($user->patient) {
            return $user->patient;
        }

        return Patient::create([
            'user_id' => $user->id,
            'status' => 'active',
        ]);
    }

    private function findAppointmentForCurrentUser(?\Illuminate\Contracts\Auth\Authenticatable $user, string $appointmentId): ?Appointment
    {
        if (! $user instanceof \App\Models\User) {
            return null;
        }

        $query = Appointment::query()->with([
            'patient.user',
            'doctor.user',
            'doctor.primaryHospital',
            'doctor.hospitals',
            'hospital',
            'slot',
            'payment',
        ])->where('appointment_no', $appointmentId);

        if ($user->hasRole('doctor') && $user->doctor) {
            $query->where('doctor_id', $user->doctor->id);
        } elseif ($user->hasRole('hospital')) {
            $hospital = $user->createdHospitals()->latest()->first();
            if ($hospital) {
                $query->where('hospital_id', $hospital->id);
            }
        } else {
            $patient = $user->patient;
            if ($patient) {
                $query->where('patient_id', $patient->id);
            }
        }

        return $query->first();
    }

    private function slotQuery(string $doctorId, ?string $clinicId = null)
    {
        $query = AppointmentSlot::query()
            ->with(['schedule', 'doctor.user', 'hospital'])
            ->where('doctor_id', $doctorId);

        if ($clinicId !== null && $clinicId !== '' && ctype_digit($clinicId)) {
            $query->where('hospital_id', (int) $clinicId);
        }

        return $query;
    }

    private function slotForBooking(int $doctorId, ?string $clinicId, string $appointmentDate, string $slotTime): ?AppointmentSlot
    {
        $normalizedTime = $this->normalizeSlotTime($slotTime);

        return $this->slotQuery((string) $doctorId, $clinicId)
            ->whereDate('slot_date', $appointmentDate)
            ->where('start_time', $normalizedTime)
            ->first();
    }

    private function formatAppointment(Appointment $appointment, array $overrides = []): array
    {
        $doctor = $appointment->doctor;
        $hospital = $appointment->hospital;
        $patient = $appointment->patient;
        $payment = $appointment->payment;
        $clinicAddress = $appointment->meta['clinic_address'] ?? $doctor?->chamber_address ?? null;

        $appointmentDate = $overrides['appointmentDate'] ?? $appointment->appointment_date?->toDateString() ?? (string) $appointment->appointment_date;
        $slotTime = $overrides['slotTime'] ?? $this->displayTime($appointment->start_time);

        return array_merge([
            'id' => (string) $appointment->appointment_no,
            'patient' => $patient ? [
                'id' => (string) $patient->id,
                'name' => $patient->user?->name ?? '',
                'email' => $patient->user?->email ?? '',
                'phone' => $patient->user?->phone ?? '',
            ] : null,
            'patientName' => $patient?->user?->name ?? '',
            'doctor' => $this->formatDoctor($doctor, $this->clinicsForDoctor($doctor)),
            'clinic' => $hospital ? [
                'id' => (string) $hospital->id,
                'name' => $hospital->name,
                'location' => $hospital->city ?? '',
            ] : ($clinicAddress ? [
                'id' => '',
                'name' => $clinicAddress,
                'location' => '',
            ] : null),
            'appointmentDate' => $appointmentDate,
            'slotTime' => $slotTime,
            'status' => $appointment->status,
            'paymentStatus' => $appointment->payment_status,
            'paymentAmountCents' => $this->appointmentAmount($appointment),
            'paymentCurrency' => 'BDT',
            'isReschedulable' => ! in_array($appointment->status, ['cancelled', 'completed'], true),
            'isCancellable' => ! in_array($appointment->status, ['cancelled', 'completed'], true),
            'cancellationReason' => $appointment->cancel_reason,
        ], $overrides);
    }

    private function formatDoctor(?Doctor $doctor, array $clinics = []): array
    {
        if (! $doctor) {
            return [
                'id' => '',
                'name' => 'Unknown Doctor',
                'email' => '',
                'phone' => '',
                'specialty' => 'General Medicine',
                'location' => 'Unavailable',
                'gender' => 'Unspecified',
                'isAvailable' => false,
                'imageUrl' => '/globe.svg',
                'clinics' => [],
            ];
        }

        return [
            'id' => (string) $doctor->id,
            'name' => $doctor->user?->name ?? 'Unknown Doctor',
            'email' => $doctor->user?->email ?? '',
            'phone' => $doctor->user?->phone ?? '',
            'specialty' => $doctor->specialty ?? 'General Medicine',
            'consultationFee' => $doctor->consultation_fee,
            'location' => $doctor->city ?: $doctor->primaryHospital?->city ?: 'Unavailable',
            'gender' => $doctor->gender ?? 'Unspecified',
            'isAvailable' => $doctor->status === 'active' && $doctor->verification_status === 'approved',
            'imageUrl' => $this->doctorImageUrl($doctor->image_path),
            'chamberAddress' => $doctor->chamber_address,
            'availableDates' => $this->normalizeListField($doctor->available_dates),
            'availableTimeSlots' => $this->normalizeListField($doctor->available_time_slots),
            'clinics' => $clinics,
        ];
    }

    private function doctorImageUrl(?string $imagePath): string
    {
        if (blank($imagePath)) {
            return '/globe.svg';
        }

        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return $imagePath;
        }

        if (str_starts_with($imagePath, '/')) {
            return url(ltrim($imagePath, '/'));
        }

        $filename = basename($imagePath);
        $localPath = dirname(dirname(base_path())).DIRECTORY_SEPARATOR.'Stroage'.DIRECTORY_SEPARATOR.'doctors'.DIRECTORY_SEPARATOR.$filename;

        if (is_file($localPath)) {
            return url('/doctor-images/'.$filename);
        }

        return Storage::disk('public')->url($imagePath);
    }

    private function clinicsForDoctor(?Doctor $doctor): array
    {
        if (! $doctor) {
            return [];
        }

        $clinics = $doctor->hospitals->map(function (Hospital $hospital): array {
            return [
                'id' => (string) $hospital->id,
                'name' => $hospital->name,
                'location' => $hospital->city ?? '',
            ];
        })->values()->all();

        if (empty($clinics) && $doctor->primaryHospital) {
            $clinics[] = [
                'id' => (string) $doctor->primaryHospital->id,
                'name' => $doctor->primaryHospital->name,
                'location' => $doctor->primaryHospital->city ?? '',
            ];
        }

        return $clinics;
    }

    private function appointmentAmount(Appointment $appointment): int
    {
        if ($appointment->payment) {
            return (int) round(((float) $appointment->payment->paid_amount) * 100);
        }

        return (int) round(((float) ($appointment->doctor?->consultation_fee ?? 0)) * 100);
    }

    private function newAppointmentNumber(): string
    {
        do {
            $number = 'APT-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
        } while (Appointment::query()->where('appointment_no', $number)->exists());

        return $number;
    }

    private function newTransactionNumber(string $appointmentNo): string
    {
        return 'TRX-'.$appointmentNo.'-'.Str::upper(Str::random(4));
    }

    private function normalizeSlotTime(string $slotTime): string
    {
        $slotTime = trim($slotTime);
        if (str_contains($slotTime, '-')) {
            $slotTime = trim(explode('-', $slotTime, 2)[0]);
        }

        $formats = ['g:ia', 'g:i a', 'g:iA', 'g:i A', 'h:ia', 'h:i a', 'h:iA', 'h:i A', 'H:i', 'H:i:s'];

        foreach ($formats as $format) {
            try {
                return Carbon::createFromFormat($format, $slotTime)->format('H:i:s');
            } catch (\Throwable) {
                continue;
            }
        }

        $parsed = Carbon::parse($slotTime);

        return $parsed->format('H:i:s');
    }

    private function normalizeListField(mixed $value): array
    {
        if (blank($value)) {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $value = $decoded;
            } else {
                $value = array_filter(array_map('trim', preg_split('/[\n,]+/', $value) ?: []));
            }
        }

        if (! is_array($value)) {
            return [];
        }

        return collect($value)
            ->filter(fn ($item) => is_scalar($item) || $item === null)
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->values()
            ->all();
    }

    private function displayTime(?string $time): string
    {
        if (! $time) {
            return '';
        }

        return Carbon::createFromFormat('H:i:s', $time)->format('h:i A');
    }

    private function displaySlotTime(AppointmentSlot $slot): string
    {
        return Carbon::createFromFormat('H:i:s', $slot->start_time)->format('h:i A');
    }

    private function releaseSlotIfNeeded(Appointment $appointment): void
    {
        if (! $appointment->appointment_slot_id) {
            return;
        }

        $slot = AppointmentSlot::query()->find($appointment->appointment_slot_id);

        if (! $slot) {
            return;
        }

        $slot->forceFill([
            'booked_count' => max(0, $slot->booked_count - 1),
            'status' => max(0, $slot->booked_count - 1) === 0 ? 'available' : $slot->status,
        ])->save();
    }
}
