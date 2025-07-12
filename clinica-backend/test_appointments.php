<?php

require_once 'vendor/autoload.php';

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Appointment Database Test ===\n\n";

// Check if there are any appointments
$appointments = Appointment::all();
echo "Total appointments in database: " . $appointments->count() . "\n\n";

if ($appointments->count() > 0) {
    echo "Sample appointments:\n";
    foreach ($appointments->take(3) as $appointment) {
        echo "- ID: {$appointment->id}, Patient: {$appointment->patient_id}, Doctor: {$appointment->doctor_id}, Date: {$appointment->date}, Time: {$appointment->time}, Status: {$appointment->status}\n";
    }
    echo "\n";
}

// Check if there are any patients
$patients = Patient::all();
echo "Total patients in database: " . $patients->count() . "\n\n";

if ($patients->count() > 0) {
    echo "Sample patients:\n";
    foreach ($patients->take(3) as $patient) {
        echo "- ID: {$patient->id}, User ID: {$patient->user_id}\n";
    }
    echo "\n";
}

// Check if there are any users with doctor role
$doctors = User::whereHas('roles', function($query) {
    $query->where('name', 'Doctor');
})->get();

echo "Total doctors in database: " . $doctors->count() . "\n\n";

if ($doctors->count() > 0) {
    echo "Sample doctors:\n";
    foreach ($doctors->take(3) as $doctor) {
        echo "- ID: {$doctor->id}, Name: {$doctor->name}\n";
    }
    echo "\n";
}

// Test the appointment query with relationships
echo "=== Testing Appointment Query with Relationships ===\n";
$appointmentWithRelations = Appointment::with(['patient.user', 'doctor'])->first();

if ($appointmentWithRelations) {
    echo "Found appointment with ID: {$appointmentWithRelations->id}\n";
    echo "Patient: " . ($appointmentWithRelations->patient ? $appointmentWithRelations->patient->user->name : 'No patient') . "\n";
    echo "Doctor: " . ($appointmentWithRelations->doctor ? $appointmentWithRelations->doctor->name : 'No doctor') . "\n";
} else {
    echo "No appointments found in database\n";
}

echo "\n=== Test Complete ===\n"; 