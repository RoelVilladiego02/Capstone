<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patient;

class PatientsTableSeeder extends Seeder
{
    public function run()
    {
        // Juan Dela Cruz
        $juanUser = User::where('email', 'delacruz@gmail.com')->first();
        if ($juanUser) {
            Patient::firstOrCreate([
                'user_id' => $juanUser->id
            ], [
                'dob' => '1990-01-01',
                'gender' => 'Male',
                'address' => 'Sample Address 1',
                'phone' => '09190000001',
                'emergency_contact' => '09190000002'
            ]);
        }

        // Maria Clara
        $mariaUser = User::where('email', 'clara@gmail.com')->first();
        if ($mariaUser) {
            Patient::firstOrCreate([
                'user_id' => $mariaUser->id
            ], [
                'dob' => '1992-01-01',
                'gender' => 'Female',
                'address' => 'Sample Address 2',
                'phone' => '09190000003',
                'emergency_contact' => '09190000004'
            ]);
        }
    }
} 