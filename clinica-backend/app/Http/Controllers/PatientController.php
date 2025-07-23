<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index()
    {
        return Patient::with('user')->get();
    }

    public function show($id)
    {
        $user = request()->user();
        $userRoles = $this->getUserRoles($user->id);
        
        // Allow access if user is a doctor or if they're viewing their own profile
        if (in_array('Doctor', $userRoles) || in_array('Admin', $userRoles)) {
            return Patient::with('user')->findOrFail($id);
        }
        
        // If patient is viewing, only allow them to view their own profile
        $patient = Patient::where('user_id', $user->id)->first();
        if ($patient && $patient->id == $id) {
            return $patient->load('user');
        }
        
        return response()->json([
            'error' => 'Unauthorized',
            'message' => 'You do not have permission to view this patient profile'
        ], 403);
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
        $patient = Patient::create($validated);
        return $patient->load('user');
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
        return $patient->load('user');
    }

    public function destroy($id)
    {
        Patient::destroy($id);
        return response()->noContent();
    }

    private function getUserRoles($userId)
    {
        return DB::table('role_user')
            ->join('roles', 'roles.id', '=', 'role_user.role_id')
            ->where('role_user.user_id', $userId)
            ->pluck('roles.name')
            ->toArray();
    }

    public function me(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'User not authenticated',
                ], 401);
            }

            // First try to find existing patient profile regardless of role
            $patient = Patient::where('user_id', $user->id)->first();
            
            if ($patient) {
                // If patient profile exists, return it
                $patient->load('user');
                return response()->json([
                    'patient_id' => $patient->id,
                    'user_id' => $user->id,
                    'user' => $patient->user,
                    'patient' => $patient,
                    'message' => 'Existing patient profile found'
                ]);
            }

            // No patient profile found, get user roles to check authorization
            $userRoles = $this->getUserRoles($user->id);
            $hasPatientRole = in_array('Patient', $userRoles);
            
            // Only create a patient profile if the user has the Patient role
            if (!$hasPatientRole) {
                return response()->json([
                    'error' => 'User is not a patient',
                    'message' => 'Only users with Patient role can have a patient profile'
                ], 403);
            }

            // Create new patient profile
            $patient = Patient::create([
                'user_id' => $user->id,
                'dob' => now(),  // Default value since it's required
                'gender' => 'Not Specified',
                'address' => 'Not Specified',
                'phone' => $user->phone_number ?? 'Not Specified',
                'emergency_contact' => null
            ]);

            $patient->load('user');
            
            return response()->json([
                'patient_id' => $patient->id,
                'user_id' => $user->id,
                'user' => $patient->user,
                'patient' => $patient,
                'message' => 'New patient profile created'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error getting patient profile: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}
