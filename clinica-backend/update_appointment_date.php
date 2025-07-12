<?php

require_once 'vendor/autoload.php';

use App\Models\Appointment;
use Carbon\Carbon;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Update Appointment Date ===\n\n";

// Get the existing appointment
$appointment = Appointment::first();

if (!$appointment) {
    echo "No appointments found!\n";
    exit(1);
}

echo "Current appointment:\n";
echo "- ID: {$appointment->id}\n";
echo "- Date: {$appointment->date}\n";
echo "- Time: {$appointment->time}\n";
echo "- Status: {$appointment->status}\n\n";

// Update to tomorrow's date
$tomorrow = Carbon::tomorrow();
$newDate = $tomorrow->format('Y-m-d');
$newTime = '09:00:00';

echo "Updating appointment to:\n";
echo "- Date: {$newDate}\n";
echo "- Time: {$newTime}\n\n";

$appointment->update([
    'date' => $newDate,
    'time' => $newTime
]);

echo "Appointment updated successfully!\n\n";

// Verify the update
$updatedAppointment = Appointment::find($appointment->id);
echo "Updated appointment:\n";
echo "- ID: {$updatedAppointment->id}\n";
echo "- Date: {$updatedAppointment->date}\n";
echo "- Time: {$updatedAppointment->time}\n";
echo "- Status: {$updatedAppointment->status}\n\n";

echo "=== Update Complete ===\n"; 