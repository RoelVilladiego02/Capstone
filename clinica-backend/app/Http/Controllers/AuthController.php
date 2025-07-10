<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Log login attempt
        Log::info('Login attempt', ['login' => $request->input('login')]);

        $credentials = $request->validate([
            'login' => 'required|string', // can be username or email
            'password' => 'required|string',
        ]);

        $user = User::where('username', $credentials['login'])
            ->orWhere('email', $credentials['login'])
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'phone_number' => $user->phone_number,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ],
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function register(Request $request)
    {
        // Log registration attempt
        Log::info('Register attempt', ['username' => $request->input('username'), 'email' => $request->input('email')]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'phone_number' => 'required|string|max:32',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'phone_number' => $validated['phone_number'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'Patient', // always set to Patient
        ]);

        // Find the Patient role
        $patientRole = \App\Models\Role::where('name', 'Patient')->first();
        if ($patientRole) {
            $user->roles()->attach($patientRole->id);
        }

        // Create a Patient record for this user
        \App\Models\Patient::create([
            'user_id' => $user->id,
            'dob' => $request->input('dob'), // nullable, or set a default if needed
            'gender' => $request->input('gender'), // nullable, or set a default if needed
            'address' => $request->input('address'), // nullable, or set a default if needed
            'phone' => $user->phone_number,
            'emergency_contact' => $request->input('emergency_contact'), // nullable
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'phone_number' => $user->phone_number,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ],
            'token' => $token
        ], 201);
    }
}
