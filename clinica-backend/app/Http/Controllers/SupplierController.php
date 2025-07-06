<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::withCount(['inventoryItems', 'orders']);
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        return $query->orderBy('name')->get();
    }

    public function show($id)
    {
        return Supplier::with(['inventoryItems', 'orders'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string',
            'category' => 'nullable|string|max:100',
            'status' => 'required|in:Active,Inactive',
            'rating' => 'nullable|numeric|min:0|max:5',
        ]);
        return Supplier::create($validated);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'email' => 'sometimes|email|max:255',
            'address' => 'sometimes|string',
            'category' => 'nullable|string|max:100',
            'status' => 'sometimes|in:Active,Inactive',
            'rating' => 'nullable|numeric|min:0|max:5',
        ]);
        $supplier->update($validated);
        return $supplier->load(['inventoryItems', 'orders']);
    }

    public function destroy($id)
    {
        Supplier::destroy($id);
        return response()->noContent();
    }

    // Get active suppliers
    public function active()
    {
        return Supplier::active()
            ->withCount(['inventoryItems', 'orders'])
            ->orderBy('name')
            ->get();
    }

    // Get suppliers by category
    public function byCategory($category)
    {
        return Supplier::byCategory($category)
            ->withCount(['inventoryItems', 'orders'])
            ->orderBy('name')
            ->get();
    }
}
