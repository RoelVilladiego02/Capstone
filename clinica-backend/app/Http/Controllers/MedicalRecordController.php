<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    public function index()
    {
        return MedicalRecord::all();
    }

    public function show($id)
    {
        return MedicalRecord::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'visit_date' => 'required|date',
            'diagnosis' => 'required|string',
            'treatment' => 'required|string',
            'notes' => 'nullable|string',
        ]);
        return MedicalRecord::create($validated);
    }

    public function update(Request $request, $id)
    {
        $record = MedicalRecord::findOrFail($id);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'doctor_id' => 'sometimes|exists:users,id',
            'visit_date' => 'sometimes|date',
            'diagnosis' => 'sometimes|string',
            'treatment' => 'sometimes|string',
            'notes' => 'nullable|string',
        ]);
        $record->update($validated);
        return $record;
    }

    public function destroy($id)
    {
        MedicalRecord::destroy($id);
        return response()->noContent();
    }

    public function createFromSession(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'visit_date' => 'required|date',
            'diagnosis' => 'required|string',
            'treatment' => 'required|string',
            'notes' => 'nullable|string',
            'vital_signs' => 'nullable|array',
            'vital_signs.temperature' => 'nullable|string',
            'vital_signs.blood_pressure' => 'nullable|string',
            'vital_signs.heart_rate' => 'nullable|string',
            'vital_signs.respiratory_rate' => 'nullable|string',
            'vital_signs.oxygen_saturation' => 'nullable|string',
            'session_notes' => 'nullable|string',
        ]);

        // Create medical record
        $medicalRecord = MedicalRecord::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'],
            'visit_date' => $validated['visit_date'],
            'diagnosis' => $validated['diagnosis'],
            'treatment' => $validated['treatment'],
            'notes' => $validated['notes'] . "\n\nSession Notes: " . ($validated['session_notes'] ?? ''),
            'vital_signs' => json_encode($validated['vital_signs'] ?? []),
            'status' => 'Active',
        ]);

        return response()->json([
            'message' => 'Medical record created successfully',
            'medical_record' => $medicalRecord
        ], 201);
    }

    public function updateFromSession(Request $request, $id)
    {
        $medicalRecord = MedicalRecord::findOrFail($id);
        
        $validated = $request->validate([
            'diagnosis' => 'sometimes|string',
            'treatment' => 'sometimes|string',
            'notes' => 'nullable|string',
            'vital_signs' => 'nullable|array',
            'vital_signs.temperature' => 'nullable|string',
            'vital_signs.blood_pressure' => 'nullable|string',
            'vital_signs.heart_rate' => 'nullable|string',
            'vital_signs.respiratory_rate' => 'nullable|string',
            'vital_signs.oxygen_saturation' => 'nullable|string',
            'session_notes' => 'nullable|string',
        ]);

        // Update medical record
        $medicalRecord->update([
            'diagnosis' => $validated['diagnosis'] ?? $medicalRecord->diagnosis,
            'treatment' => $validated['treatment'] ?? $medicalRecord->treatment,
            'notes' => ($validated['notes'] ?? $medicalRecord->notes) . "\n\nSession Notes: " . ($validated['session_notes'] ?? ''),
            'vital_signs' => json_encode($validated['vital_signs'] ?? json_decode($medicalRecord->vital_signs, true)),
        ]);

        return response()->json([
            'message' => 'Medical record updated successfully',
            'medical_record' => $medicalRecord
        ]);
    }
}
