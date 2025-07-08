<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // List all roles
    public function index()
    {
        return Role::with('permissions')->get();
    }

    // Show a single role
    public function show($id)
    {
        return Role::with('permissions')->findOrFail($id);
    }

    // Create a new role
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'description' => 'nullable|string',
        ]);
        $role = Role::create($validated);
        return response()->json($role, 201);
    }

    // Update a role
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:roles,name,' . $role->id,
            'description' => 'nullable|string',
        ]);
        $role->update($validated);
        return response()->json($role);
    }

    // Delete a role
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();
        return response()->json(['message' => 'Role deleted']);
    }

    // Assign permissions to a role
    public function assignPermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);
        $role->permissions()->sync($validated['permissions']);
        return response()->json($role->load('permissions'));
    }
} 