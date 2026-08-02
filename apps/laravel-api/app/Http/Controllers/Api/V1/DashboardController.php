<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'role' => $user->getRoleNames()->first(),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
            ],
            'modules' => $this->modulesFor($user->getRoleNames()->first()),
            'summary' => $this->summaryFor($user->getRoleNames()->first()),
        ]);
    }

    public function admin(Request $request): JsonResponse
    {
        return response()->json([
            'role' => 'admin',
            'modules' => [
                'dashboard',
                'users',
                'doctors',
                'hospitals',
                'appointments',
                'payments',
                'content',
                'reports',
                'notifications',
                'support',
                'roles',
                'settings',
                'audit',
            ],
            'summary' => [
                'pendingDoctors' => 14,
                'pendingRefunds' => 6,
                'openTickets' => 9,
                'systemHealth' => 98,
            ],
        ]);
    }

    public function doctor(Request $request): JsonResponse
    {
        return response()->json([
            'role' => 'doctor',
            'modules' => [
                'dashboard',
                'today',
                'upcoming',
                'pending',
                'records',
                'prescriptions',
                'schedule',
                'earnings',
                'notifications',
            ],
            'summary' => [
                'todayAppointments' => 0,
                'upcomingAppointments' => 0,
                'pendingRequests' => 0,
            ],
        ]);
    }

    public function patient(Request $request): JsonResponse
    {
        return response()->json([
            'role' => 'patient',
            'modules' => [
                'dashboard',
                'appointments',
                'records',
            ],
            'summary' => [
                'upcomingAppointments' => 0,
                'pendingPayments' => 0,
            ],
        ]);
    }

    public function hospital(Request $request): JsonResponse
    {
        return response()->json([
            'role' => 'hospital',
            'modules' => [
                'dashboard',
                'doctors',
                'appointments',
                'payments',
                'reports',
            ],
            'summary' => [
                'onboardedDoctors' => 0,
                'activeClinics' => 0,
            ],
        ]);
    }

    private function modulesFor(?string $role): array
    {
        return match ($role) {
            'admin' => ['dashboard', 'users', 'doctors', 'hospitals', 'appointments', 'payments', 'content', 'reports', 'notifications', 'support', 'roles', 'settings', 'audit'],
            'doctor' => ['dashboard', 'today', 'upcoming', 'pending', 'records', 'prescriptions', 'schedule', 'earnings', 'notifications'],
            'hospital' => ['dashboard', 'doctors', 'appointments', 'payments', 'reports'],
            default => ['dashboard', 'appointments', 'records'],
        };
    }

    private function summaryFor(?string $role): array
    {
        return match ($role) {
            'admin' => ['systemHealth' => 98],
            'doctor' => ['todayAppointments' => 0],
            'hospital' => ['onboardedDoctors' => 0],
            default => ['upcomingAppointments' => 0],
        };
    }
}
