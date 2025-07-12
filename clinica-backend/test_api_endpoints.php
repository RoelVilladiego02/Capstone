<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Patient;
use App\Models\Appointment;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== API Endpoints Test ===\n\n";

// Test 1: Get a patient
$patient = Patient::first();
if (!$patient) {
    echo "❌ No patients found in database\n";
    exit(1);
}

echo "✅ Found patient: ID {$patient->id}, User ID {$patient->user_id}\n\n";

// Test 2: Get the user associated with the patient
$user = User::find($patient->user_id);
if (!$user) {
    echo "❌ No user found for patient\n";
    exit(1);
}

echo "✅ Found user: ID {$user->id}, Name: {$user->name}\n\n";

// Test 3: Test the /patients/me endpoint logic
echo "=== Testing /patients/me endpoint logic ===\n";
// Simulate the PatientController@me method
$testUser = $user; // Use the patient's user
$testPatient = Patient::where('user_id', $testUser->id)->first();

if (!$testPatient) {
    echo "❌ Patient profile not found for user {$testUser->id}\n";
} else {
    echo "✅ Patient profile found:\n";
    echo "   - Patient ID: {$testPatient->id}\n";
    echo "   - User ID: {$testUser->id}\n";
    echo "   - User Name: {$testUser->name}\n";
    echo "   - User Email: {$testUser->email}\n";
}

echo "\n";

// Test 4: Test appointments endpoint
echo "=== Testing /appointments endpoint ===\n";
$appointments = Appointment::with(['patient.user', 'doctor'])
    ->where('patient_id', $patient->id)
    ->get();

echo "Found {$appointments->count()} appointments for patient {$patient->id}\n\n";

foreach ($appointments as $appointment) {
    echo "Appointment ID: {$appointment->id}\n";
    echo "  - Date: {$appointment->date}\n";
    echo "  - Time: {$appointment->time}\n";
    echo "  - Status: {$appointment->status}\n";
    echo "  - Type: {$appointment->type}\n";
    echo "  - Doctor: " . ($appointment->doctor ? $appointment->doctor->name : 'No doctor') . "\n";
    echo "  - Patient: " . ($appointment->patient ? $appointment->patient->user->name : 'No patient') . "\n";
    echo "  - Concern: {$appointment->concern}\n\n";
}

// Test 5: Test the transformed data structure
echo "=== Testing Transformed Data Structure ===\n";
$transformedAppointments = $appointments->map(function ($appointment) {
    return [
        'id' => $appointment->id,
        'patient_id' => $appointment->patient_id,
        'doctor_id' => $appointment->doctor_id,
        'date' => $appointment->date,
        'time' => $appointment->time,
        'status' => $appointment->status,
        'type' => $appointment->type,
        'concern' => $appointment->concern,
        'check_in_time' => $appointment->check_in_time,
        'doctor' => $appointment->doctor ? $appointment->doctor->name : 'Doctor TBD',
        'patient' => $appointment->patient ? $appointment->patient->user->name : 'Unknown Patient',
        'created_at' => $appointment->created_at,
        'updated_at' => $appointment->updated_at,
    ];
});

echo "Transformed appointments:\n";
foreach ($transformedAppointments as $appointment) {
    echo "- ID: {$appointment['id']}\n";
    echo "  Date: {$appointment['date']}\n";
    echo "  Time: {$appointment['time']}\n";
    echo "  Doctor: {$appointment['doctor']}\n";
    echo "  Patient: {$appointment['patient']}\n";
    echo "  Status: {$appointment['status']}\n";
    echo "  Type: {$appointment['type']}\n\n";
}

echo "=== API Endpoints Test Complete ===\n"; 