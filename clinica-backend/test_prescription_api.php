<?php

require_once 'vendor/autoload.php';

use App\Models\Prescription;
use App\Models\Patient;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Prescription API Endpoint...\n\n";

try {
    // Test 1: Get a patient to test with
    $patient = Patient::with('user')->first();
    if (!$patient) {
        echo "❌ No patients found in database\n";
        exit(1);
    }
    
    echo "1. Testing with patient: {$patient->user->name} (ID: {$patient->id})\n";
    
    // Test 2: Get prescriptions for this patient via database
    $dbPrescriptions = Prescription::where('patient_id', $patient->id)->get();
    echo "2. Database query found {$dbPrescriptions->count()} prescriptions for this patient\n";
    
    if ($dbPrescriptions->count() > 0) {
        echo "   Sample prescription:\n";
        $sample = $dbPrescriptions->first();
        echo "   - ID: {$sample->id}\n";
        echo "   - Diagnosis: {$sample->diagnosis}\n";
        echo "   - Status: {$sample->status}\n";
        echo "   - Medications: " . count($sample->medications) . " items\n";
    }
    
    // Test 3: Test the API endpoint
    echo "\n3. Testing API endpoint...\n";
    $baseUrl = 'http://localhost:8000/api';
    
    // Test GET /prescriptions?patient_id=X
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . "/prescriptions?patient_id={$patient->id}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        echo "   ❌ cURL Error: {$error}\n";
    } else {
        echo "   HTTP Status: {$httpCode}\n";
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            if (is_array($data)) {
                echo "   ✅ API endpoint working! Found " . count($data) . " prescriptions\n";
                
                if (count($data) > 0) {
                    echo "   Sample API response:\n";
                    $sampleApi = $data[0];
                    echo "   - ID: {$sampleApi['id']}\n";
                    echo "   - Diagnosis: {$sampleApi['diagnosis']}\n";
                    echo "   - Status: {$sampleApi['status']}\n";
                    echo "   - Patient: {$sampleApi['patient']['user']['name']}\n";
                    echo "   - Doctor: {$sampleApi['doctor']['name']}\n";
                }
            } else {
                echo "   ❌ Invalid JSON response\n";
            }
        } else {
            echo "   ❌ API endpoint returned HTTP {$httpCode}\n";
            echo "   Response: {$response}\n";
        }
    }
    
    // Test 4: Test without authentication (should fail)
    echo "\n4. Testing API without authentication...\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . "/prescriptions");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 401) {
        echo "   ✅ Authentication required (expected)\n";
    } else {
        echo "   ⚠️  Unexpected response: HTTP {$httpCode}\n";
    }

    echo "\n✅ Prescription API test completed!\n";
    echo "\nNext steps:\n";
    echo "1. Start the frontend: cd ../clinica-frontend && npm start\n";
    echo "2. Login as a patient user\n";
    echo "3. Navigate to the Prescriptions page\n";
    echo "4. Check browser console for any errors\n";

} catch (Exception $e) {
    echo "❌ Error testing prescription API: " . $e->getMessage() . "\n";
    exit(1);
} 