<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
