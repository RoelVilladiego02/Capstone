<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Prescription::with(['patient.user', 'doctor']);
        
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->input('patient_id'));
        }
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->input('doctor_id'));
        }
        if ($request->has('date')) {
            $query->where('date', $request->input('date'));
        }
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        
        return $query->orderBy('date', 'desc')->get();
    }

    public function show($id)
    {
        return Prescription::with(['patient.user', 'doctor'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'medications' => 'required|array',
            'medications.*.name' => 'required|string',
            'medications.*.dosage' => 'required|string',
            'medications.*.frequency' => 'required|string',
            'medications.*.duration' => 'required|string',
            'medications.*.instructions' => 'nullable|string',
            'diagnosis' => 'required|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Completed,Pending,Cancelled',
            'next_checkup' => 'nullable|date',
        ]);

        $prescription = Prescription::create($validated);
        return $prescription->load(['patient.user', 'doctor']);
    }

    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);
        
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'doctor_id' => 'sometimes|exists:users,id',
            'date' => 'sometimes|date',
            'medications' => 'sometimes|array',
            'medications.*.name' => 'required_with:medications|string',
            'medications.*.dosage' => 'required_with:medications|string',
            'medications.*.frequency' => 'required_with:medications|string',
            'medications.*.duration' => 'required_with:medications|string',
            'medications.*.instructions' => 'nullable|string',
            'diagnosis' => 'sometimes|string',
            'notes' => 'nullable|string',
            'status' => 'sometimes|string|in:Active,Completed,Pending,Cancelled',
            'next_checkup' => 'nullable|date',
        ]);

        $prescription->update($validated);
        return $prescription->load(['patient.user', 'doctor']);
    }

    public function destroy($id)
    {
        Prescription::destroy($id);
        return response()->noContent();
    }

    public function requestRefill(Request $request, $id)
    {
        $prescription = Prescription::with(['patient.user', 'doctor'])->findOrFail($id);
        
        // Validate that the prescription is active
        if ($prescription->status !== 'Active') {
            return response()->json([
                'message' => 'Only active prescriptions can be refilled'
            ], 400);
        }

        // Create a refill request (you might want to create a separate table for this)
        // For now, we'll just return a success message
        return response()->json([
            'message' => 'Refill request submitted successfully',
            'prescription' => $prescription,
            'refill_requested_at' => now(),
            'estimated_processing_time' => '2-3 business days'
        ]);
    }
}
