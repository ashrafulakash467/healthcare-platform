<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function index(): JsonResponse
    {
        $pendingDoctors = User::query()
            ->role('doctor')
            ->where('status', 'pending_verification')
            ->latest()
            ->get()
            ->map(fn (User $user) => $this->formatDoctorVerification($user))
            ->values();

        $approved = User::query()->role('doctor')->where('status', 'active')->count();
        $rejected = User::query()->role('doctor')->where('status', 'rejected')->count();

        return response()->json([
            'pendingDoctors' => $pendingDoctors,
            'summary' => [
                'pending' => $pendingDoctors->count(),
                'approved' => $approved,
                'rejected' => $rejected,
            ],
        ]);
    }

    public function decision(Request $request, string $doctorId): JsonResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'string', 'in:approve,reject'],
            'rejectionReason' => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor = User::query()->role('doctor')->findOrFail($doctorId);

        if ($data['decision'] === 'reject' && blank($data['rejectionReason'] ?? null)) {
            throw ValidationException::withMessages([
                'rejectionReason' => ['A rejection reason is required when rejecting a doctor.'],
            ]);
        }

        $doctor->forceFill([
            'status' => $data['decision'] === 'approve' ? 'active' : 'rejected',
        ])->save();

        return response()->json([
            'message' => $data['decision'] === 'approve'
                ? 'Doctor approved successfully.'
                : 'Doctor rejected successfully.',
            'doctor' => $this->formatDoctorVerification($doctor->fresh()),
        ]);
    }

    private function formatDoctorVerification(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'specialty' => 'General Medicine',
            'qualifications' => ['MBBS'],
            'experienceYears' => 0,
            'licenseNumber' => null,
            'licenseIssuedBy' => null,
            'profileSummary' => 'Verification profile pending completion.',
            'location' => 'Unavailable',
            'gender' => 'Unspecified',
            'verificationStatus' => $user->status,
            'rejectionReason' => $user->status === 'rejected' ? 'Rejected by admin.' : null,
            'reviewedAt' => $user->updated_at?->toISOString(),
            'verifiedAt' => $user->status === 'active' ? $user->updated_at?->toISOString() : null,
            'isAvailable' => $user->status === 'active',
            'isVerified' => $user->status === 'active',
            'isActive' => $user->status === 'active',
            'imageUrl' => 'https://via.placeholder.com/256',
            'createdAt' => $user->created_at?->toISOString(),
        ];
    }
}
