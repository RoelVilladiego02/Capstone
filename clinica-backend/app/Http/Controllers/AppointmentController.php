<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['patient.user', 'doctor']);
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
        
        $appointments = $query->get();
        
        // Transform the data to include doctor name and other required fields
        return $appointments->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'date' => $appointment->date,
                'time' => $appointment->time,
                'status' => $appointment->status,
                'type' => $appointment->type,
                'concern' => $appointment->concern,
                'check_in_time' => $appointment->check_in_time,
                'doctor' => $appointment->doctor ? $appointment->doctor->name : 'Doctor TBD',
                'patient' => $appointment->patient ? $appointment->patient->user->name : 'Unknown Patient',
                'created_at' => $appointment->created_at,
                'updated_at' => $appointment->updated_at,
            ];
        });
    }

    public function show($id)
    {
        $appointment = Appointment::with(['patient.user', 'doctor'])->findOrFail($id);
        
        return [
            'id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'doctor_id' => $appointment->doctor_id,
            'date' => $appointment->date,
            'time' => $appointment->time,
            'status' => $appointment->status,
            'type' => $appointment->type,
            'concern' => $appointment->concern,
            'check_in_time' => $appointment->check_in_time,
            'doctor' => $appointment->doctor ? $appointment->doctor->name : 'Doctor TBD',
            'patient' => $appointment->patient ? $appointment->patient->user->name : 'Unknown Patient',
            'created_at' => $appointment->created_at,
            'updated_at' => $appointment->updated_at,
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
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

        // Check if the patient already has an appointment on the same date (one appointment per day limit)
        $patientExistingAppointment = Appointment::where('patient_id', $validated['patient_id'])
            ->where('date', $validated['date'])
            ->where('status', '!=', 'Cancelled')
            ->first();

        if ($patientExistingAppointment) {
            throw ValidationException::withMessages([
                'date' => ['You already have an appointment scheduled for this date. Only one appointment per day is allowed.']
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

        $appointment = Appointment::create($validated);
        
        // Load the created appointment with relationships
        $appointmentWithRelations = Appointment::with(['patient.user', 'doctor'])->find($appointment->id);
        
        return [
            'id' => $appointmentWithRelations->id,
            'patient_id' => $appointmentWithRelations->patient_id,
            'doctor_id' => $appointmentWithRelations->doctor_id,
            'date' => $appointmentWithRelations->date,
            'time' => $appointmentWithRelations->time,
            'status' => $appointmentWithRelations->status,
            'type' => $appointmentWithRelations->type,
            'concern' => $appointmentWithRelations->concern,
            'check_in_time' => $appointmentWithRelations->check_in_time,
            'doctor' => $appointmentWithRelations->doctor ? $appointmentWithRelations->doctor->name : 'Doctor TBD',
            'patient' => $appointmentWithRelations->patient ? $appointmentWithRelations->patient->user->name : 'Unknown Patient',
            'created_at' => $appointmentWithRelations->created_at,
            'updated_at' => $appointmentWithRelations->updated_at,
        ];
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
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

            // Check if the patient already has another appointment on the same date (one appointment per day limit)
            $patientExistingAppointment = Appointment::where('patient_id', $checkPatientId)
                ->where('date', $checkDate)
                ->where('id', '!=', $id)
                ->where('status', '!=', 'Cancelled')
                ->first();

            if ($patientExistingAppointment) {
                throw ValidationException::withMessages([
                    'date' => ['You already have an appointment scheduled for this date. Only one appointment per day is allowed.']
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
        
        // Load the updated appointment with relationships
        $appointmentWithRelations = Appointment::with(['patient.user', 'doctor'])->find($appointment->id);
        
        return [
            'id' => $appointmentWithRelations->id,
            'patient_id' => $appointmentWithRelations->patient_id,
            'doctor_id' => $appointmentWithRelations->doctor_id,
            'date' => $appointmentWithRelations->date,
            'time' => $appointmentWithRelations->time,
            'status' => $appointmentWithRelations->status,
            'type' => $appointmentWithRelations->type,
            'concern' => $appointmentWithRelations->concern,
            'check_in_time' => $appointmentWithRelations->check_in_time,
            'doctor' => $appointmentWithRelations->doctor ? $appointmentWithRelations->doctor->name : 'Doctor TBD',
            'patient' => $appointmentWithRelations->patient ? $appointmentWithRelations->patient->user->name : 'Unknown Patient',
            'created_at' => $appointmentWithRelations->created_at,
            'updated_at' => $appointmentWithRelations->updated_at,
        ];
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

    /**
     * Check if a patient already has an appointment on a specific date
     */
    public function checkPatientDateAvailability(Request $request)
    {
        \Log::info('Patient date availability check requested', $request->all());
        
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'date' => 'required|date',
            'appointment_id' => 'nullable|exists:appointments,id', // For updates, exclude current appointment
        ]);

        $query = Appointment::where('patient_id', $request->patient_id)
            ->where('date', $request->date)
            ->where('status', '!=', 'Cancelled');

        // If updating an appointment, exclude the current appointment from the check
        if ($request->has('appointment_id')) {
            $query->where('id', '!=', $request->appointment_id);
        }

        $existingAppointment = $query->first();
        $hasAppointment = $existingAppointment !== null;
        
        \Log::info('Patient date availability check result', [
            'patient_id' => $request->patient_id,
            'date' => $request->date,
            'appointment_id' => $request->appointment_id,
            'has_appointment' => $hasAppointment,
            'existing_appointment' => $existingAppointment ? [
                'id' => $existingAppointment->id,
                'time' => $existingAppointment->time,
                'type' => $existingAppointment->type,
                'status' => $existingAppointment->status
            ] : null
        ]);

        return response()->json([
            'has_appointment' => $hasAppointment,
            'available' => !$hasAppointment,
            'message' => $hasAppointment 
                ? 'You already have an appointment scheduled for this date. Only one appointment per day is allowed.' 
                : 'Date is available for booking',
            'existing_appointment' => $existingAppointment ? [
                'id' => $existingAppointment->id,
                'time' => $existingAppointment->time,
                'type' => $existingAppointment->type,
                'status' => $existingAppointment->status
            ] : null
        ]);
    }
}