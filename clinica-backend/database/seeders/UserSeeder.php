<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleName = 'Doctor';
        $role = Role::firstOrCreate(['name' => $roleName]);

        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => "Doctor User $i",
                'username' => "doctor_user_$i",
                'phone_number' => '09171234' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'email' => "doctor$i@example.com",
                'password' => Hash::make('12345678'),
                'age' => 35 + $i,
                'gender' => $i % 2 === 0 ? 'Male' : 'Female',
                'status' => 'Active',
                'specialization' => 'General Medicine',
                'department' => 'General Practice',
            ]);
            $user->roles()->attach($role->id);
        }
    }
}
