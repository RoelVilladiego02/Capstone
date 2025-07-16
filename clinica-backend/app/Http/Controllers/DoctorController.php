<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index()
    {
        return Doctor::with(['user', 'branch'])->get();
    }

    public function show($id)
    {
        return Doctor::with(['user', 'branch'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'specialization' => 'required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'available_days' => 'required|array',
            'time_availability' => 'required|array',
            'currently_consulting' => 'boolean',
        ]);
        return Doctor::create($validated);
    }

    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);
        $validated = $request->validate([
            'specialization' => 'sometimes|required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'available_days' => 'sometimes|required|array',
            'time_availability' => 'sometimes|required|array',
            'currently_consulting' => 'boolean',
        ]);
        $doctor->update($validated);
        return $doctor;
    }

    public function destroy($id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->delete();
        return response()->json(['message' => 'Doctor deleted successfully']);
    }
} 