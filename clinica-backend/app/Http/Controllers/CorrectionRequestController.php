<?php
namespace App\Http\Controllers;

use App\Models\CorrectionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CorrectionRequestController extends Controller
{
    // List requests for current user
    public function index()
    {
        $user = Auth::user();
        return CorrectionRequest::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
    }

    // List all requests (admin/staff)
    public function adminIndex()
    {
        // Add role check as needed
        return CorrectionRequest::with(['user', 'medicalRecord'])->orderBy('created_at', 'desc')->get();
    }

    // Create a new correction request
    public function store(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'medical_record_id' => 'nullable|exists:medical_records,id',
            'request' => 'required|string',
        ]);
        $correction = CorrectionRequest::create([
            'user_id' => $user->id,
            'medical_record_id' => $validated['medical_record_id'] ?? null,
            'request' => $validated['request'],
            'status' => 'Pending',
        ]);
        return response()->json($correction, 201);
    }

    // Update (admin response)
    public function update(Request $request, $id)
    {
        $correction = CorrectionRequest::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:Pending,Approved,Rejected',
            'admin_response' => 'nullable|string',
        ]);
        $correction->update($validated);
        return response()->json($correction);
    }

    // Delete a correction request (user or admin)
    public function destroy($id)
    {
        $correction = CorrectionRequest::findOrFail($id);
        $correction->delete();
        return response()->json(['message' => 'Deleted']);
    }
} 