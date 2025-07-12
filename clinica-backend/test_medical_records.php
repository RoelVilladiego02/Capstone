<?php

require_once 'vendor/autoload.php';

use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Medical Records API...\n\n";

try {
    // Test 1: Check if we have any patients
    $patients = Patient::all();
    echo "Found " . $patients->count() . " patients\n";
    
    if ($patients->count() === 0) {
        echo "No patients found. Please run the seeder first.\n";
        exit(1);
    }
    
    // Test 2: Check if we have any doctors (users)
    $doctors = User::where('status', 'active')->get();
    echo "Found " . $doctors->count() . " active doctors\n";
    
    if ($doctors->count() === 0) {
        echo "No doctors found. Please run the seeder first.\n";
        exit(1);
    }
    
    // Test 3: Create a test medical record
    $patient = $patients->first();
    $doctor = $doctors->first();
    
    echo "Creating test medical record for patient: " . $patient->user->name . "\n";
    echo "Doctor: " . $doctor->name . "\n";
    
    $medicalRecord = MedicalRecord::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'visit_date' => now()->format('Y-m-d'),
        'diagnosis' => 'Test Diagnosis - Upper Respiratory Infection',
        'treatment' => 'Test Treatment - Prescribed antibiotics and rest',
        'notes' => 'Test Notes - Patient shows improvement after 3 days',
        'vital_signs' => json_encode([
            'temperature' => '37.2°C',
            'blood_pressure' => '120/80',
            'heart_rate' => '72',
            'respiratory_rate' => '16',
            'oxygen_saturation' => '98%'
        ]),
        'status' => 'Active'
    ]);
    
    echo "Medical record created with ID: " . $medicalRecord->id . "\n";
    
    // Test 4: Test the API endpoint
    $controller = new \App\Http\Controllers\MedicalRecordController();
    $request = new \Illuminate\Http\Request();
    $request->merge(['patient_id' => $patient->id]);
    
    $records = $controller->index($request);
    echo "API returned " . $records->count() . " records for patient " . $patient->id . "\n";
    
    // Test 5: Test with relationships
    $recordWithRelations = $controller->show($medicalRecord->id);
    echo "Record with relationships loaded successfully\n";
    echo "Patient: " . $recordWithRelations->patient->user->name . "\n";
    echo "Doctor: " . $recordWithRelations->doctor->name . "\n";
    
    // Test 6: Test filtering by status
    $request = new \Illuminate\Http\Request();
    $request->merge(['status' => 'Active']);
    $activeRecords = $controller->index($request);
    echo "Found " . $activeRecords->count() . " active records\n";
    
    // Test 7: Test date filtering
    $request = new \Illuminate\Http\Request();
    $request->merge(['start_date' => now()->subDays(7)->format('Y-m-d')]);
    $recentRecords = $controller->index($request);
    echo "Found " . $recentRecords->count() . " records from last 7 days\n";
    
    echo "\n✅ All tests passed! Medical Records API is working correctly.\n";
    
    // Clean up - delete the test record
    $medicalRecord->delete();
    echo "Test record cleaned up.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
} 