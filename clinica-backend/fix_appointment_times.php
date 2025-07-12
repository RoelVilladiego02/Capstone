<?php

require_once 'vendor/autoload.php';

use App\Models\Appointment;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Fixing Appointment Times ===\n\n";

// Get all appointments
$appointments = Appointment::all();

echo "Found {$appointments->count()} appointments to fix\n\n";

foreach ($appointments as $appointment) {
    echo "Appointment ID: {$appointment->id}\n";
    echo "  Old time: {$appointment->time}\n";
    
    // Extract just the time part (HH:MM) from the datetime string
    if (strpos($appointment->time, ' ') !== false) {
        // If it's a datetime string, extract just the time part
        $timeParts = explode(' ', $appointment->time);
        $newTime = substr($timeParts[1], 0, 5); // Get HH:MM part
    } else {
        // If it's already just time, keep it
        $newTime = substr($appointment->time, 0, 5);
    }
    
    echo "  New time: {$newTime}\n";
    
    // Update the appointment
    $appointment->update(['time' => $newTime]);
    
    echo "  ✅ Updated\n\n";
}

echo "=== Time Fix Complete ===\n"; 