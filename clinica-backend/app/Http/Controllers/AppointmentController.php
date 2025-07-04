<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        return Appointment::all();
    }

    public function show($id)
    {
        return Appointment::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time' => 'required',
            'status' => 'required|string',
            'type' => 'required|string',
            'concern' => 'nullable|string',
        ]);
        return Appointment::create($validated);
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:users,id',
            'doctor_id' => 'sometimes|exists:users,id',
            'date' => 'sometimes|date',
            'time' => 'sometimes',
            'status' => 'sometimes|string',
            'type' => 'sometimes|string',
            'concern' => 'nullable|string',
        ]);
        $appointment->update($validated);
        return $appointment;
    }

    public function destroy($id)
    {
        Appointment::destroy($id);
        return response()->noContent();
    }
}
