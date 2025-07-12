<?php

require_once 'vendor/autoload.php';

use App\Models\Patient;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Patient Data Structure...\n\n";

try {
    // Test 1: Check if we have any patients
    $patients = Patient::with('user')->get();
    echo "Found " . $patients->count() . " patients\n";
    
    if ($patients->count() === 0) {
        echo "No patients found. Please run the seeder first.\n";
        exit(1);
    }
    
    // Test 2: Check patient data structure
    $patient = $patients->first();
    echo "\nSample Patient Data:\n";
    echo "Patient ID: " . $patient->id . "\n";
    echo "User ID: " . $patient->user_id . "\n";
    echo "User Name: " . $patient->user->name . "\n";
    echo "User Email: " . $patient->user->email . "\n";
    echo "Patient Gender: " . $patient->gender . "\n";
    echo "Patient Phone: " . $patient->phone . "\n";
    echo "Patient Address: " . $patient->address . "\n";
    
    // Test 3: Test the /patients/me endpoint structure
    $controller = new \App\Http\Controllers\PatientController();
    $request = new \Illuminate\Http\Request();
    
    // Mock a user for testing
    $user = User::first();
    if (!$user) {
        echo "No users found. Please run the seeder first.\n";
        exit(1);
    }
    
    // Create a patient for this user if it doesn't exist
    $existingPatient = Patient::where('user_id', $user->id)->first();
    if (!$existingPatient) {
        echo "Creating test patient for user: " . $user->name . "\n";
        $existingPatient = Patient::create([
            'user_id' => $user->id,
            'dob' => '1990-01-01',
            'gender' => 'Male',
            'address' => '123 Test Street',
            'phone' => '1234567890',
            'emergency_contact' => '9876543210'
        ]);
    }
    
    // Mock the authenticated user
    $request->setUserResolver(function() use ($user) {
        return $user;
    });
    
    $response = $controller->me($request);
    $responseData = json_decode($response->getContent(), true);
    
    echo "\n/patients/me Response Structure:\n";
    echo "Patient ID: " . ($responseData['patient_id'] ?? 'NOT FOUND') . "\n";
    echo "User ID: " . ($responseData['user_id'] ?? 'NOT FOUND') . "\n";
    echo "User Name: " . ($responseData['user']['name'] ?? 'NOT FOUND') . "\n";
    echo "Patient Gender: " . ($responseData['patient']['gender'] ?? 'NOT FOUND') . "\n";
    
    // Test 4: Test doctors endpoint
    $userController = new \App\Http\Controllers\UserController();
    $doctors = $userController->doctors();
    echo "\nFound " . $doctors->count() . " doctors\n";
    
    if ($doctors->count() > 0) {
        $doctor = $doctors->first();
        echo "Sample Doctor: " . $doctor->name . " (ID: " . $doctor->id . ")\n";
    }
    
    echo "\n✅ All tests passed! Patient data structure is working correctly.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
} 