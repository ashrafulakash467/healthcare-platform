<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'email' => 'admin@healthcare.com',
                'phone' => '01700000001',
                'password' => 'Admin@12345',
                'role' => 'admin',
                'status' => 'active',
            ],
            [
                'name' => 'Doctor User',
                'username' => 'doctor',
                'email' => 'doctor@healthcare.com',
                'phone' => '01700000002',
                'password' => 'Doctor@12345',
                'role' => 'doctor',
                'status' => 'active',
            ],
            [
                'name' => 'Patient User',
                'username' => 'patient',
                'email' => 'patient@healthcare.com',
                'phone' => '01700000003',
                'password' => 'Patient@12345',
                'role' => 'patient',
                'status' => 'active',
            ],
            [
                'name' => 'Hospital Admin',
                'username' => 'hospital',
                'email' => 'hospital@healthcare.com',
                'phone' => '01700000004',
                'password' => 'Hospital@12345',
                'role' => 'hospital',
                'status' => 'active',
            ],
            [
                'name' => 'Pending Doctor',
                'username' => 'pending-doctor',
                'email' => 'pending.doctor@healthcare.com',
                'phone' => '01700000005',
                'password' => 'Doctor@12345',
                'role' => 'doctor',
                'status' => 'pending_verification',
            ],
        ];

        foreach ($users as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'phone' => $data['phone'],
                    'password' => $data['password'],
                    'status' => $data['status'],
                    'email_verified_at' => now(),
                ],
            );

            $user->syncRoles([$data['role']]);
        }
    }
}
