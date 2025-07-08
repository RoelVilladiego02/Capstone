<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    // List all permissions
    public function index()
    {
        return Permission::with(['roles', 'users'])->get();
    }

    // Show a single permission
    public function show($id)
    {
        return Permission::with(['roles', 'users'])->findOrFail($id);
    }

    // Create a new permission
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ]);
        $permission = Permission::create($validated);
        return response()->json($permission, 201);
    }

    // Update a permission
    public function update(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:permissions,name,' . $permission->id,
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ]);
        $permission->update($validated);
        return response()->json($permission);
    }

    // Delete a permission
    public function destroy($id)
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();
        return response()->json(['message' => 'Permission deleted']);
    }

    // Assign permission to roles
    public function assignToRoles(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);
        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id',
        ]);
        $permission->roles()->sync($validated['roles']);
        return response()->json($permission->load('roles'));
    }

    // Assign permission to users
    public function assignToUsers(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);
        $validated = $request->validate([
            'users' => 'required|array',
            'users.*' => 'exists:users,id',
        ]);
        $permission->users()->sync($validated['users']);
        return response()->json($permission->load('users'));
    }
} 