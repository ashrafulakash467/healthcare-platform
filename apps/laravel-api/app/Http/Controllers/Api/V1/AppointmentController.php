<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function my(Request $request): JsonResponse
    {
        return response()->json([
            'appointments' => $this->appointmentsFor($request->user()?->getRoleNames()->first()),
        ]);
    }

    public function bookingOptions(Request $request): JsonResponse
    {
        $doctorId = (string) $request->query('doctorId', '1');
        $doctor = $this->doctorById($doctorId);

        return response()->json([
            'doctor' => $doctor,
            'clinics' => $doctor['clinics'],
            'schedule' => [
                'consultationType' => 'in_person',
                'slotDurationMinutes' => 15,
                'timezone' => 'Asia/Dhaka',
            ],
        ]);
    }

    public function availableDates(Request $request): JsonResponse
    {
        $doctorId = (string) $request->query('doctorId', '1');
        $clinicId = (string) $request->query('clinicId', '1');

        return response()->json([
            'doctorId' => $doctorId,
            'clinicId' => $clinicId,
            'dates' => [
                now()->addDay()->toDateString(),
                now()->addDays(2)->toDateString(),
                now()->addDays(3)->toDateString(),
                now()->addDays(5)->toDateString(),
            ],
        ]);
    }

    public function availableSlots(Request $request): JsonResponse
    {
        $date = (string) $request->query('date', now()->toDateString());

        return response()->json([
            'date' => $date,
            'slots' => [
                ['time' => '09:00 AM', 'isBooked' => false],
                ['time' => '09:30 AM', 'isBooked' => false],
                ['time' => '10:00 AM', 'isBooked' => true],
                ['time' => '11:00 AM', 'isBooked' => false],
                ['time' => '04:00 PM', 'isBooked' => false],
            ],
        ]);
    }

    public function book(Request $request): JsonResponse
    {
        $data = $request->validate([
            'doctorId' => ['required', 'integer'],
            'clinicId' => ['required', 'integer'],
            'appointmentDate' => ['required', 'date'],
            'slotTime' => ['required', 'string'],
        ]);

        $doctor = $this->doctorById((string) $data['doctorId']);
        $clinic = $this->clinicById((string) $data['clinicId']);

        return response()->json([
            'message' => 'Appointment booked successfully.',
            'appointment' => $this->createAppointmentPayload(
                id: 'apt-'.now()->format('YmdHis'),
                doctor: $doctor,
                clinic: $clinic,
                patient: $this->demoPatient(),
                appointmentDate: $data['appointmentDate'],
                slotTime: $data['slotTime'],
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentAmountCents: 15000,
                paymentCurrency: 'BDT',
                isReschedulable: true,
                isCancellable: true
            ),
        ], 201);
    }

    public function cancel(Request $request): JsonResponse
    {
        $data = $request->validate([
            'appointmentId' => ['required', 'string'],
            'reason' => ['required', 'string', 'min:3'],
        ]);

        return response()->json([
            'message' => 'Appointment cancelled successfully.',
            'appointmentId' => $data['appointmentId'],
            'reason' => $data['reason'],
        ]);
    }

    public function payment(string $appointmentId): JsonResponse
    {
        return response()->json([
            'message' => 'Payment created successfully.',
            'payment' => [
                'id' => 'pay-'.$appointmentId,
                'appointmentId' => $appointmentId,
                'status' => 'pending',
                'amountCents' => 15000,
                'currency' => 'BDT',
            ],
        ]);
    }

    public function rescheduleOptions(Request $request): JsonResponse
    {
        $appointmentId = (string) $request->query('appointmentId', 'apt-1');

        return response()->json([
            'appointment' => $this->appointmentsFor('patient')->firstWhere('id', $appointmentId) ?? $this->appointmentsFor('patient')->first(),
            'dates' => [
                now()->addDays(2)->toDateString(),
                now()->addDays(4)->toDateString(),
                now()->addDays(6)->toDateString(),
            ],
        ]);
    }

    public function rescheduleSlots(Request $request): JsonResponse
    {
        return response()->json([
            'slots' => [
                ['time' => '10:30 AM', 'isBooked' => false],
                ['time' => '11:30 AM', 'isBooked' => false],
                ['time' => '02:30 PM', 'isBooked' => false],
                ['time' => '04:30 PM', 'isBooked' => false],
            ],
        ]);
    }

    public function reschedule(Request $request): JsonResponse
    {
        $data = $request->validate([
            'appointmentId' => ['required', 'string'],
            'appointmentDate' => ['required', 'date'],
            'slotTime' => ['required', 'string'],
        ]);

        $appointment = $this->appointmentsFor('patient')->firstWhere('id', $data['appointmentId']);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found.'],
            ]);
        }

        return response()->json([
            'message' => 'Appointment rescheduled successfully.',
            'appointment' => array_merge($appointment, [
                'appointmentDate' => $data['appointmentDate'],
                'slotTime' => $data['slotTime'],
                'rescheduledAt' => now()->toISOString(),
            ]),
        ]);
    }

    private function appointmentsFor(?string $role): Collection
    {
        $appointments = collect([
            $this->createAppointmentPayload(
                id: 'apt-1001',
                doctor: $this->doctorById('1'),
                clinic: $this->clinicById('1'),
                patient: $this->demoPatient(),
                appointmentDate: now()->toDateString(),
                slotTime: '09:30 AM',
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentAmountCents: 15000,
                paymentCurrency: 'BDT',
                isReschedulable: true,
                isCancellable: true
            ),
            $this->createAppointmentPayload(
                id: 'apt-1002',
                doctor: $this->doctorById('2'),
                clinic: $this->clinicById('2'),
                patient: $this->demoPatient('Nusrat Jahan', 'nusrat@example.com', '01711112222'),
                appointmentDate: now()->addDay()->toDateString(),
                slotTime: '11:00 AM',
                status: 'pending',
                paymentStatus: 'pending',
                paymentAmountCents: 12500,
                paymentCurrency: 'BDT',
                isReschedulable: true,
                isCancellable: true
            ),
            $this->createAppointmentPayload(
                id: 'apt-1003',
                doctor: $this->doctorById('3'),
                clinic: $this->clinicById('1'),
                patient: $this->demoPatient('Sabbir Ahmed', 'sabbir@example.com', '01733334444'),
                appointmentDate: now()->addDays(3)->toDateString(),
                slotTime: '04:00 PM',
                status: 'upcoming',
                paymentStatus: 'unpaid',
                paymentAmountCents: 17500,
                paymentCurrency: 'BDT',
                isReschedulable: true,
                isCancellable: false
            ),
        ]);

        return $appointments;
    }

    private function doctorById(string $doctorId): array
    {
        $doctors = [
            '1' => [
                'id' => 1,
                'name' => 'Dr. Amina Rahman',
                'email' => 'amina.rahman@example.com',
                'phone' => '01710000001',
                'specialty' => 'Cardiology',
                'location' => 'Dhaka',
                'gender' => 'Female',
                'isAvailable' => true,
                'imageUrl' => '/vercel.svg',
                'clinics' => [
                    ['id' => 1, 'name' => 'Central Care Hospital', 'location' => 'Dhaka'],
                    ['id' => 2, 'name' => 'North Point Clinic', 'location' => 'Uttara'],
                ],
            ],
            '2' => [
                'id' => 2,
                'name' => 'Dr. Tanvir Hasan',
                'email' => 'tanvir.hasan@example.com',
                'phone' => '01710000002',
                'specialty' => 'Dermatology',
                'location' => 'Chattogram',
                'gender' => 'Male',
                'isAvailable' => true,
                'imageUrl' => '/next.svg',
                'clinics' => [
                    ['id' => 2, 'name' => 'City Medical Center', 'location' => 'Chattogram'],
                ],
            ],
            '3' => [
                'id' => 3,
                'name' => 'Dr. Nusrat Jahan',
                'email' => 'nusrat.jahan@example.com',
                'phone' => '01710000003',
                'specialty' => 'Gynecology',
                'location' => 'Dhaka',
                'gender' => 'Female',
                'isAvailable' => false,
                'imageUrl' => '/globe.svg',
                'clinics' => [
                    ['id' => 1, 'name' => 'Central Care Hospital', 'location' => 'Dhaka'],
                ],
            ],
        ];

        return $doctors[$doctorId] ?? $doctors['1'];
    }

    private function clinicById(string $clinicId): array
    {
        return match ($clinicId) {
            '2' => ['id' => 2, 'name' => 'City Medical Center', 'location' => 'Chattogram'],
            default => ['id' => 1, 'name' => 'Central Care Hospital', 'location' => 'Dhaka'],
        };
    }

    private function demoPatient(
        string $name = 'Nadia Rahman',
        string $email = 'nadia@example.com',
        string $phone = '01700000001'
    ): array {
        return [
            'id' => 1,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
        ];
    }

    private function createAppointmentPayload(
        string $id,
        array $doctor,
        array $clinic,
        array $patient,
        string $appointmentDate,
        string $slotTime,
        string $status,
        string $paymentStatus,
        int $paymentAmountCents,
        string $paymentCurrency,
        bool $isReschedulable,
        bool $isCancellable
    ): array {
        return [
            'id' => $id,
            'patient' => $patient,
            'patientName' => $patient['name'],
            'doctor' => $doctor,
            'clinic' => $clinic,
            'appointmentDate' => $appointmentDate,
            'slotTime' => $slotTime,
            'status' => $status,
            'paymentStatus' => $paymentStatus,
            'paymentAmountCents' => $paymentAmountCents,
            'paymentCurrency' => $paymentCurrency,
            'isReschedulable' => $isReschedulable,
            'isCancellable' => $isCancellable,
            'cancellationReason' => null,
        ];
    }
}
