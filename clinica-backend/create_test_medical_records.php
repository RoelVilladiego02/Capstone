<?php

require_once 'vendor/autoload.php';

use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;
use App\Models\Role;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Creating test medical records...\n";

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

    // Sample diagnoses with corresponding treatments
    $sampleConditions = [
        [
            'diagnosis' => 'Upper Respiratory Infection',
            'treatment' => 'Prescribed antibiotics and rest for 5 days'
        ],
        [
            'diagnosis' => 'Hypertension',
            'treatment' => 'Prescribed blood pressure medication and lifestyle modifications'
        ],
        [
            'diagnosis' => 'Type 2 Diabetes',
            'treatment' => 'Prescribed Metformin and dietary changes'
        ],
        [
            'diagnosis' => 'Acute Gastritis',
            'treatment' => 'Prescribed antacids and advised on dietary restrictions'
        ],
        [
            'diagnosis' => 'Migraine',
            'treatment' => 'Prescribed pain relievers and trigger avoidance'
        ],
        [
            'diagnosis' => 'Allergic Rhinitis',
            'treatment' => 'Prescribed antihistamines and nasal spray'
        ],
        [
            'diagnosis' => 'Lower Back Pain',
            'treatment' => 'Prescribed pain medication and physical therapy'
        ],
        [
            'diagnosis' => 'Anxiety Disorder',
            'treatment' => 'Prescribed anti-anxiety medication and counseling'
        ],
        [
            'diagnosis' => 'Bronchitis',
            'treatment' => 'Prescribed bronchodilators and cough medication'
        ],
        [
            'diagnosis' => 'Skin Infection',
            'treatment' => 'Prescribed topical antibiotics and wound care'
        ]
    ];

    // Sample notes templates
    $sampleNotes = [
        'Patient reports improvement in symptoms',
        'Follow-up required in 2 weeks',
        'Patient tolerating medication well',
        'Advised to return if symptoms worsen',
        'Recommended lifestyle modifications discussed',
        'Patient education provided regarding condition',
        'Scheduled for follow-up tests',
        'Referred to specialist for further evaluation',
        'Symptoms significantly improved from last visit',
        'Continue current treatment plan'
    ];

    // Create medical records
    for ($i = 0; $i < 20; $i++) {
        $patient = $patients->random();
        $doctor = $doctors->random();
        $condition = $sampleConditions[array_rand($sampleConditions)];
        
        $medicalRecord = MedicalRecord::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'visit_date' => now()->subDays(rand(1, 365)), // Random date within the last year
            'diagnosis' => $condition['diagnosis'],
            'treatment' => $condition['treatment'],
            'notes' => $sampleNotes[array_rand($sampleNotes)],
            'created_at' => now(),
            'updated_at' => now()
        ]);

        echo "Created medical record #{$medicalRecord->id} for patient {$patient->user->name} by Dr. {$doctor->name}\n";
        echo "Diagnosis: {$condition['diagnosis']}\n";
        echo "------------------------\n";
    }

    echo "\nTest medical records created successfully!\n";
    echo "Total medical records: " . MedicalRecord::count() . "\n";

} catch (Exception $e) {
    echo "Error creating test medical records: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    exit(1);
}
