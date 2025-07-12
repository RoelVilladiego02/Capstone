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
        // Create roles first
        $roles = [
            'Admin' => 'System Administrator',
            'Doctor' => 'Medical Professional',
            'Patient' => 'Medical Patient',
            'Receptionist' => 'Front Desk Staff',
            'InventoryManager' => 'Inventory Staff'
        ];

        foreach ($roles as $name => $description) {
            Role::firstOrCreate(['name' => $name], ['description' => $description]);
        }

        // Seed Admin Users
        $this->createAdmin();

        // Seed Doctors
        $this->createDoctors();

        // Seed Receptionists
        $this->createReceptionists();

        // Seed Inventory Managers
        $this->createInventoryManagers();

        // Seed Patients
        $this->createPatients();
    }

    private function createAdmin()
    {
        $adminRole = Role::where('name', 'Admin')->first();
        
        $admin = User::create([
            'name' => 'System Administrator',
            'username' => 'admin',
            'phone_number' => '09170000001',
            'email' => 'admin@medclinic.com',
            'password' => Hash::make('admin12345'),
            'age' => 30,
            'gender' => 'Male',
            'status' => 'Active',
            'department' => 'Administration'
        ]);

        $admin->roles()->attach($adminRole->id);
    }

    private function createDoctors()
    {
        $doctorRole = Role::where('name', 'Doctor')->first();

        $doctors = [
            [
                'name' => 'Dr. Maria Santos',
                'username' => 'dr_santos',
                'specialization' => 'Cardiology',
                'department' => 'Cardiovascular Medicine'
            ],
            [
                'name' => 'Dr. James Chen',
                'username' => 'dr_chen',
                'specialization' => 'Pediatrics',
                'department' => 'Children\'s Health'
            ],
            [
                'name' => 'Dr. Sarah Williams',
                'username' => 'dr_williams',
                'specialization' => 'Dermatology',
                'department' => 'Skin Care'
            ],
            [
                'name' => 'Dr. Robert Garcia',
                'username' => 'dr_garcia',
                'specialization' => 'Orthopedics',
                'department' => 'Bone & Joint'
            ],
            [
                'name' => 'Dr. Emily Patel',
                'username' => 'dr_patel',
                'specialization' => 'Neurology',
                'department' => 'Neuroscience'
            ],
            [
                'name' => 'Dr. Michael Kim',
                'username' => 'dr_kim',
                'specialization' => 'Ophthalmology',
                'department' => 'Eye Care'
            ],
            [
                'name' => 'Dr. Lisa Rodriguez',
                'username' => 'dr_rodriguez',
                'specialization' => 'Endocrinology',
                'department' => 'Hormonal Disorders'
            ],
            [
                'name' => 'Dr. David Wilson',
                'username' => 'dr_wilson',
                'specialization' => 'Gastroenterology',
                'department' => 'Digestive Health'
            ],
            [
                'name' => 'Dr. Rachel Thompson',
                'username' => 'dr_thompson',
                'specialization' => 'Psychiatry',
                'department' => 'Mental Health'
            ],
            [
                'name' => 'Dr. John Martinez',
                'username' => 'dr_martinez',
                'specialization' => 'Pulmonology',
                'department' => 'Respiratory Care'
            ]
        ];

        foreach ($doctors as $index => $doctor) {
            $user = User::create([
                'name' => $doctor['name'],
                'username' => $doctor['username'],
                'phone_number' => '09171234' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'email' => strtolower(str_replace('dr_', '', $doctor['username'])) . '@medclinic.com',
                'password' => Hash::make('12345678'),
                'age' => rand(35, 65),
                'gender' => $index % 2 === 0 ? 'Male' : 'Female',
                'status' => 'Active',
                'specialization' => $doctor['specialization'],
                'department' => $doctor['department'],
            ]);
            $user->roles()->attach($doctorRole->id);
        }
    }

    private function createReceptionists()
    {
        $receptionistRole = Role::where('name', 'Receptionist')->first();

        $receptionists = [
            [
                'name' => 'Ana Cruz',
                'username' => 'receptionist_cruz',
            ],
            [
                'name' => 'Mark Johnson',
                'username' => 'receptionist_johnson',
            ],
            [
                'name' => 'Sofia Reyes',
                'username' => 'receptionist_reyes',
            ]
        ];

        foreach ($receptionists as $index => $receptionist) {
            $user = User::create([
                'name' => $receptionist['name'],
                'username' => $receptionist['username'],
                'phone_number' => '09182234' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'email' => strtolower(str_replace('receptionist_', '', $receptionist['username'])) . '@medclinic.com',
                'password' => Hash::make('12345678'),
                'age' => rand(25, 45),
                'gender' => $index % 2 === 0 ? 'Female' : 'Male',
                'status' => 'Active',
                'department' => 'Front Desk',
            ]);
            $user->roles()->attach($receptionistRole->id);
        }
    }

    private function createInventoryManagers()
    {
        $inventoryManagerRole = Role::where('name', 'InventoryManager')->first();

        $managers = [
            [
                'name' => 'Carlos Mendoza',
                'username' => 'inventory_mendoza',
            ],
            [
                'name' => 'Linda Park',
                'username' => 'inventory_park',
            ]
        ];

        foreach ($managers as $index => $manager) {
            $user = User::create([
                'name' => $manager['name'],
                'username' => $manager['username'],
                'phone_number' => '09183334' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'email' => strtolower(str_replace('inventory_', '', $manager['username'])) . '@medclinic.com',
                'password' => Hash::make('12345678'),
                'age' => rand(25, 45),
                'gender' => $index % 2 === 0 ? 'Male' : 'Female',
                'status' => 'Active',
                'department' => 'Inventory',
            ]);
            $user->roles()->attach($inventoryManagerRole->id);
        }
    }

    private function createPatients()
    {
        $patientRole = Role::where('name', 'Patient')->first();

        $patients = [
            [
                'name' => 'Juan Dela Cruz',
                'username' => 'patient_delacruz',
            ],
            [
                'name' => 'Maria Clara',
                'username' => 'patient_clara',
            ],
            [
                'name' => 'Jose Rizal',
                'username' => 'patient_rizal',
            ],
            [
                'name' => 'Andres Bonifacio',
                'username' => 'patient_bonifacio',
            ],
            [
                'name' => 'Gabriela Silang',
                'username' => 'patient_silang',
            ]
        ];

        foreach ($patients as $index => $patient) {
            $user = User::create([
                'name' => $patient['name'],
                'username' => $patient['username'],
                'phone_number' => '09194434' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'email' => strtolower(str_replace('patient_', '', $patient['username'])) . '@gmail.com',
                'password' => Hash::make('12345678'),
                'age' => rand(18, 70),
                'gender' => $index % 2 === 0 ? 'Male' : 'Female',
                'status' => 'Active',
            ]);
            $user->roles()->attach($patientRole->id);
        }
    }
}
