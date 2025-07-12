<?php
namespace App\Http\Controllers;

use App\Models\PersonalNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PersonalNoteController extends Controller
{
    // List notes for current user
    public function index()
    {
        $user = Auth::user();
        return PersonalNote::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
    }

    // Create a new personal note
    public function store(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'note' => 'required|string',
        ]);
        $note = PersonalNote::create([
            'user_id' => $user->id,
            'note' => $validated['note'],
        ]);
        return response()->json($note, 201);
    }

    // Update a note
    public function update(Request $request, $id)
    {
        $note = PersonalNote::findOrFail($id);
        $user = Auth::user();
        if ($note->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }
        $validated = $request->validate([
            'note' => 'required|string',
        ]);
        $note->update($validated);
        return response()->json($note);
    }

    // Delete a note
    public function destroy($id)
    {
        $note = PersonalNote::findOrFail($id);
        $user = Auth::user();
        if ($note->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }
        $note->delete();
        return response()->json(['message' => 'Deleted']);
    }
} 