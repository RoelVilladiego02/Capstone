<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\Bill;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function summary()
    {
        $today = Carbon::today();
        
        // Get today's appointments
        $todaysAppointments = Appointment::whereDate('date', $today)->count();
        
        // Get checked in appointments today
        $checkedIn = Appointment::whereDate('date', $today)
            ->where('status', 'Checked In')
            ->count();
        
        // Get waiting appointments today
        $waiting = Appointment::whereDate('date', $today)
            ->whereIn('status', ['Scheduled', 'Waiting'])
            ->count();
        
        // Get new patients today (patients created today)
        $newPatients = Patient::whereDate('created_at', $today)->count();
        
        return response()->json([
            'todays_appointments' => $todaysAppointments,
            'checked_in' => $checkedIn,
            'waiting' => $waiting,
            'new_patients' => $newPatients,
        ]);
    }

    public function todaysAppointments()
    {
        $today = Carbon::today();
        
        $appointments = Appointment::with(['patient.user', 'doctor'])
            ->whereDate('date', $today)
            ->orderBy('time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'time' => $appointment->time,
                    'patient' => $appointment->patient->user->name ?? 'Unknown',
                    'doctor' => $appointment->doctor->name ?? 'Unknown',
                    'concern' => $appointment->concern,
                    'type' => $appointment->type,
                    'status' => $appointment->status,
                ];
            });
        
        return response()->json($appointments);
    }

    public function checkInsByHour()
    {
        $today = Carbon::today();
        
        // Get check-ins by hour for today
        $checkIns = Appointment::whereDate('date', $today)
            ->where('status', 'Checked In')
            ->selectRaw('HOUR(time) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();
        
        // Create data for all hours (8 AM to 5 PM)
        $hourlyData = [];
        for ($hour = 8; $hour <= 17; $hour++) {
            $count = $checkIns->where('hour', $hour)->first()->count ?? 0;
            $hourlyData[] = $count;
        }
        
        return response()->json([
            'labels' => ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
            'data' => $hourlyData
        ]);
    }

    public function doctorSummary($doctorId)
    {
        $today = Carbon::today();
        
        // Get today's patients (both completed and upcoming)
        $todayPatients = Appointment::where('doctor_id', $doctorId)
            ->whereDate('date', $today)
            ->count();
        
        // Get checked-in patients (actual visits)
        $checkedInPatients = Appointment::where('doctor_id', $doctorId)
            ->whereDate('date', $today)
            ->where('status', 'Checked In')
            ->count();
        
        // Get completed consultations
        $completedConsultations = Appointment::where('doctor_id', $doctorId)
            ->whereDate('date', $today)
            ->where('status', 'Completed')
            ->count();
        
        // Get pending medical records
        $pendingRecords = \App\Models\MedicalRecord::where('doctor_id', $doctorId)
            ->whereDate('created_at', $today)
            ->where('status', '!=', 'Completed')
            ->count();
        
        // Get pending diagnostics
        $pendingDiagnostics = \App\Models\MedicalRecord::where('doctor_id', $doctorId)
            ->where('status', 'Pending Review')
            ->count();
        
        // Get pending prescriptions
        $pendingPrescriptions = \App\Models\Prescription::where('doctor_id', $doctorId)
            ->whereDate('created_at', $today)
            ->where('status', 'Pending')
            ->count();
        
        return response()->json([
            'today_patients' => $todayPatients,
            'checked_in_patients' => $checkedInPatients,
            'completed_consultations' => $completedConsultations,
            'pending_records' => $pendingRecords,
            'pending_diagnostics' => $pendingDiagnostics,
            'pending_prescriptions' => $pendingPrescriptions
        ]);
    }

    public function patients()
    {
        // Return patient analytics (stub)
        return [];
    }

    public function visits()
    {
        // Return visit analytics (stub)
        return [];
    }

    public function doctors()
    {
        // Return doctor analytics (stub)
        return [];
    }

    public function revenue()
    {
        // Return revenue analytics (stub)
        return [];
    }
}
