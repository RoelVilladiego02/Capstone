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
        $roles = [
            'Patient',
            'Doctor',
            'Receptionist',
            'InventoryManager',
            'Admin'
        ];

        foreach ($roles as $roleName) {
            $user = User::create([
                'name' => $roleName . ' User',
                'username' => strtolower(str_replace(' ', '_', $roleName)) . '_user',
                'phone_number' => '09171234567',
                'email' => strtolower(str_replace(' ', '_', $roleName)) . '@example.com',
                'password' => Hash::make('12345678'),
                'age' => $roleName === 'Patient' ? 30 : ($roleName === 'Doctor' ? 45 : 28),
                'gender' => $roleName === 'Doctor' ? 'Male' : ($roleName === 'Patient' ? 'Female' : 'Other'),
                'status' => 'Active',
                'specialization' => $roleName === 'Doctor' ? 'General Medicine' : null,
                'department' => $roleName === 'Doctor' ? 'General Practice' : ($roleName === 'Receptionist' ? 'Front Desk' : null),
            ]);
            $role = Role::firstOrCreate(['name' => $roleName]);
            $user->roles()->attach($role->id);
        }
    }
}
