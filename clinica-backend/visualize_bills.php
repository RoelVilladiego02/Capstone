<?php

use App\Models\Billing;

require __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Fetch all bills with patient and doctor
$bills = Billing::with(['patient.user', 'doctor'])->get();

// Output header
printf("%-12s %-20s %-20s %-10s %-10s %-10s %-20s\n", 'Receipt #', 'Patient', 'Doctor', 'Status', 'Amount', 'Due Date', 'Description');
echo str_repeat('-', 100) . "\n";

foreach ($bills as $bill) {
    $patientName = $bill->patient && $bill->patient->user ? $bill->patient->user->name : 'Unknown';
    $doctorName = $bill->doctor ? $bill->doctor->name : 'N/A';
    printf(
        "%-12s %-20s %-20s %-10s %-10.2f %-10s %-20s\n",
        $bill->receipt_no,
        $patientName,
        $doctorName,
        $bill->status,
        $bill->amount,
        $bill->due_date,
        $bill->description
    );
} 