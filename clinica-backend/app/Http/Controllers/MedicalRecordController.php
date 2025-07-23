<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    /**
     * Check if the authenticated user has permission to manage medical records
     */
    private function checkMedicalRecordPermission($action = 'view', $record = null)
    {
        $user = auth()->user();
        if (!$user) {
            response()->json([
                'message' => 'Unauthorized'
            ], 401)->throwResponse();
        }

        $userRoles = $user->roles->pluck('name')->toArray();
        $authorizedRoles = ['Admin', 'Medical Staff'];

        // Doctors can access their own patients' records
        if (in_array('Doctor', $userRoles)) {
            if ($action === 'view') {
                // For view actions, we'll filter the results in the query
                return;
            }
            
            // For other actions, check if the record belongs to the doctor
            if ($record && $record->doctor_id !== $user->id) {
                response()->json([
                    'message' => 'You can only manage medical records for your own patients'
                ], 403)->throwResponse();
            }
            return;
        }

        // Nurses can view records but not modify them
        if (in_array('Nurse', $userRoles) && $action === 'view') {
            return;
        }

        // For Admin and Medical Staff, check if they have any of the authorized roles
        if (!array_intersect($authorizedRoles, $userRoles)) {
            response()->json([
                'message' => 'Insufficient permissions to manage medical records'
            ], 403)->throwResponse();
        }
    }

    public function index(Request $request)
    {
        // Check basic authorization
        $this->checkMedicalRecordPermission('view');
        
        $query = MedicalRecord::with(['doctor', 'patient.user']);
        $user = auth()->user();
        $userRoles = $user->roles->pluck('name')->toArray();

        // If user is a doctor, only show their patients' records
        if (in_array('Doctor', $userRoles)) {
            $query->where('doctor_id', $user->id);
        }

        // Filter by patient_id if provided
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Filter by doctor_id if provided (only for admin/medical staff)
        if ($request->has('doctor_id') && !in_array('Doctor', $userRoles)) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('visit_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('visit_date', '<=', $request->end_date);
        }

        // Sort by visit_date descending (most recent first)
        $query->orderBy('visit_date', 'desc');

        return $query->get();
    }

    public function show($id)
    {
        $record = MedicalRecord::with(['doctor', 'patient.user'])->findOrFail($id);
        
        // Check authorization with the specific record
        $this->checkMedicalRecordPermission('view', $record);
        
        return $record;
    }

    public function store(Request $request)
    {
        // Check authorization
        $this->checkMedicalRecordPermission('create');

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
            'status' => 'nullable|string|in:Active,Completed,Pending,Cancelled',
        ]);

        // Set default status if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'Active';
        }

        // Encode vital signs if provided
        if (isset($validated['vital_signs'])) {
            $validated['vital_signs'] = json_encode($validated['vital_signs']);
        }

        $medicalRecord = MedicalRecord::create($validated);
        
        return response()->json([
            'message' => 'Medical record created successfully',
            'medical_record' => $medicalRecord->load(['doctor', 'patient'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $record = MedicalRecord::findOrFail($id);
        // Check authorization with the specific record
        $this->checkMedicalRecordPermission('update', $record);

        $record = MedicalRecord::findOrFail($id);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'doctor_id' => 'sometimes|exists:users,id',
            'visit_date' => 'sometimes|date',
            'diagnosis' => 'sometimes|string',
            'treatment' => 'sometimes|string',
            'notes' => 'nullable|string',
            'vital_signs' => 'nullable|array',
            'vital_signs.temperature' => 'nullable|string',
            'vital_signs.blood_pressure' => 'nullable|string',
            'vital_signs.heart_rate' => 'nullable|string',
            'vital_signs.respiratory_rate' => 'nullable|string',
            'vital_signs.oxygen_saturation' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Completed,Pending,Cancelled',
        ]);

        // Encode vital signs if provided
        if (isset($validated['vital_signs'])) {
            $validated['vital_signs'] = json_encode($validated['vital_signs']);
        }

        $record->update($validated);
        
        return response()->json([
            'message' => 'Medical record updated successfully',
            'medical_record' => $record->load(['doctor', 'patient'])
        ]);
    }

    public function destroy($id)
    {
        $record = MedicalRecord::findOrFail($id);
        // Check authorization with the specific record
        $this->checkMedicalRecordPermission('delete', $record);
        $record->delete();
        
        return response()->json([
            'message' => 'Medical record deleted successfully'
        ]);
    }

    public function createFromSession(Request $request)
    {
        // Check authorization
        $this->checkMedicalRecordPermission();

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
            'medical_record' => $medicalRecord->load(['doctor', 'patient'])
        ], 201);
    }

    public function updateFromSession(Request $request, $id)
    {
        // Check authorization
        $this->checkMedicalRecordPermission();

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
            'medical_record' => $medicalRecord->load(['doctor', 'patient'])
        ]);
    }
}
