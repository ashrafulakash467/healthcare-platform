<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Hospital;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function index(): JsonResponse
    {
        $pendingDoctors = Doctor::query()
            ->with(['user', 'primaryHospital'])
            ->where('verification_status', 'pending')
            ->latest()
            ->get()
            ->map(fn (Doctor $doctor) => $this->formatDoctorVerification($doctor))
            ->values();

        $approved = Doctor::query()->where('verification_status', 'approved')->count();
        $rejected = Doctor::query()->where('verification_status', 'rejected')->count();

        return response()->json([
            'pendingDoctors' => $pendingDoctors,
            'summary' => [
                'pending' => $pendingDoctors->count(),
                'approved' => $approved,
                'rejected' => $rejected,
            ],
        ]);
    }

    public function users(): JsonResponse
    {
        $users = User::query()
            ->with([
                'roles',
                'doctor.primaryHospital',
                'patient.hospital',
                'createdHospitals',
            ])
            ->where(function ($query): void {
                $query->whereNull('status')
                    ->orWhere('status', '!=', 'deleted');
            })
            ->latest()
            ->get()
            ->map(fn (User $user) => $this->formatUserCard($user))
            ->values();

        return response()->json([
            'users' => $users,
            'total' => $users->count(),
        ]);
    }

    public function hospitals(): JsonResponse
    {
        $hospitals = Hospital::query()
            ->select(['id', 'name', 'city', 'status'])
            ->where(function ($query): void {
                $query->whereNull('status')
                    ->orWhere('status', 'active');
            })
            ->orderBy('name')
            ->get()
            ->map(fn (Hospital $hospital): array => [
                'id' => (string) $hospital->id,
                'name' => $hospital->name,
                'city' => $hospital->city,
                'status' => $hospital->status,
            ])
            ->values();

        return response()->json([
            'hospitals' => $hospitals,
            'total' => $hospitals->count(),
        ]);
    }

    public function destroy(string $userId): JsonResponse
    {
        $user = User::query()
            ->with(['doctor', 'patient', 'createdHospitals'])
            ->findOrFail($userId);

        Gate::authorize('delete', $user);

        DB::transaction(function () use ($user): void {
            $user->syncRoles([]);
            $user->syncPermissions([]);

            DB::table('personal_access_tokens')
                ->where('tokenable_type', User::class)
                ->where('tokenable_id', $user->id)
                ->delete();

            DB::table('sessions')
                ->where('user_id', $user->id)
                ->delete();

            $user->delete();
        });

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    public function decision(Request $request, string $doctorId): JsonResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'string', 'in:approve,reject'],
            'rejectionReason' => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor = Doctor::query()->with('user')->findOrFail($doctorId);

        if ($data['decision'] === 'reject' && blank($data['rejectionReason'] ?? null)) {
            throw ValidationException::withMessages([
                'rejectionReason' => ['A rejection reason is required when rejecting a doctor.'],
            ]);
        }

        $doctor->forceFill([
            'verification_status' => $data['decision'] === 'approve' ? 'approved' : 'rejected',
            'status' => $data['decision'] === 'approve' ? 'active' : 'inactive',
            'verified_at' => $data['decision'] === 'approve' ? now() : null,
        ])->save();

        $doctor->user?->forceFill([
            'status' => $data['decision'] === 'approve' ? 'active' : 'rejected',
        ])->save();

        return response()->json([
            'message' => $data['decision'] === 'approve'
                ? 'Doctor approved successfully.'
                : 'Doctor rejected successfully.',
            'doctor' => $this->formatDoctorVerification($doctor->fresh(['user', 'primaryHospital'])),
        ]);
    }

    private function formatDoctorVerification(Doctor $doctor): array
    {
        $user = $doctor->user;
        $hospital = $doctor->primaryHospital;
        $isActive = $doctor->verification_status === 'approved' && $doctor->status === 'active';

        return [
            'id' => (string) $doctor->id,
            'name' => $user?->name ?? 'Unknown Doctor',
            'email' => $user?->email ?? '',
            'phone' => $user?->phone ?? '',
            'specialty' => $doctor->specialty ?? 'General Medicine',
            'qualifications' => array_values(array_filter(array_map('trim', explode(',', (string) $doctor->qualification)))),
            'experienceYears' => max(0, $doctor->created_at ? now()->diffInYears($doctor->created_at) : 0),
            'licenseNumber' => $doctor->license_no,
            'licenseIssuedBy' => $doctor->license_no ? 'Bangladesh Medical and Dental Council' : null,
            'profileSummary' => $doctor->bio ?: 'Verification profile available in the database.',
            'location' => $doctor->city ?: $hospital?->city ?: 'Unavailable',
            'gender' => $doctor->gender ?? 'Unspecified',
            'verificationStatus' => $doctor->verification_status,
            'rejectionReason' => $doctor->verification_status === 'rejected'
                ? 'Rejected by admin.'
                : null,
            'reviewedAt' => $doctor->updated_at?->toISOString(),
            'verifiedAt' => $doctor->verification_status === 'approved' ? $doctor->verified_at?->toISOString() : null,
            'isAvailable' => $isActive,
            'isVerified' => $doctor->verification_status === 'approved',
            'isActive' => $isActive,
            'imageUrl' => $this->doctorImageUrl($doctor->image_path),
            'createdAt' => $doctor->created_at?->toISOString(),
        ];
    }

    private function formatUserCard(User $user): array
    {
        $roles = $user->getRoleNames()->values()->all();
        $doctor = $user->doctor;
        $patient = $user->patient;
        $createdHospitals = $user->createdHospitals->map(fn ($hospital): array => [
            'id' => (string) $hospital->id,
            'name' => $hospital->name,
            'city' => $hospital->city,
            'status' => $hospital->status,
        ])->values()->all();

        $primaryRole = $roles[0] ?? $this->inferUserRole($user);

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status ?? 'active',
            'roles' => $roles,
            'role' => $primaryRole,
            'roleLabel' => $this->userRoleLabel($primaryRole),
            'lastLoginAt' => $user->last_login_at?->toISOString(),
            'createdAt' => $user->created_at?->toISOString(),
            'twoFactorEnabled' => (bool) $user->two_factor_enabled,
            'doctor' => $doctor ? [
                'id' => (string) $doctor->id,
                'specialty' => $doctor->specialty,
                'licenseNo' => $doctor->license_no,
                'gender' => $doctor->gender,
                'verificationStatus' => $doctor->verification_status,
                'status' => $doctor->status,
                'hospital' => $doctor->primaryHospital ? [
                    'id' => (string) $doctor->primaryHospital->id,
                    'name' => $doctor->primaryHospital->name,
                    'city' => $doctor->primaryHospital->city,
                ] : null,
            ] : null,
            'patient' => $patient ? [
                'id' => (string) $patient->id,
                'mrn' => $patient->mrn,
                'gender' => $patient->gender,
                'bloodGroup' => $patient->blood_group,
                'dateOfBirth' => $patient->date_of_birth?->toDateString(),
                'city' => $patient->city,
                'status' => $patient->status,
                'hospital' => $patient->hospital ? [
                    'id' => (string) $patient->hospital->id,
                    'name' => $patient->hospital->name,
                    'city' => $patient->hospital->city,
                ] : null,
            ] : null,
            'createdHospitals' => $createdHospitals,
        ];
    }

    private function inferUserRole(User $user): string
    {
        if ($user->doctor) {
            return 'doctor';
        }

        if ($user->patient) {
            return 'patient';
        }

        if ($user->createdHospitals->isNotEmpty()) {
            return 'hospital';
        }

        return 'user';
    }

    private function userRoleLabel(string $role): string
    {
        return match ($role) {
            'super-admin' => 'Super Admin',
            'admin' => 'Admin',
            'doctor' => 'Doctor',
            'patient' => 'Patient',
            'hospital' => 'Hospital Admin',
            default => 'User',
        };
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
            return url('/api/doctor-images/'.$filename);
        }

        return Storage::disk('public')->url($imagePath);
    }
}
