<?php

require_once 'vendor/autoload.php';

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\Role;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Creating Test Data ===\n\n";

// Check if we have any appointments
$appointmentCount = Appointment::count();
echo "Current appointments: {$appointmentCount}\n";

if ($appointmentCount == 0) {
    echo "No appointments found. Creating test data...\n\n";
    
    // Get or create a patient
    $patient = Patient::first();
    if (!$patient) {
        echo "No patients found. Please run migrations and seeders first.\n";
        exit(1);
    }
    
    // Get or create a doctor
    $doctorRole = Role::where('name', 'Doctor')->first();
    $doctor = null;
    
    if ($doctorRole) {
        $doctor = User::whereHas('roles', function($query) {
            $query->where('name', 'Doctor');
        })->first();
    }
    
    if (!$doctor) {
        // Create a test doctor
        $doctor = User::create([
            'name' => 'Dr. John Smith',
            'username' => 'drjohn',
            'email' => 'drjohn@example.com',
            'phone_number' => '1234567890',
            'password' => bcrypt('password'),
            'specialization' => 'General Medicine',
            'department' => 'Internal Medicine',
            'status' => 'Active'
        ]);
        
        if ($doctorRole) {
            $doctor->roles()->attach($doctorRole->id);
        }
        
        echo "Created test doctor: {$doctor->name}\n";
    }
    
    // Create test appointments
    $appointments = [
        [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'date' => now()->addDays(1)->format('Y-m-d'),
            'time' => '09:00',
            'status' => 'Scheduled',
            'type' => 'Consultation',
            'concern' => 'Regular checkup'
        ],
        [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'date' => now()->addDays(2)->format('Y-m-d'),
            'time' => '14:00',
            'status' => 'Scheduled',
            'type' => 'Teleconsultation',
            'concern' => 'Follow-up consultation'
        ],
        [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'date' => now()->subDays(1)->format('Y-m-d'),
            'time' => '10:00',
            'status' => 'Completed',
            'type' => 'Consultation',
            'concern' => 'Previous appointment'
        ]
    ];
    
    foreach ($appointments as $appointmentData) {
        $appointment = Appointment::create($appointmentData);
        echo "Created appointment: {$appointment->type} on {$appointment->date} at {$appointment->time}\n";
    }
    
    echo "\nTest data created successfully!\n";
} else {
    echo "Appointments already exist. Skipping test data creation.\n";
}

echo "\n=== Test Data Creation Complete ===\n"; 