<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->getRoleNames()->first();

        return response()->json([
            'role' => $role,
            'user' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'status' => $user?->status,
            ],
            'modules' => $this->modulesFor($role),
            'summary' => $this->summaryFor($user, $role),
        ]);
    }

    public function admin(Request $request): JsonResponse
    {
        return response()->json([
            'role' => 'admin',
            'modules' => $this->modulesFor('admin'),
            'summary' => $this->summaryFor($request->user(), 'admin'),
        ]);
    }

    public function doctor(Request $request): JsonResponse
    {
        return response()->json([
            'role' => 'doctor',
            'modules' => $this->modulesFor('doctor'),
            'summary' => $this->summaryFor($request->user(), 'doctor'),
        ]);
    }

    public function patient(Request $request): JsonResponse
    {
        return response()->json([
            'role' => 'patient',
            'modules' => $this->modulesFor('patient'),
            'summary' => $this->summaryFor($request->user(), 'patient'),
        ]);
    }

    private function summaryFor(?User $user, ?string $role): array
    {
        return match ($role) {
            'admin' => $this->adminSummary(),
            'doctor' => $this->doctorSummary($user),
            default => $this->patientSummary($user),
        };
    }

    private function adminSummary(): array
    {
        $today = now()->toDateString();

        $pendingDoctors = Doctor::query()->where('verification_status', 'pending')->count();
        $pendingRefunds = Payment::query()->where('status', 'refund_requested')->count();
        $openTickets = SupportTicket::query()->where('status', 'open')->count();
        $systemHealth = max(80, 100 - ($pendingDoctors * 2) - $openTickets);

        $revenue = Payment::query()
            ->where('status', 'paid')
            ->sum('paid_amount');

        return [
            'patients' => Patient::query()->count(),
            'doctors' => Doctor::query()->count(),
            'todayAppointments' => Appointment::query()
                ->whereDate('appointment_date', $today)
                ->where('status', '!=', 'cancelled')
                ->count(),
            'revenueCents' => (int) round(((float) $revenue) * 100),
            'pendingDoctors' => $pendingDoctors,
            'pendingRefunds' => $pendingRefunds,
            'openTickets' => $openTickets,
            'systemHealth' => $systemHealth,
        ];
    }

    private function doctorSummary(?User $user): array
    {
        $doctor = $user?->doctor;

        if (! $doctor) {
            return [
                'today' => 0,
                'upcoming' => 0,
                'pending' => 0,
                'earningsCents' => 0,
                'currency' => 'BDT',
            ];
        }

        $today = now()->toDateString();

        $todayCount = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $today)
            ->where('status', '!=', 'cancelled')
            ->count();

        $upcomingCount = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', '>', $today)
            ->where('status', '!=', 'cancelled')
            ->count();

        $pendingCount = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->where('status', 'pending')
            ->count();

        $earnings = Payment::query()
            ->where('doctor_id', $doctor->id)
            ->where('status', 'paid')
            ->sum('paid_amount');

        return [
            'today' => $todayCount,
            'upcoming' => $upcomingCount,
            'pending' => $pendingCount,
            'earningsCents' => (int) round(((float) $earnings) * 100),
            'currency' => 'BDT',
        ];
    }

    private function patientSummary(?User $user): array
    {
        $patient = $user?->patient;

        if (! $patient) {
            return [
                'upcomingAppointments' => 0,
                'pendingPayments' => 0,
            ];
        }

        return [
            'upcomingAppointments' => Appointment::query()
                ->where('patient_id', $patient->id)
                ->whereDate('appointment_date', '>=', now()->toDateString())
                ->where('status', '!=', 'cancelled')
                ->count(),
            'pendingPayments' => Appointment::query()
                ->where('patient_id', $patient->id)
                ->where('payment_status', '!=', 'paid')
                ->where('status', '!=', 'cancelled')
                ->count(),
        ];
    }

    private function modulesFor(?string $role): array
    {
        return match ($role) {
            'admin' => ['dashboard', 'users', 'doctors', 'appointments', 'payments', 'content', 'reports', 'notifications', 'support', 'roles', 'settings', 'audit'],
            'doctor' => ['dashboard', 'today', 'upcoming', 'pending', 'records', 'prescriptions', 'schedule', 'earnings', 'notifications'],
            default => ['dashboard', 'appointments', 'records'],
        };
    }
}
