<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

        // Check if there's already an appointment at the same date and time
        $existingAppointment = Appointment::where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->where('status', '!=', 'Cancelled') // Don't count cancelled appointments
            ->first();

        if ($existingAppointment) {
            throw ValidationException::withMessages([
                'time' => ['This time slot is already booked. Please choose a different time.']
            ]);
        }

        // Check if the patient already has an appointment on the same date and time
        $patientExistingAppointment = Appointment::where('patient_id', $validated['patient_id'])
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->where('status', '!=', 'Cancelled')
            ->first();

        if ($patientExistingAppointment) {
            throw ValidationException::withMessages([
                'time' => ['You already have an appointment at this time.']
            ]);
        }

        // Check if the doctor is available at the requested time
        $doctorBusy = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->where('status', '!=', 'Cancelled')
            ->first();

        if ($doctorBusy) {
            throw ValidationException::withMessages([
                'time' => ['The selected doctor is not available at this time. Please choose a different time.']
            ]);
        }

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

        // If updating date/time, check for conflicts
        if (isset($validated['date']) || isset($validated['time'])) {
            $checkDate = $validated['date'] ?? $appointment->date;
            $checkTime = $validated['time'] ?? $appointment->time;
            $checkDoctorId = $validated['doctor_id'] ?? $appointment->doctor_id;
            $checkPatientId = $validated['patient_id'] ?? $appointment->patient_id;

            // Check for existing appointments at the same time (excluding current appointment)
            $existingAppointment = Appointment::where('date', $checkDate)
                ->where('time', $checkTime)
                ->where('id', '!=', $id)
                ->where('status', '!=', 'Cancelled')
                ->first();

            if ($existingAppointment) {
                throw ValidationException::withMessages([
                    'time' => ['This time slot is already booked. Please choose a different time.']
                ]);
            }

            // Check if the doctor is available
            $doctorBusy = Appointment::where('doctor_id', $checkDoctorId)
                ->where('date', $checkDate)
                ->where('time', $checkTime)
                ->where('id', '!=', $id)
                ->where('status', '!=', 'Cancelled')
                ->first();

            if ($doctorBusy) {
                throw ValidationException::withMessages([
                    'time' => ['The selected doctor is not available at this time.']
                ]);
            }
        }

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

    /**
     * Check if a time slot is available
     */
    public function checkAvailability(Request $request)
    {
        \Log::info('Availability check requested', $request->all());
        
        $request->validate([
            'date' => 'required|date',
            'time' => 'required',
            'doctor_id' => 'sometimes|exists:users,id',
        ]);

        $query = Appointment::where('date', $request->date)
            ->where('time', $request->time)
            ->where('status', '!=', 'Cancelled');

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        $isAvailable = !$query->exists();
        
        \Log::info('Availability check result', [
            'date' => $request->date,
            'time' => $request->time,
            'doctor_id' => $request->doctor_id,
            'available' => $isAvailable
        ]);

        return response()->json([
            'available' => $isAvailable,
            'message' => $isAvailable ? 'Time slot is available' : 'Time slot is already booked'
        ]);
    }
}