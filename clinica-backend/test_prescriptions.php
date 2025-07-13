<?php

require_once 'vendor/autoload.php';

use App\Models\Prescription;
use App\Models\Patient;
use App\Models\User;
use App\Models\Role;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Prescription API...\n\n";

try {
    // Test 1: Check if prescriptions exist
    $totalPrescriptions = Prescription::count();
    echo "1. Total prescriptions in database: {$totalPrescriptions}\n";

    if ($totalPrescriptions === 0) {
        echo "   No prescriptions found. Run the seeder first:\n";
        echo "   php artisan db:seed --class=PrescriptionSeeder\n\n";
    } else {
        // Test 2: Get prescriptions with relationships
        $prescriptions = Prescription::with(['patient.user', 'doctor'])->take(3)->get();
        echo "2. Sample prescriptions with relationships:\n";
        
        foreach ($prescriptions as $prescription) {
            echo "   - ID: {$prescription->id}\n";
            echo "     Patient: {$prescription->patient->user->name}\n";
            echo "     Doctor: {$prescription->doctor->name}\n";
            echo "     Diagnosis: {$prescription->diagnosis}\n";
            echo "     Status: {$prescription->status}\n";
            echo "     Medications: " . count($prescription->medications) . " items\n";
            echo "\n";
        }

        // Test 3: Test filtering by patient
        $firstPatient = Patient::first();
        if ($firstPatient) {
            $patientPrescriptions = Prescription::where('patient_id', $firstPatient->id)->get();
            echo "3. Prescriptions for patient {$firstPatient->user->name}: {$patientPrescriptions->count()}\n";
        }

        // Test 4: Test filtering by doctor
        $doctorRole = Role::where('name', 'Doctor')->first();
        if ($doctorRole) {
            $firstDoctor = $doctorRole->users()->first();
            if ($firstDoctor) {
                $doctorPrescriptions = Prescription::where('doctor_id', $firstDoctor->id)->get();
                echo "4. Prescriptions by doctor {$firstDoctor->name}: {$doctorPrescriptions->count()}\n";
            }
        }

        // Test 5: Test filtering by status
        $activePrescriptions = Prescription::where('status', 'Active')->count();
        $completedPrescriptions = Prescription::where('status', 'Completed')->count();
        echo "5. Active prescriptions: {$activePrescriptions}\n";
        echo "   Completed prescriptions: {$completedPrescriptions}\n";
    }

    // Test 6: Check API endpoint (if server is running)
    echo "\n6. Testing API endpoint...\n";
    $baseUrl = 'http://localhost:8000/api';
    
    // Test GET /prescriptions
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/prescriptions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        echo "   API endpoint working! Found " . count($data) . " prescriptions\n";
    } else {
        echo "   API endpoint test failed (HTTP {$httpCode}). Make sure the server is running.\n";
        echo "   Start the server with: php artisan serve\n";
    }

    echo "\n✅ Prescription system test completed!\n";

} catch (Exception $e) {
    echo "❌ Error testing prescriptions: " . $e->getMessage() . "\n";
    exit(1);
} 