<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Billing;
use App\Models\Patient;

class BillsTableSeeder extends Seeder
{
    public function run()
    {
        // Get sample users
        $doctor1 = User::where('email', 'santos@medclinic.com')->first();
        $doctor2 = User::where('email', 'chen@medclinic.com')->first();
        $patient1User = User::where('email', 'delacruz@gmail.com')->first();
        $patient2User = User::where('email', 'clara@gmail.com')->first();

        if (!$doctor1 || !$doctor2 || !$patient1User || !$patient2User) {
            throw new \Exception('One or more users not found. Please check emails in BillsTableSeeder.php');
        }

        // Create sample bills
        $patient1 = \App\Models\Patient::where('user_id', $patient1User->id)->first();
        $patient2 = \App\Models\Patient::where('user_id', $patient2User->id)->first();

        Billing::create([
            'patient_id' => $patient1->id,
            'doctor_id' => $doctor1->id,
            'receipt_no' => 'BILL-1001',
            'type' => 'Consultation',
            'amount' => 1200.00,
            'status' => 'Paid',
            'payment_method' => 'cash',
            'due_date' => now()->addDays(7),
            'paid_at' => now(),
            'description' => 'General consultation fee',
        ]);
        Billing::create([
            'patient_id' => $patient2->id,
            'doctor_id' => $doctor2->id,
            'receipt_no' => 'BILL-1002',
            'type' => 'Follow-up',
            'amount' => 800.00,
            'status' => 'Pending',
            'payment_method' => null,
            'due_date' => now()->addDays(5),
            'paid_at' => null,
            'description' => 'Follow-up check',
        ]);
        Billing::create([
            'patient_id' => $patient1->id,
            'doctor_id' => $doctor2->id,
            'receipt_no' => 'BILL-1003',
            'type' => 'Lab Test',
            'amount' => 1500.00,
            'status' => 'Overdue',
            'payment_method' => null,
            'due_date' => now()->subDays(3),
            'paid_at' => null,
            'description' => 'Blood chemistry',
        ]);
    }
} 