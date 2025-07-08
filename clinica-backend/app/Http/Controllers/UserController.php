<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($request->filled('role')) {
            return User::whereHas('roles', function($q) use ($request) {
                $q->where('name', $request->role);
            })->get();
        }
        return User::all();
    }

    public function show($id)
    {
        return User::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'username' => 'nullable|string|max:255|unique:users',
            'phone_number' => 'nullable|string|max:32',
            'age' => 'nullable|integer',
            'gender' => 'nullable|string|max:16',
            'status' => 'nullable|string|max:32',
            'specialization' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
        ]);
        $validated['password'] = Hash::make($validated['password']);
        return User::create($validated);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $id,
            'phone_number' => 'sometimes|string|max:32',
            'age' => 'sometimes|integer',
            'gender' => 'sometimes|string|max:16',
            'status' => 'sometimes|string|max:32',
            'specialization' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|max:255',
        ]);
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }
        $user->update($validated);
        return $user;
    }

    public function destroy($id)
    {
        User::destroy($id);
        return response()->noContent();
    }

    public function doctors()
    {
        return User::whereHas('roles', function($q) {
            $q->where('name', 'Doctor');
        })->get();
    }
}
