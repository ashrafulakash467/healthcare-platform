<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DoctorController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $doctors = $this->doctorCatalog();

        $search = strtolower(trim((string) $request->query('search', '')));
        $specialty = strtolower(trim((string) $request->query('specialty', '')));
        $location = strtolower(trim((string) $request->query('location', '')));
        $gender = strtolower(trim((string) $request->query('gender', '')));
        $availability = strtolower(trim((string) $request->query('availability', '')));
        $sort = (string) $request->query('sort', 'name_asc');

        $filtered = $doctors->filter(function (array $doctor) use ($search, $specialty, $location, $gender, $availability): bool {
            if ($search !== '' && ! str_contains(strtolower($doctor['name']), $search)) {
                return false;
            }

            if ($specialty !== '' && strtolower($doctor['specialty']) !== $specialty) {
                return false;
            }

            if ($location !== '' && strtolower($doctor['location']) !== $location) {
                return false;
            }

            if ($gender !== '' && strtolower($doctor['gender']) !== $gender) {
                return false;
            }

            if ($availability === 'available' && ! $doctor['isAvailable']) {
                return false;
            }

            if ($availability === 'unavailable' && $doctor['isAvailable']) {
                return false;
            }

            return true;
        })->values();

        $sorted = match ($sort) {
            'name_desc' => $filtered->sortByDesc('name')->values(),
            'specialty_asc' => $filtered->sortBy('specialty')->values(),
            'location_asc' => $filtered->sortBy('location')->values(),
            'newest' => $filtered->sortByDesc('id')->values(),
            default => $filtered->sortBy('name')->values(),
        };

        $page = max((int) $request->query('page', 1), 1);
        $limit = min(max((int) $request->query('limit', 14), 1), 50);
        $total = $sorted->count();
        $totalPages = max((int) ceil($total / $limit), 1);
        $offset = ($page - 1) * $limit;

        return response()->json([
            'data' => $sorted->slice($offset, $limit)->values(),
            'filters' => [
                'specialties' => $doctors->pluck('specialty')->unique()->values(),
                'locations' => $doctors->pluck('location')->unique()->values(),
                'genders' => $doctors->pluck('gender')->unique()->values(),
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
        $doctor = $this->doctorById($doctorId);

        return response()->json([
            'doctor' => $doctor,
        ]);
    }

    private function doctorCatalog(): Collection
    {
        return collect([
            $this->doctorById('1'),
            $this->doctorById('2'),
            $this->doctorById('3'),
            [
                'id' => 4,
                'name' => 'Dr. Mahmudul Islam',
                'email' => 'mahmudul.islam@example.com',
                'phone' => '01710000004',
                'specialty' => 'Pediatrics',
                'location' => 'Sylhet',
                'gender' => 'Male',
                'isAvailable' => true,
                'imageUrl' => '/window.svg',
                'clinics' => [
                    ['id' => 3, 'name' => 'Sylhet Care Center', 'location' => 'Sylhet'],
                ],
            ],
            [
                'id' => 5,
                'name' => 'Dr. Sarah Khan',
                'email' => 'sarah.khan@example.com',
                'phone' => '01710000005',
                'specialty' => 'Medicine',
                'location' => 'Dhaka',
                'gender' => 'Female',
                'isAvailable' => false,
                'imageUrl' => '/file.svg',
                'clinics' => [
                    ['id' => 1, 'name' => 'Central Care Hospital', 'location' => 'Dhaka'],
                ],
            ],
        ]);
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
}
