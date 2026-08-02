<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Hospital;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DemoUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hospital = null;
        $doctorUser = null;
        $patientUser = null;

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
                'doctor_profile' => [
                    'specialty' => 'Cardiology',
                    'sub_specialty' => 'Interventional Cardiology',
                    'qualification' => 'MBBS, FCPS (Cardiology)',
                    'gender' => 'Male',
                    'consultation_fee' => 1500,
                    'follow_up_fee' => 800,
                    'chamber_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
                    'city' => 'Dhaka',
                    'license_no' => 'BMDC-112233',
                    'verification_status' => 'approved',
                    'status' => 'active',
                ],
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
                'doctor_profile' => [
                    'specialty' => 'Dermatology',
                    'sub_specialty' => null,
                    'qualification' => 'MBBS, DDV',
                    'gender' => 'Female',
                    'consultation_fee' => 1200,
                    'follow_up_fee' => 600,
                    'chamber_address' => 'Suite 4, Level 3, Metro Tower, Gulshan, Dhaka',
                    'city' => 'Dhaka',
                    'license_no' => 'BMDC-998811',
                    'verification_status' => 'pending',
                    'status' => 'active',
                ],
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

            if ($data['role'] === 'doctor' && isset($data['doctor_profile'])) {
                $doctor = Doctor::updateOrCreate(
                    ['user_id' => $user->id],
                    array_merge($data['doctor_profile'], [
                        'city' => $data['doctor_profile']['city'] ?? 'Dhaka',
                        'country' => 'Bangladesh',
                    ]),
                );

                if ($user->username === 'doctor') {
                    $doctorUser = $user->fresh();
                }

                if ($user->username === 'pending-doctor') {
                    $doctor->forceFill([
                        'verification_status' => 'pending',
                        'status' => 'active',
                    ])->save();
                }
            }

            if ($data['role'] === 'patient') {
                $patientUser = $user->fresh();
            }
        }

        $hospitalUser = User::query()->where('username', 'hospital')->first();

        if ($hospitalUser) {
            $hospital = Hospital::updateOrCreate(
                ['slug' => 'central-care-hospital'],
                [
                    'created_by_user_id' => $hospitalUser->id,
                    'name' => 'Central Care Hospital',
                    'code' => 'CCH-001',
                    'type' => 'general',
                    'phone' => '0961001001',
                    'email' => 'info@centralcare.test',
                    'address_line1' => '12 Green Road',
                    'city' => 'Dhaka',
                    'state' => 'Dhaka',
                    'country' => 'Bangladesh',
                    'status' => 'active',
                ],
            );
        }

        if ($doctorUser && $hospital) {
            $doctor = $doctorUser->doctor()->first();

            if ($doctor) {
                $doctor->forceFill([
                    'primary_hospital_id' => $hospital->id,
                    'city' => 'Dhaka',
                    'country' => 'Bangladesh',
                    'status' => 'active',
                    'verification_status' => 'approved',
                    'verified_at' => now()->subDays(2),
                ])->save();

                $doctor->hospitals()->syncWithoutDetaching([
                    $hospital->id => [
                        'designation' => 'Consultant',
                        'status' => 'active',
                        'start_date' => now()->subMonths(6)->toDateString(),
                        'end_date' => null,
                    ],
                ]);

                $schedule = DoctorSchedule::updateOrCreate(
                    [
                        'doctor_id' => $doctor->id,
                        'hospital_id' => $hospital->id,
                        'consultation_type' => 'in_person',
                    ],
                    [
                        'timezone' => 'Asia/Dhaka',
                        'working_days' => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
                        'start_time' => '09:00:00',
                        'end_time' => '17:00:00',
                        'slot_duration_minutes' => 30,
                        'daily_capacity' => 1,
                        'is_active' => true,
                        'status' => 'active',
                        'notes' => 'Seeded doctor schedule',
                    ],
                );

                $slotTimes = ['09:00:00', '09:30:00', '10:00:00', '11:00:00', '16:00:00'];

                for ($offset = 1; $offset <= 7; $offset++) {
                    $slotDate = now()->addDays($offset)->toDateString();

                    foreach ($slotTimes as $time) {
                        $endTime = Carbon::createFromFormat('H:i:s', $time)->addMinutes(30)->format('H:i:s');

                        $slot = AppointmentSlot::updateOrCreate(
                            [
                                'doctor_schedule_id' => $schedule->id,
                                'slot_date' => $slotDate,
                                'start_time' => $time,
                            ],
                            [
                                'doctor_id' => $doctor->id,
                                'hospital_id' => $hospital->id,
                                'end_time' => $endTime,
                                'capacity' => 1,
                                'booked_count' => 0,
                                'is_bookable' => true,
                                'status' => 'available',
                                'generated_at' => now(),
                            ],
                        );

                        if ($offset === 1 && $time === '09:30:00') {
                            $slot->forceFill([
                                'booked_count' => 1,
                                'status' => 'booked',
                            ])->save();
                        }
                    }
                }

                $patient = $patientUser?->patient()->first();

                if ($patientUser && ! $patient) {
                    $patient = Patient::updateOrCreate(
                        ['user_id' => $patientUser->id],
                        [
                            'hospital_id' => $hospital->id,
                            'mrn' => 'MRN-100001',
                            'gender' => 'Female',
                            'blood_group' => 'O+',
                            'city' => 'Dhaka',
                            'country' => 'Bangladesh',
                            'status' => 'active',
                        ],
                    );
                }

                if ($patient) {
                    $appointments = [
                        [
                            'appointment_no' => 'APT-1001',
                            'slot_date' => now()->addDay()->toDateString(),
                            'slot_time' => '09:30:00',
                            'status' => 'pending',
                            'payment_status' => 'pending',
                            'amount' => 1500,
                        ],
                        [
                            'appointment_no' => 'APT-1002',
                            'slot_date' => now()->addDays(2)->toDateString(),
                            'slot_time' => '11:00:00',
                            'status' => 'confirmed',
                            'payment_status' => 'paid',
                            'amount' => 1250,
                        ],
                        [
                            'appointment_no' => 'APT-1003',
                            'slot_date' => now()->addDays(4)->toDateString(),
                            'slot_time' => '16:00:00',
                            'status' => 'upcoming',
                            'payment_status' => 'unpaid',
                            'amount' => 1750,
                        ],
                    ];

                    foreach ($appointments as $appointmentData) {
                        $slot = AppointmentSlot::query()
                            ->where('doctor_schedule_id', $schedule->id)
                            ->whereDate('slot_date', $appointmentData['slot_date'])
                            ->where('start_time', $appointmentData['slot_time'])
                            ->first();

                        $appointment = Appointment::updateOrCreate(
                            ['appointment_no' => $appointmentData['appointment_no']],
                            [
                                'patient_id' => $patient->id,
                                'doctor_id' => $doctor->id,
                                'hospital_id' => $hospital->id,
                                'appointment_slot_id' => $slot?->id,
                                'consultation_type' => 'in_person',
                                'appointment_date' => $appointmentData['slot_date'],
                                'start_time' => $appointmentData['slot_time'],
                                'end_time' => Carbon::createFromFormat('H:i:s', $appointmentData['slot_time'])->addMinutes(30)->format('H:i:s'),
                                'status' => $appointmentData['status'],
                                'payment_status' => $appointmentData['payment_status'],
                                'channel' => 'web',
                                'reason' => 'General consultation',
                                'symptoms' => 'Follow-up visit',
                                'meta' => [
                                    'seeded' => true,
                                ],
                            ],
                        );

                        if ($slot) {
                            $slot->forceFill([
                                'booked_count' => 1,
                                'status' => 'booked',
                            ])->save();
                        }

                        if ($appointmentData['payment_status'] === 'paid') {
                            Payment::updateOrCreate(
                                ['transaction_no' => 'TRX-'.$appointmentData['appointment_no']],
                                [
                                    'appointment_id' => $appointment->id,
                                    'patient_id' => $patient->id,
                                    'doctor_id' => $doctor->id,
                                    'hospital_id' => $hospital->id,
                                    'payer_user_id' => $patientUser->id,
                                    'provider' => 'manual',
                                    'method' => 'cash',
                                    'currency' => 'BDT',
                                    'amount' => $appointmentData['amount'],
                                    'discount_amount' => 0,
                                    'tax_amount' => 0,
                                    'total_amount' => $appointmentData['amount'],
                                    'paid_amount' => $appointmentData['amount'],
                                    'due_amount' => 0,
                                    'status' => 'paid',
                                    'paid_at' => now()->subDay(),
                                ],
                            );
                        }
                    }
                }
            }
        }
    }
}
