<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'view_patients',
                'description' => 'View patient information',
                'category' => 'Patient Records',
            ],
            [
                'name' => 'edit_medical_records',
                'description' => 'Edit medical records',
                'category' => 'Patient Records',
            ],
            [
                'name' => 'delete_records',
                'description' => 'Delete patient records',
                'category' => 'Patient Records',
            ],
            [
                'name' => 'view_appointments',
                'description' => 'View appointment schedule',
                'category' => 'Appointments',
            ],
            [
                'name' => 'create_appointment',
                'description' => 'Create new appointments',
                'category' => 'Appointments',
            ],
            [
                'name' => 'cancel_appointment',
                'description' => 'Cancel appointments',
                'category' => 'Appointments',
            ],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(['name' => $perm['name']], $perm);
        }
    }
} 