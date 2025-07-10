<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index()
    {
        return Patient::all();
    }

    public function show($id)
    {
        return Patient::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'dob' => 'required|date',
            'gender' => 'required|string',
            'address' => 'required|string',
            'phone' => 'required|string',
            'emergency_contact' => 'nullable|string',
        ]);
        return Patient::create($validated);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'dob' => 'sometimes|date',
            'gender' => 'sometimes|string',
            'address' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'emergency_contact' => 'nullable|string',
        ]);
        $patient->update($validated);
        return $patient;
    }

    public function destroy($id)
    {
        Patient::destroy($id);
        return response()->noContent();
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $patient = \App\Models\Patient::where('user_id', $user->id)->first();
        $db = \DB::connection()->getDatabaseName();
        return response()->json([
            'user_id' => $user->id,
            'user' => $user,
            'patient' => $patient,
            'database' => $db
        ]);
    }
}
