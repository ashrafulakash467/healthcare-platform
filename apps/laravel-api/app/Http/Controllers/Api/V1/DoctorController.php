<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Hospital;
use App\Models\User;
use App\Services\DoctorSlotSyncService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DoctorController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $doctors = $this->publicDoctorCollection();

        $search = strtolower(trim((string) $request->query('search', '')));
        $specialty = strtolower(trim((string) $request->query('specialty', '')));
        $location = strtolower(trim((string) $request->query('location', '')));
        $gender = strtolower(trim((string) $request->query('gender', '')));
        $availability = strtolower(trim((string) $request->query('availability', '')));
        $sort = (string) $request->query('sort', 'name_asc');

        $filtered = $doctors->filter(function (Doctor $doctor) use ($search, $specialty, $location, $gender, $availability): bool {
            $user = $doctor->user;
            $doctorLocation = strtolower($this->doctorLocation($doctor));

            if ($search !== '') {
                $haystack = strtolower(implode(' ', array_filter([
                    $user?->name,
                    $user?->email,
                    $user?->phone,
                    $doctor->specialty,
                    $doctor->sub_specialty,
                    $doctor->license_no,
                    $doctor->city,
                    $doctor->chamber_address,
                ])));

                if (! str_contains($haystack, $search)) {
                    return false;
                }
            }

            if ($specialty !== '' && strtolower((string) $doctor->specialty) !== $specialty) {
                return false;
            }

            if ($location !== '' && ! str_contains($doctorLocation, $location)) {
                return false;
            }

            if ($gender !== '' && strtolower((string) $doctor->gender) !== $gender) {
                return false;
            }

            if ($availability === 'available' && ! $this->isDoctorAvailable($doctor)) {
                return false;
            }

            if ($availability === 'unavailable' && $this->isDoctorAvailable($doctor)) {
                return false;
            }

            return true;
        })->values();

        $sorted = match ($sort) {
            'name_desc' => $filtered->sortByDesc(fn (Doctor $doctor) => $doctor->user?->name ?? '')->values(),
            'specialty_asc' => $filtered->sortBy(fn (Doctor $doctor) => $doctor->specialty ?? '')->values(),
            'location_asc' => $filtered->sortBy(fn (Doctor $doctor) => $this->doctorLocation($doctor))->values(),
            'newest' => $filtered->sortByDesc(fn (Doctor $doctor) => $doctor->id)->values(),
            default => $filtered->sortBy(fn (Doctor $doctor) => $doctor->user?->name ?? '')->values(),
        };

        $page = max((int) $request->query('page', 1), 1);
        $limit = min(max((int) $request->query('limit', 14), 1), 50);
        $total = $sorted->count();
        $totalPages = max((int) ceil($total / $limit), 1);
        $offset = ($page - 1) * $limit;

        return response()->json([
            'data' => $sorted->slice($offset, $limit)->map(fn (Doctor $doctor) => $this->formatPublicDoctor($doctor))->values(),
            'filters' => [
                'specialties' => $doctors->pluck('specialty')->filter()->unique()->values(),
                'locations' => $doctors->map(fn (Doctor $doctor) => $this->doctorLocation($doctor))->filter()->unique()->values(),
                'genders' => $doctors->pluck('gender')->filter()->unique()->values(),
            ],
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ]);
    }

    public function show(string $doctorId): JsonResponse
    {
        $doctor = Doctor::query()
            ->with(['user', 'primaryHospital', 'hospitals'])
            ->findOrFail($doctorId);

        return response()->json([
            'doctor' => $this->formatPublicDoctor($doctor),
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Doctor::query()
            ->with(['user', 'primaryHospital', 'hospitals'])
            ->latest();

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search): void {
                $builder->whereHas('user', function ($userQuery) use ($search): void {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('specialty', 'like', "%{$search}%")
                ->orWhere('license_no', 'like', "%{$search}%")
                ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->input('verification_status'));
        }

        $doctors = $query->get()->map(fn (Doctor $doctor) => $this->formatAdminDoctor($doctor))->values();

        return response()->json([
            'doctors' => $doctors,
            'total' => $doctors->count(),
        ]);
    }

    public function adminStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'specialty' => ['required', 'string', 'max:255'],
            'sub_specialty' => ['nullable', 'string', 'max:255'],
            'qualification' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'gender' => ['nullable', 'string', 'max:20'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'follow_up_fee' => ['nullable', 'numeric', 'min:0'],
            'chamber_address' => ['nullable', 'string', 'max:500'],
            'hospital_ids' => ['nullable'],
            'available_dates' => ['nullable'],
            'available_time_slots' => ['nullable'],
            'city' => ['nullable', 'string', 'max:255'],
            'license_no' => ['nullable', 'string', 'max:255', 'unique:doctors,license_no'],
            'image' => ['nullable', 'image', 'max:4096'],
            'verification_status' => ['nullable', Rule::in(['pending', 'approved', 'suspended', 'unavailable'])],
            'status' => ['nullable', Rule::in(['active', 'offline', 'unavailable'])],
        ]);

        $availableDates = $this->normalizeListField($data['available_dates'] ?? null);
        $availableTimeSlots = $this->normalizeListField($data['available_time_slots'] ?? null);
        $hospitalIds = $this->normalizeHospitalIds($data['hospital_ids'] ?? null);

        $doctor = DB::transaction(function () use ($data, $request): Doctor {
            $user = User::create([
                'name' => $data['name'],
                'username' => Str::slug($data['name']).'-'.Str::lower(Str::random(6)),
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'status' => 'active',
            ]);

            $user->assignRole('doctor');

            $doctor = Doctor::create([
                'user_id' => $user->id,
                'license_no' => $data['license_no'] ?? null,
                'specialty' => $data['specialty'],
                'sub_specialty' => $data['sub_specialty'] ?? null,
                'bio' => $data['bio'] ?? null,
                'qualification' => $data['qualification'] ?? null,
                'gender' => $data['gender'] ?? null,
                'consultation_fee' => $data['consultation_fee'] ?? 0,
                'follow_up_fee' => $data['follow_up_fee'] ?? null,
                'image_path' => null,
                'chamber_address' => $data['chamber_address'] ?? null,
                'available_dates' => $availableDates,
                'available_time_slots' => $availableTimeSlots,
                'city' => $data['city'] ?? null,
                'state' => null,
                'country' => null,
                'verification_status' => $data['verification_status'] ?? 'pending',
                'status' => $data['status'] ?? 'active',
            ]);

            if ($request->hasFile('image')) {
                $doctor->forceFill([
                    'image_path' => $this->storeDoctorImage($request->file('image')),
                ])->save();
            }

            $this->syncDoctorHospitals($doctor, $hospitalIds);
            app(DoctorSlotSyncService::class)->sync($doctor->fresh(['schedules', 'primaryHospital', 'hospitals']));

            return $doctor->fresh(['user', 'primaryHospital', 'hospitals']);
        });

        return response()->json([
            'message' => 'Doctor created successfully.',
            'doctor' => $this->formatAdminDoctor($doctor),
        ], 201);
    }

    public function adminUpdate(Request $request, string $doctorId): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'specialty' => ['sometimes', 'string', 'max:255'],
            'sub_specialty' => ['sometimes', 'nullable', 'string', 'max:255'],
            'qualification' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio' => ['sometimes', 'nullable', 'string'],
            'gender' => ['sometimes', 'nullable', 'string', 'max:20'],
            'consultation_fee' => ['sometimes', 'numeric', 'min:0'],
            'follow_up_fee' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'chamber_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'hospital_ids' => ['sometimes', 'nullable'],
            'available_dates' => ['sometimes', 'nullable'],
            'available_time_slots' => ['sometimes', 'nullable'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'license_no' => ['sometimes', 'nullable', 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'verification_status' => ['sometimes', Rule::in(['pending', 'approved', 'suspended', 'unavailable'])],
            'status' => ['sometimes', Rule::in(['active', 'offline', 'unavailable', 'inactive', 'suspended', 'deleted'])],
        ]);

        if (array_key_exists('available_dates', $data)) {
            $data['available_dates'] = $this->normalizeListField($data['available_dates']);
        } else {
            unset($data['available_dates']);
        }

        if (array_key_exists('available_time_slots', $data)) {
            $data['available_time_slots'] = $this->normalizeListField($data['available_time_slots']);
        } else {
            unset($data['available_time_slots']);
        }

        $hospitalIds = array_key_exists('hospital_ids', $data)
            ? $this->normalizeHospitalIds($data['hospital_ids'])
            : null;

        $doctor = Doctor::query()->with('user')->findOrFail($doctorId);

        if ($request->hasFile('image')) {
            $this->deleteDoctorImage($doctor->image_path);
            $data['image_path'] = $this->storeDoctorImage($request->file('image'));
        }

        if (isset($data['name']) || isset($data['email']) || isset($data['phone'])) {
            $doctor->user?->update(array_filter([
                'name' => $data['name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
            ], static fn ($value) => $value !== null));
        }

        if (array_key_exists('password', $data) && filled($data['password'])) {
            $doctor->user?->forceFill([
                'password' => Hash::make($data['password']),
            ])->save();
        }

        if (
            isset($data['status']) &&
            $doctor->user &&
            in_array($data['status'], ['active', 'approved'], true)
        ) {
            $doctor->user->forceFill([
                'status' => 'active',
            ])->save();
        }

        $doctor->fill(array_intersect_key($data, array_flip([
            'specialty',
            'sub_specialty',
            'qualification',
            'bio',
            'gender',
            'consultation_fee',
            'follow_up_fee',
            'chamber_address',
            'available_dates',
            'available_time_slots',
            'city',
            'license_no',
            'image_path',
            'verification_status',
            'status',
        ])));
        $doctor->save();

        if ($hospitalIds !== null) {
            $this->syncDoctorHospitals($doctor, $hospitalIds);
        }

        app(DoctorSlotSyncService::class)->sync($doctor->fresh(['schedules', 'primaryHospital', 'hospitals']));

        return response()->json([
            'message' => 'Doctor updated successfully.',
            'doctor' => $this->formatAdminDoctor($doctor->fresh(['user', 'primaryHospital', 'hospitals'])),
        ]);
    }

    public function adminDestroy(string $doctorId): JsonResponse
    {
        $doctor = Doctor::query()->with('user')->findOrFail($doctorId);

        $doctor->delete();

        $doctor->user?->forceFill([
            'status' => 'deleted',
        ])->save();

        return response()->json([
            'message' => 'Doctor deleted successfully.',
        ]);
    }

    private function publicDoctorCollection(): Collection
    {
        return Doctor::query()
            ->with(['user', 'primaryHospital', 'hospitals'])
            ->whereHas('user', function ($query): void {
                $query->where('status', '!=', 'deleted');
            })
            ->get();
    }

    private function formatPublicDoctor(Doctor $doctor): array
    {
        $clinics = $this->clinicsForDoctor($doctor);

        return [
            'id' => (string) $doctor->id,
            'name' => $doctor->user?->name ?? 'Unknown Doctor',
            'email' => $doctor->user?->email ?? '',
            'phone' => $doctor->user?->phone ?? '',
            'specialty' => $doctor->specialty ?? 'General Medicine',
            'consultationFee' => $doctor->consultation_fee,
            'location' => $this->doctorLocation($doctor),
            'gender' => $doctor->gender ?? 'Unspecified',
            'isAvailable' => $this->isDoctorAvailable($doctor),
            'imagePath' => $doctor->image_path,
            'imageUrl' => $this->doctorImageUrl($doctor),
            'chamberAddress' => $doctor->chamber_address,
            'availableDates' => $this->normalizeListField($doctor->available_dates),
            'availableTimeSlots' => $this->normalizeListField($doctor->available_time_slots),
            'hospitalIds' => $doctor->hospitals->pluck('id')->map(fn ($id): string => (string) $id)->values()->all(),
            'clinics' => $clinics,
        ];
    }

    private function formatAdminDoctor(Doctor $doctor): array
    {
        $user = $doctor->user;
        $hospital = $doctor->primaryHospital;

        return [
            'id' => (string) $doctor->id,
            'userId' => (string) $doctor->user_id,
            'name' => $user?->name ?? 'Unknown Doctor',
            'email' => $user?->email ?? '',
            'phone' => $user?->phone ?? '',
            'specialty' => $doctor->specialty ?? 'General Medicine',
            'subSpecialty' => $doctor->sub_specialty,
            'qualification' => $doctor->qualification,
            'bio' => $doctor->bio,
            'gender' => $doctor->gender,
            'consultationFee' => $doctor->consultation_fee,
            'followUpFee' => $doctor->follow_up_fee,
            'licenseNo' => $doctor->license_no,
            'chamberAddress' => $doctor->chamber_address,
            'availableDates' => $this->normalizeListField($doctor->available_dates),
            'availableTimeSlots' => $this->normalizeListField($doctor->available_time_slots),
            'city' => $doctor->city,
            'state' => $doctor->state,
            'country' => $doctor->country,
            'imagePath' => $doctor->image_path,
            'imageUrl' => $this->doctorImageUrl($doctor),
            'verificationStatus' => $doctor->verification_status,
            'verifiedAt' => $doctor->verified_at?->toISOString(),
            'status' => $doctor->status,
            'hospitalIds' => $doctor->hospitals->pluck('id')->map(fn ($id): string => (string) $id)->values()->all(),
            'hospital' => $hospital ? [
                'id' => (string) $hospital->id,
                'name' => $hospital->name,
                'city' => $hospital->city,
            ] : null,
            'clinics' => $this->clinicsForDoctor($doctor),
            'createdAt' => $doctor->created_at?->toISOString(),
            'updatedAt' => $doctor->updated_at?->toISOString(),
        ];
    }

    private function clinicsForDoctor(Doctor $doctor): array
    {
        $clinics = $doctor->hospitals->map(function ($hospital): array {
            return [
                'id' => (string) $hospital->id,
                'name' => $hospital->name,
                'location' => $hospital->city ?? $hospital->state ?? $hospital->country ?? '',
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

    private function normalizeHospitalIds(mixed $value): array
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $value = $decoded;
            } else {
                $value = [$value];
            }
        }

        if (! is_array($value)) {
            return [];
        }

        $ids = collect($value)
            ->map(fn ($item): int => (int) trim((string) $item))
            ->filter(fn ($item): bool => $item > 0)
            ->unique()
            ->values()
            ->all();

        if (! $ids) {
            return [];
        }

        return Hospital::query()
            ->whereIn('id', $ids)
            ->pluck('id')
            ->map(fn ($id): string => (string) $id)
            ->values()
            ->all();
    }

    private function syncDoctorHospitals(Doctor $doctor, array $hospitalIds): void
    {
        $doctor->hospitals()->sync($hospitalIds);

        $doctor->forceFill([
            'primary_hospital_id' => $hospitalIds[0] ?? null,
        ])->save();
    }

    private function doctorLocation(Doctor $doctor): string
    {
        return $doctor->city
            ?: $doctor->primaryHospital?->city
            ?: $doctor->state
            ?: $doctor->country
            ?: 'Unavailable';
    }

    private function doctorImageUrl(Doctor $doctor): string
    {
        if (blank($doctor->image_path)) {
            return '/images/doctors/doc1.png';
        }

        if (str_starts_with($doctor->image_path, 'http://') || str_starts_with($doctor->image_path, 'https://')) {
            return $doctor->image_path;
        }

        if (str_starts_with($doctor->image_path, '/images/doctors/')) {
            return $doctor->image_path;
        }

        if (str_starts_with($doctor->image_path, 'images/doctors/')) {
            return '/'.$doctor->image_path;
        }

        if (str_starts_with($doctor->image_path, '/')) {
            return $doctor->image_path;
        }

        $filename = basename($doctor->image_path);
        $localPath = $this->doctorImageDirectory().DIRECTORY_SEPARATOR.$filename;

        if (is_file($localPath)) {
            return '/images/doctors/'.$filename;
        }

        $legacyWebPath = $this->legacyWebDoctorImageDirectory().DIRECTORY_SEPARATOR.$filename;
        if (is_file($legacyWebPath)) {
            return '/images/doctors/'.$filename;
        }

        $legacyPath = 'doctors/'.$filename;
        if (Storage::disk('public')->exists($legacyPath)) {
            return url('/doctor-images/'.$filename);
        }

        return '/images/doctors/'.$filename;
    }

    private function isDoctorAvailable(Doctor $doctor): bool
    {
        return $doctor->status === 'active' && $doctor->verification_status === 'approved';
    }

    private function normalizeListField(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map(
                static fn ($item) => trim((string) $item),
                $value,
            )));
        }

        if (! is_string($value)) {
            return [];
        }

        $trimmed = trim($value);
        if ($trimmed === '') {
            return [];
        }

        $decoded = json_decode($trimmed, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return array_values(array_filter(array_map(
                static fn ($item) => trim((string) $item),
                $decoded,
            )));
        }

        $parts = preg_split('/[\r\n,]+/', $trimmed) ?: [];

        return array_values(array_filter(array_map(
            static fn ($item) => trim((string) $item),
            $parts,
        )));
    }

    public function image(string $filename)
    {
        $safeFilename = basename($filename);
        $localPath = $this->doctorImageDirectory().DIRECTORY_SEPARATOR.$safeFilename;

        if (is_file($localPath)) {
            return response()->file($localPath);
        }

        $webPublicPath = $this->webDoctorImageDirectory().DIRECTORY_SEPARATOR.$safeFilename;
        if (is_file($webPublicPath)) {
            return response()->file($webPublicPath);
        }

        $legacyPath = 'doctors/'.$safeFilename;
        if (Storage::disk('public')->exists($legacyPath)) {
            return response()->file(Storage::disk('public')->path($legacyPath));
        }

        abort(404);
    }

    private function storeDoctorImage($uploadedImage): string
    {
        $directory = $this->doctorImageDirectory();
        $extension = strtolower((string) ($uploadedImage->getClientOriginalExtension() ?: $uploadedImage->extension() ?: 'jpg'));
        $extension = preg_match('/^[a-z0-9]+$/', $extension) ? $extension : 'jpg';
        $filename = (string) Str::uuid().'.'.$extension;

        $uploadedImage->move($directory, $filename);

        return 'images/doctors/'.$filename;
    }

    private function deleteDoctorImage(?string $imagePath): void
    {
        if (blank($imagePath) || str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return;
        }

        $filename = basename($imagePath);
        $localPath = $this->doctorImageDirectory().DIRECTORY_SEPARATOR.$filename;

        if (is_file($localPath)) {
            @unlink($localPath);
        }

        $legacyWebPath = $this->legacyWebDoctorImageDirectory().DIRECTORY_SEPARATOR.$filename;
        if (is_file($legacyWebPath)) {
            @unlink($legacyWebPath);
        }

        $legacyPath = 'doctors/'.$filename;
        if (Storage::disk('public')->exists($legacyPath)) {
            Storage::disk('public')->delete($legacyPath);
        }
    }

    private function doctorImageDirectory(): string
    {
        $directory = $this->webDoctorImageDirectory();

        if (! is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        return $directory;
    }

    private function webDoctorImageDirectory(): string
    {
        return dirname(base_path()).DIRECTORY_SEPARATOR.'web'.DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'images'.DIRECTORY_SEPARATOR.'doctors';
    }

    private function legacyWebDoctorImageDirectory(): string
    {
        return dirname(dirname(base_path())).DIRECTORY_SEPARATOR.'web'.DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'images'.DIRECTORY_SEPARATOR.'doctors';
    }
}
