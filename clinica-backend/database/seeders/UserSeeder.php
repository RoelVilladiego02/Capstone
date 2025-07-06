<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

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
            'Manager'
        ];

        foreach ($roles as $role) {
            User::create([
                'name' => $role . ' User',
                'username' => strtolower(str_replace(' ', '_', $role)) . '_user',
                'phone_number' => '09171234567',
                'email' => strtolower(str_replace(' ', '_', $role)) . '@example.com',
                'password' => Hash::make('12345678'),
                'role' => $role, // assign correct role here
            ]);
        }
    }
}
