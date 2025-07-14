<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = Billing::with(['patient.user', 'doctor']);
        
        // If patient_id is provided, filter by patient
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        
        // Additional filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // For patient users, only show their own bills
        if (auth()->user()->role === 'patient') {
            $patient = auth()->user()->patient;
            if ($patient) {
                $query->where('patient_id', $patient->id);
            } else {
                // If no patient record exists, return empty collection
                return collect();
            }
        }
        
        return $query->get();
    }

    public function myBills(Request $request)
    {
        $patient = auth()->user()->patient;
        
        if (!$patient) {
            return response()->json(['error' => 'Patient profile not found'], 404);
        }
        
        $query = Billing::with(['patient.user', 'doctor'])
            ->where('patient_id', $patient->id);
        
        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        return $query->get();
    }

    public function show($id)
    {
        return Billing::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'nullable|exists:appointments,id',
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'status' => 'required|string', // Accept status from request
            'payment_method' => 'required|string',
            'due_date' => 'required|date',
            'receipt_no' => 'required|string',
            'type' => 'required|string',
            'description' => 'nullable|string',
        ]);
        return Billing::create($validated);
    }

    public function update(Request $request, $id)
    {
        $bill = Billing::findOrFail($id);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'doctor_id' => 'sometimes|exists:users,id',
            'receipt_no' => 'sometimes|string|unique:bills,receipt_no,' . $bill->id,
            'type' => 'sometimes|string',
            'amount' => 'sometimes|numeric',
            'status' => 'sometimes|string',
            'payment_method' => ['sometimes', 'string', Rule::in(Billing::allowedPaymentMethods())],
            'due_date' => 'sometimes|date',
            'paid_at' => 'nullable|date',
            'description' => 'nullable|string',
        ]);
        $bill->update($validated);

        // Prevent payment if bill or appointment is already cancelled
        if (($bill->status === 'Cancelled') || ($bill->appointment_id && optional(\App\Models\Appointment::find($bill->appointment_id))->status === 'Cancelled')) {
            return response()->json([
                'error' => 'This bill or its appointment has already been cancelled. Please book a new appointment.',
                'can_reschedule' => false,
                'appointment_id' => $bill->appointment_id
            ], 409);
        }

        // Prevent payment if another bill for the same appointment slot is already paid
        if ($bill->appointment_id) {
            $currentAppointment = \App\Models\Appointment::find($bill->appointment_id);
            if ($currentAppointment) {
                $otherPaidBill = \App\Models\Billing::where('appointment_id', '!=', $bill->appointment_id)
                    ->whereHas('appointment', function ($q) use ($currentAppointment) {
                        $q->where('doctor_id', $currentAppointment->doctor_id)
                          ->where('date', $currentAppointment->date)
                          ->where('time', $currentAppointment->time)
                          ->where('status', 'Scheduled');
                    })
                    ->where('status', 'Paid')
                    ->first();
                if ($otherPaidBill) {
                    $currentAppointment->status = 'Cancelled';
                    $currentAppointment->save();
                    $bill->status = 'Cancelled';
                    $bill->save();
                    return response()->json([
                        'error' => 'Unfortunately, another patient has already paid and secured this slot before you. Your appointment and bill have been cancelled. Please book a new appointment and pay immediately to secure your slot.',
                        'can_reschedule' => false,
                        'appointment_id' => $currentAppointment->id
                    ], 409);
                }
            }
        }

        // If bill is now paid, handle appointment status and conflicts
        if (isset($validated['status']) && strtolower($validated['status']) === 'paid' && $bill->appointment_id) {
            $appointment = \App\Models\Appointment::find($bill->appointment_id);
            if ($appointment) {
                // Check if slot is still available (no other scheduled appointment for same doctor/date/time)
                $conflict = \App\Models\Appointment::where('doctor_id', $appointment->doctor_id)
                    ->where('date', $appointment->date)
                    ->where('time', $appointment->time)
                    ->where('status', 'Scheduled')
                    ->where('id', '!=', $appointment->id)
                    ->exists();
                if ($conflict) {
                    // Cancel the late appointment and bill
                    $appointment->status = 'Cancelled';
                    $appointment->save();
                    $bill->status = 'Cancelled';
                    $bill->save();
                    return response()->json([
                        'error' => 'Unfortunately, another patient has already paid and secured this slot before you. Your appointment and bill have been cancelled. Please book a new appointment and pay immediately to secure your slot.',
                        'can_reschedule' => false,
                        'appointment_id' => $appointment->id
                    ], 409);
                } else {
                    // Slot is available, mark appointment as Scheduled
                    $appointment->status = 'Scheduled';
                    $appointment->save();
                }
            }
        }
        return $bill;
    }

    public function destroy($id)
    {
        Billing::destroy($id);
        return response()->noContent();
    }
}
