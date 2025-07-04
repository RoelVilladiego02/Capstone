<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::query();
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->input('patient_id'));
        }
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->input('doctor_id'));
        }
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->has('date')) {
            $query->where('date', $request->input('date'));
        }
        return $query->get();
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

    public function checkIn(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'consultation_fee' => 'required|numeric',
            'payment_received' => 'required|boolean',
        ]);

        // Update appointment status to checked in
        $appointment->update([
            'status' => 'Checked In',
            'check_in_time' => now(),
        ]);

        // Create a bill record if payment is received
        if ($validated['payment_received']) {
            \App\Models\Bill::create([
                'patient_id' => $appointment->patient_id,
                'amount' => $validated['consultation_fee'],
                'status' => 'Paid',
                'due_date' => now(),
                'paid_at' => now(),
                'description' => 'Consultation fee for appointment #' . $appointment->id,
            ]);
        }

        return response()->json([
            'message' => 'Patient checked in successfully',
            'appointment' => $appointment
        ]);
    }

    public function doctorAppointments(Request $request, $doctorId)
    {
        $query = Appointment::with(['patient.user', 'doctor'])
            ->where('doctor_id', $doctorId);

        // Filter by date if provided
        if ($request->has('date')) {
            $query->whereDate('date', $request->input('date'));
        }

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        $appointments = $query->orderBy('date')->orderBy('time')->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'time' => $appointment->time,
                    'date' => $appointment->date,
                    'patient' => $appointment->patient->user->name ?? 'Unknown',
                    'patient_id' => $appointment->patient_id,
                    'type' => $appointment->type,
                    'status' => $appointment->status,
                    'concern' => $appointment->concern,
                ];
            });

        return response()->json($appointments);
    }

    public function todaysDoctorAppointments($doctorId)
    {
        $today = \Carbon\Carbon::today();
        
        $appointments = Appointment::with(['patient.user', 'doctor'])
            ->where('doctor_id', $doctorId)
            ->whereDate('date', $today)
            ->orderBy('time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'time' => $appointment->time,
                    'patient' => $appointment->patient->user->name ?? 'Unknown',
                    'patient_id' => $appointment->patient_id,
                    'type' => $appointment->type,
                    'status' => $appointment->status,
                    'concern' => $appointment->concern,
                ];
            });

        return response()->json($appointments);
    }

    public function upcomingTeleconsultations($doctorId)
    {
        $today = \Carbon\Carbon::today();
        
        $teleconsults = Appointment::with(['patient.user', 'doctor'])
            ->where('doctor_id', $doctorId)
            ->where('type', 'Teleconsultation')
            ->whereDate('date', '>=', $today)
            ->orderBy('date')
            ->orderBy('time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patientName' => $appointment->patient->user->name ?? 'Unknown',
                    'time' => $appointment->time,
                    'date' => $appointment->date,
                    'concern' => $appointment->concern,
                    'status' => $appointment->status,
                    'meetingLink' => $appointment->status === 'Ready' ? 'https://meet.clinica.com/' . $appointment->id : '#',
                ];
            });

        return response()->json($teleconsults);
    }
}
