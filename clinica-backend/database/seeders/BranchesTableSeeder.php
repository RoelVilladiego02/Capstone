<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchesTableSeeder extends Seeder
{
    public function run()
    {
        Branch::firstOrCreate([
            'name' => 'Clinica Laguna Pulo',
            'address' => 'Pulo-Diezmo Road, Cabuyao City, 4025 Laguna',
        ], [
            'phone_number' => null,
        ]);

        Branch::firstOrCreate([
            'name' => 'Clinica Laguna Parian',
            'address' => 'San Cristobal Bridge, Calamba, 4027 Laguna',
        ], [
            'phone_number' => null,
        ]);
    }
} 