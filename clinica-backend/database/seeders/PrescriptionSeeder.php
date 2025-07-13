<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prescription;
use App\Models\Patient;
use App\Models\User;
use App\Models\Role;

class PrescriptionSeeder extends Seeder
{
    public function run(): void
    {
        // Get some patients and doctors
        $patients = Patient::with('user')->take(5)->get();
        $doctorRole = Role::where('name', 'Doctor')->first();
        $doctors = $doctorRole ? $doctorRole->users()->take(3)->get() : collect();

        if ($patients->isEmpty()) {
            $this->command->error('No patients found. Please run the patient seeder first.');
            return;
        }

        if ($doctors->isEmpty()) {
            $this->command->error('No doctors found. Please run the user seeder first.');
            return;
        }

        // Sample medications data
        $sampleMedications = [
            [
                'name' => 'Amoxicillin',
                'dosage' => '500mg',
                'frequency' => '3 times daily',
                'duration' => '7 days',
                'instructions' => 'Take with food'
            ],
            [
                'name' => 'Paracetamol',
                'dosage' => '500mg',
                'frequency' => 'As needed',
                'duration' => '5 days',
                'instructions' => 'Take for fever above 38°C'
            ],
            [
                'name' => 'Ibuprofen',
                'dosage' => '400mg',
                'frequency' => 'Every 6 hours',
                'duration' => '3 days',
                'instructions' => 'Take with meals'
            ],
            [
                'name' => 'Omeprazole',
                'dosage' => '20mg',
                'frequency' => 'Once daily',
                'duration' => '14 days',
                'instructions' => 'Take before breakfast'
            ],
            [
                'name' => 'Cetirizine',
                'dosage' => '10mg',
                'frequency' => 'Once daily',
                'duration' => '10 days',
                'instructions' => 'Take at night'
            ],
            [
                'name' => 'Metformin',
                'dosage' => '500mg',
                'frequency' => 'Twice daily',
                'duration' => '30 days',
                'instructions' => 'Take with meals'
            ],
            [
                'name' => 'Lisinopril',
                'dosage' => '10mg',
                'frequency' => 'Once daily',
                'duration' => '30 days',
                'instructions' => 'Take in the morning'
            ]
        ];

        // Sample diagnoses
        $diagnoses = [
            'Upper Respiratory Infection',
            'Viral Fever',
            'Hypertension',
            'Diabetes Type 2',
            'Allergic Rhinitis',
            'Gastritis',
            'Migraine',
            'Anxiety Disorder',
            'Depression',
            'Insomnia',
            'Bronchitis',
            'Pneumonia',
            'Urinary Tract Infection',
            'Skin Infection',
            'Eye Infection'
        ];

        // Create prescriptions
        for ($i = 0; $i < 15; $i++) {
            $patient = $patients->random();
            $doctor = $doctors->random();
            
            // Random number of medications (1-3)
            $numMedications = rand(1, 3);
            $medications = [];
            
            for ($j = 0; $j < $numMedications; $j++) {
                $medications[] = $sampleMedications[array_rand($sampleMedications)];
            }

            $prescription = Prescription::create([
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'date' => now()->subDays(rand(1, 60)),
                'medications' => $medications,
                'diagnosis' => $diagnoses[array_rand($diagnoses)],
                'notes' => 'Follow up in 2 weeks. Monitor symptoms and report any side effects.',
                'status' => rand(0, 1) ? 'Active' : 'Completed',
                'next_checkup' => now()->addDays(rand(7, 30))
            ]);

            $this->command->info("Created prescription #{$prescription->id} for patient {$patient->user->name} by Dr. {$doctor->name}");
        }

        $this->command->info('Prescription seeder completed successfully!');
    }
} 