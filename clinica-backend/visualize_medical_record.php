<?php

// visualize_medical_record.php

use App\Models\MedicalRecord;
use App\Models\Patient;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Set the patient ID you want to visualize
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

$records = MedicalRecord::with(['doctor', 'patient.user'])
    ->where('patient_id', $patientId)
    ->orderBy('visit_date', 'desc')
    ->get();

if ($records->isEmpty()) {
    echo "No medical records found for this patient.\n";
    exit(0);
}

foreach ($records as $record) {
    echo "=== Medical Record #{$record->id} ===\n";
    echo "Visit Date: {$record->visit_date}\n";
    echo "Doctor: " . ($record->doctor->name ?? 'N/A') . "\n";
    echo "Diagnosis: {$record->diagnosis}\n";
    echo "Treatment: {$record->treatment}\n";
    echo "Notes: {$record->notes}\n";
    echo "Status: {$record->status}\n";
    echo "--- Vital Signs ---\n";
    $vitalSigns = is_array($record->vital_signs) ? $record->vital_signs : json_decode($record->vital_signs, true);
    if ($vitalSigns && is_array($vitalSigns)) {
        foreach ($vitalSigns as $key => $value) {
            echo ucfirst(str_replace('_', ' ', $key)) . ": $value\n";
        }
    } else {
        echo "No vital signs recorded.\n";
    }
    echo "-------------------\n\n";
}