<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Branch;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class DoctorsTableSeeder extends Seeder
{
    public function run()
    {
        $doctorRole = Role::where('name', 'Doctor')->first();
        $branches = Branch::all()->keyBy('name');
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $timeSlots = [
            ['start' => '08:00', 'end' => '12:00'],
            ['start' => '13:00', 'end' => '17:00'],
            ['start' => '12:00', 'end' => '14:00'],
            ['start' => '09:00', 'end' => '11:00'],
            ['start' => '14:00', 'end' => '16:00'],
            ['start' => '10:00', 'end' => '12:00'],
            ['start' => '15:00', 'end' => '17:00'],
        ];
        $doctors = [
            [
                'name' => 'Katrina Alcalde Zarsuelo. MD, FPCP, DPCCP',
                'specialization' => 'IM-PULMONOLOGY',
                'branch' => 'Clinica Laguna Pulo',
                'available_days' => [$days[array_rand($days)], $days[array_rand($days)]],
                'time_availability' => [$timeSlots[0]],
            ],
            [
                'name' => 'Rocky Danilo Willis, MD. FPCP, FPCC, FACC',
                'specialization' => 'IM-CARDIOLOGY-HEART FAILURE CHEST PAIN SPECIALIST',
                'branch' => 'Clinica Laguna Pulo',
                'available_days' => [$days[array_rand($days)], $days[array_rand($days)]],
                'time_availability' => [$timeSlots[array_rand($timeSlots)]],
            ],
            [
                'name' => 'Azelea Kris S. Velante, MD',
                'specialization' => 'GENERAL SURGERY',
                'branch' => 'Clinica Laguna Pulo',
                'available_days' => [$days[array_rand($days)], $days[array_rand($days)]],
                'time_availability' => [$timeSlots[array_rand($timeSlots)]],
            ],
            [
                'name' => 'Ivan Lodrono, MD, FPCP',
                'specialization' => 'INTERNAL MEDICINE',
                'branch' => 'Clinica Laguna Pulo',
                'available_days' => ['Tuesday', 'Wednesday', 'Thursday'],
                'time_availability' => [['start' => '12:00', 'end' => '14:00']],
            ],
            [
                'name' => 'Haidee Dalanon- Lopez, MD',
                'specialization' => 'PEDIATRICIAN CHILD HEALTH',
                'branch' => 'Clinica Laguna Parian',
                'available_days' => ['Monday', 'Thursday'],
                'time_availability' => [
                    ['start' => '15:00', 'end' => '17:00'],
                    ['start' => '13:00', 'end' => '14:00']
                ],
            ],
            [
                'name' => 'Elaine Grace Mallari, MD',
                'specialization' => 'OB GYNE',
                'branch' => 'Clinica Laguna Pulo',
                'available_days' => ['Tuesday', 'Thursday', 'Saturday'],
                'time_availability' => [
                    ['start' => '14:00', 'end' => '16:00'],
                    ['start' => '10:00', 'end' => '12:00'],
                    ['start' => '13:00', 'end' => '15:00']
                ],
            ],
            [
                'name' => 'Michelle A. Valencia MD',
                'specialization' => 'OB GYNE',
                'branch' => 'Clinica Laguna Parian',
                'available_days' => ['Tuesday', 'Thursday', 'Saturday'],
                'time_availability' => [
                    ['start' => '13:00', 'end' => '14:00'],
                    ['start' => '15:00', 'end' => '17:00']
                ],
            ],
            [
                'name' => 'Chairmaine Ramos, MD',
                'specialization' => 'GENERAL PHYSICIAN/URGENT CARE',
                'branch' => 'Clinica Laguna Pulo',
                'available_days' => ['Tuesday', 'Thursday', 'Friday'],
                'time_availability' => [['start' => '09:00', 'end' => '17:00']],
            ],
            [
                'name' => 'Dr. Sheena Medina',
                'specialization' => 'GENERAL PHYSICIAN',
                'branch' => 'Clinica Laguna Parian',
                'available_days' => ['Monday', 'Wednesday', 'Friday'],
                'time_availability' => [['start' => '08:00', 'end' => '16:00']],
            ],
        ];
        foreach ($doctors as $index => $doc) {
            $branch = $branches[$doc['branch']] ?? null;
            $email = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $doc['name'])) . '@clinic.com';
            $user = User::firstOrCreate([
                'email' => $email
            ], [
                'name' => $doc['name'],
                'username' => 'doctor' . ($index + 1),
                'phone_number' => '0917' . rand(1000000, 9999999),
                'password' => Hash::make('password123'),
                'gender' => 'Not Specified',
                'status' => 'Active',
            ]);
            if ($doctorRole) {
                $user->roles()->syncWithoutDetaching([$doctorRole->id]);
            }
            Doctor::firstOrCreate([
                'user_id' => $user->id
            ], [
                'specialization' => $doc['specialization'],
                'branch_id' => $branch ? $branch->id : null,
                'available_days' => $doc['available_days'],
                'time_availability' => $doc['time_availability'],
                'currently_consulting' => false,
            ]);
        }
    }
} 