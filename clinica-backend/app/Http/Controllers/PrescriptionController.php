<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function index()
    {
        return Prescription::all();
    }

    public function show($id)
    {
        return Prescription::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'medication' => 'required|string',
            'dosage' => 'required|string',
            'instructions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        return Prescription::create($validated);
    }

    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'doctor_id' => 'sometimes|exists:users,id',
            'date' => 'sometimes|date',
            'medication' => 'sometimes|string',
            'dosage' => 'sometimes|string',
            'instructions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $prescription->update($validated);
        return $prescription;
    }

    public function destroy($id)
    {
        Prescription::destroy($id);
        return response()->noContent();
    }
}
