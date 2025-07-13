<?php

require_once 'vendor/autoload.php';

use App\Models\Prescription;
use App\Models\Patient;
use App\Models\User;
use App\Models\Role;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Creating test prescriptions...\n";

try {
    // Get some patients and doctors
    $patients = Patient::with('user')->take(5)->get();
    $doctorRole = Role::where('name', 'Doctor')->first();
    $doctors = $doctorRole ? $doctorRole->users()->take(3)->get() : collect();

    if ($patients->isEmpty()) {
        echo "No patients found. Please run the patient seeder first.\n";
        exit(1);
    }

    if ($doctors->isEmpty()) {
        echo "No doctors found. Please run the user seeder first.\n";
        exit(1);
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
        'Insomnia'
    ];

    // Create prescriptions
    for ($i = 0; $i < 10; $i++) {
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
            'date' => now()->subDays(rand(1, 30)),
            'medications' => $medications,
            'diagnosis' => $diagnoses[array_rand($diagnoses)],
            'notes' => 'Follow up in 2 weeks. Monitor symptoms.',
            'status' => rand(0, 1) ? 'Active' : 'Completed',
            'next_checkup' => now()->addDays(rand(7, 30))
        ]);

        echo "Created prescription #{$prescription->id} for patient {$patient->user->name} by Dr. {$doctor->name}\n";
    }

    echo "\nTest prescriptions created successfully!\n";
    echo "Total prescriptions: " . Prescription::count() . "\n";

} catch (Exception $e) {
    echo "Error creating test prescriptions: " . $e->getMessage() . "\n";
    exit(1);
} 