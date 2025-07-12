<?php

// create_and_visualize_medical_records.php

use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;
use App\Models\Role;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Set the patient ID you want to work with
$patientId = 1; // Change this to an existing patient ID

$patient = Patient::with('user')->find($patientId);

if (!$patient) {
    echo "Patient not found.\n";
    exit(1);
}

echo "=== Patient Information ===\n";
echo "Patient ID: {$patient->id}\n";
echo "Name: " . ($patient->user->name ?? 'N/A') . "\n";
echo "Email: " . ($patient->user->email ?? 'N/A') . "\n";
echo "Date of Birth: " . ($patient->date_of_birth ?? 'N/A') . "\n";
echo "Gender: " . ($patient->gender ?? 'N/A') . "\n";
echo "--------------------------\n\n";

// Check if there are any doctors in the system using the new role relationship
$doctors = User::whereHas('roles', function($query) {
    $query->where('name', 'Doctor');
})->get();

if ($doctors->isEmpty()) {
    echo "No doctors found in the system. Creating a sample doctor...\n";
    
    // First, ensure the Doctor role exists
    $doctorRole = Role::where('name', 'Doctor')->first();
    if (!$doctorRole) {
        $doctorRole = Role::create([
            'name' => 'Doctor',
            'description' => 'Medical Professional'
        ]);
        echo "Created Doctor role.\n";
    }
    
    // Create a sample doctor
    $doctor = User::create([
        'name' => 'Dr. Sarah Johnson',
        'username' => 'dr_sarah_johnson',
        'email' => 'dr.sarah.johnson@clinica.com',
        'password' => bcrypt('password'),
        'specialization' => 'General Medicine',
        'fee' => 500.00,
        'department' => 'General Medicine'
    ]);
    
    // Attach the doctor role
    $doctor->roles()->attach($doctorRole->id);
    
    echo "Created doctor: {$doctor->name}\n";
} else {
    $doctor = $doctors->first();
    echo "Using existing doctor: {$doctor->name}\n";
}

// Check if medical records already exist
$existingRecords = MedicalRecord::where('patient_id', $patientId)->count();

if ($existingRecords > 0) {
    echo "Found {$existingRecords} existing medical records for this patient.\n";
} else {
    echo "No medical records found. Creating sample records...\n\n";
    
    // Create sample medical records
    $sampleRecords = [
        [
            'patient_id' => $patientId,
            'doctor_id' => $doctor->id,
            'visit_date' => '2024-01-15',
            'diagnosis' => 'Upper Respiratory Tract Infection',
            'treatment' => 'Prescribed antibiotics and rest',
            'notes' => 'Patient presented with cough, fever, and sore throat. Symptoms started 3 days ago.',
            'vital_signs' => [
                'temperature' => '38.5°C',
                'blood_pressure' => '120/80 mmHg',
                'heart_rate' => '85 bpm',
                'respiratory_rate' => '18/min',
                'oxygen_saturation' => '98%'
            ],
            'status' => 'Completed'
        ],
        [
            'patient_id' => $patientId,
            'doctor_id' => $doctor->id,
            'visit_date' => '2024-02-20',
            'diagnosis' => 'Hypertension',
            'treatment' => 'Lifestyle modifications and medication',
            'notes' => 'Patient has elevated blood pressure. Recommended low-sodium diet and regular exercise.',
            'vital_signs' => [
                'temperature' => '36.8°C',
                'blood_pressure' => '145/95 mmHg',
                'heart_rate' => '78 bpm',
                'respiratory_rate' => '16/min',
                'oxygen_saturation' => '99%'
            ],
            'status' => 'Active'
        ],
        [
            'patient_id' => $patientId,
            'doctor_id' => $doctor->id,
            'visit_date' => '2024-03-10',
            'diagnosis' => 'Diabetes Type 2',
            'treatment' => 'Metformin and dietary changes',
            'notes' => 'Patient diagnosed with Type 2 diabetes. Blood sugar levels elevated. Started on Metformin 500mg twice daily.',
            'vital_signs' => [
                'temperature' => '37.0°C',
                'blood_pressure' => '130/85 mmHg',
                'heart_rate' => '82 bpm',
                'respiratory_rate' => '17/min',
                'oxygen_saturation' => '97%'
            ],
            'status' => 'Active'
        ]
    ];
    
    foreach ($sampleRecords as $recordData) {
        $record = MedicalRecord::create($recordData);
        echo "Created medical record #{$record->id} for {$record->visit_date}\n";
    }
    
    echo "\nSample medical records created successfully!\n\n";
}

// Now visualize all medical records
$records = MedicalRecord::with(['doctor', 'patient.user'])
    ->where('patient_id', $patientId)
    ->orderBy('visit_date', 'desc')
    ->get();

echo "=== MEDICAL RECORDS VISUALIZATION ===\n";
echo "Total Records: " . $records->count() . "\n\n";

foreach ($records as $record) {
    echo "┌─────────────────────────────────────────────────────────────────────────────┐\n";
    echo "│ MEDICAL RECORD #{$record->id}                                                │\n";
    echo "├─────────────────────────────────────────────────────────────────────────────┤\n";
    echo "│ Visit Date: " . str_pad($record->visit_date, 50) . " │\n";
    echo "│ Doctor: " . str_pad($record->doctor->name ?? 'N/A', 50) . " │\n";
    echo "│ Status: " . str_pad($record->status, 50) . " │\n";
    echo "├─────────────────────────────────────────────────────────────────────────────┤\n";
    echo "│ DIAGNOSIS:                                                                 │\n";
    echo "│ " . str_pad($record->diagnosis, 65) . " │\n";
    echo "├─────────────────────────────────────────────────────────────────────────────┤\n";
    echo "│ TREATMENT:                                                                 │\n";
    echo "│ " . str_pad($record->treatment, 65) . " │\n";
    echo "├─────────────────────────────────────────────────────────────────────────────┤\n";
    echo "│ NOTES:                                                                     │\n";
    
    // Handle multi-line notes
    $notes = $record->notes ?: 'No notes recorded.';
    $noteLines = explode("\n", $notes);
    foreach ($noteLines as $line) {
        $wrappedLines = str_split($line, 63);
        foreach ($wrappedLines as $wrappedLine) {
            echo "│ " . str_pad($wrappedLine, 65) . " │\n";
        }
    }
    
    echo "├─────────────────────────────────────────────────────────────────────────────┤\n";
    echo "│ VITAL SIGNS:                                                               │\n";
    
    $vitalSigns = is_array($record->vital_signs) ? $record->vital_signs : json_decode($record->vital_signs, true);
    if ($vitalSigns && is_array($vitalSigns)) {
        foreach ($vitalSigns as $key => $value) {
            $label = ucfirst(str_replace('_', ' ', $key));
            echo "│ " . str_pad("$label: $value", 65) . " │\n";
        }
    } else {
        echo "│ " . str_pad("No vital signs recorded.", 65) . " │\n";
    }
    
    echo "└─────────────────────────────────────────────────────────────────────────────┘\n\n";
}

echo "=== SUMMARY ===\n";
echo "Patient: " . ($patient->user->name ?? 'N/A') . "\n";
echo "Total Medical Records: " . $records->count() . "\n";
echo "Latest Visit: " . ($records->first() ? $records->first()->visit_date : 'N/A') . "\n";
echo "Active Records: " . $records->where('status', 'Active')->count() . "\n";
echo "Completed Records: " . $records->where('status', 'Completed')->count() . "\n"; 