<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create(); // comment out or ensure factory matches migration

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([
            BranchesTableSeeder::class,
            UserSeeder::class,           // <-- creates roles and users
            DoctorsTableSeeder::class,   // <-- attaches Doctor role to users
            PatientsTableSeeder::class,
            InventorySeeder::class,
            PermissionSeeder::class,
            PrescriptionSeeder::class, // Add prescription seeder
        ]);
    }
}
