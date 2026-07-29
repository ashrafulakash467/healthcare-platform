<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $doctors = collect([
            [
                'id' => 1,
                'name' => 'Dr. Amina Rahman',
                'specialty' => 'Cardiology',
                'location' => 'Dhaka',
                'gender' => 'Female',
                'isAvailable' => true,
                'imageUrl' => '/vercel.svg',
            ],
            [
                'id' => 2,
                'name' => 'Dr. Tanvir Hasan',
                'specialty' => 'Dermatology',
                'location' => 'Chattogram',
                'gender' => 'Male',
                'isAvailable' => true,
                'imageUrl' => '/next.svg',
            ],
            [
                'id' => 3,
                'name' => 'Dr. Nusrat Jahan',
                'specialty' => 'Gynecology',
                'location' => 'Dhaka',
                'gender' => 'Female',
                'isAvailable' => false,
                'imageUrl' => '/globe.svg',
            ],
            [
                'id' => 4,
                'name' => 'Dr. Mahmudul Islam',
                'specialty' => 'Pediatrics',
                'location' => 'Sylhet',
                'gender' => 'Male',
                'isAvailable' => true,
                'imageUrl' => '/window.svg',
            ],
            [
                'id' => 5,
                'name' => 'Dr. Sarah Khan',
                'specialty' => 'Medicine',
                'location' => 'Dhaka',
                'gender' => 'Female',
                'isAvailable' => false,
                'imageUrl' => '/file.svg',
            ],
        ]);

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
}
