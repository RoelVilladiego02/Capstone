<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        return Supplier::all();
    }

    public function show($id)
    {
        return Supplier::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'contact_name' => 'nullable|string',
            'phone' => 'required|string',
            'email' => 'required|email',
            'address' => 'required|string',
        ]);
        return Supplier::create($validated);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'contact_name' => 'nullable|string',
            'phone' => 'sometimes|string',
            'email' => 'sometimes|email',
            'address' => 'sometimes|string',
        ]);
        $supplier->update($validated);
        return $supplier;
    }

    public function destroy($id)
    {
        Supplier::destroy($id);
        return response()->noContent();
    }
}
