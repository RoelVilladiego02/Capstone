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
}
