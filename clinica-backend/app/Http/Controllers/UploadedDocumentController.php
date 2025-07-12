<?php
namespace App\Http\Controllers;

use App\Models\UploadedDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UploadedDocumentController extends Controller
{
    // List documents for current user
    public function index()
    {
        $user = Auth::user();
        return UploadedDocument::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
    }

    // List all documents (admin/staff)
    public function adminIndex()
    {
        // Add role check as needed
        return UploadedDocument::with(['user', 'medicalRecord'])->orderBy('created_at', 'desc')->get();
    }

    // Upload a new document
    public function store(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'medical_record_id' => 'nullable|exists:medical_records,id',
            'type' => 'nullable|string',
            'file' => 'required|file|max:10240', // max 10MB
        ]);
        $file = $request->file('file');
        $path = $file->store('uploads/documents', 'public');
        $doc = UploadedDocument::create([
            'user_id' => $user->id,
            'medical_record_id' => $validated['medical_record_id'] ?? null,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'type' => $validated['type'] ?? null,
        ]);
        return response()->json($doc, 201);
    }

    // Delete a document
    public function destroy($id)
    {
        $doc = UploadedDocument::findOrFail($id);
        $user = Auth::user();
        if ($doc->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }
        Storage::disk('public')->delete($doc->file_path);
        $doc->delete();
        return response()->json(['message' => 'Deleted']);
    }
} 