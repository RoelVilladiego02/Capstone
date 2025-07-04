<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        return InventoryItem::all();
    }

    public function show($id)
    {
        return InventoryItem::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'quantity' => 'required|integer',
            'unit' => 'required|string',
            'price' => 'required|numeric',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);
        return InventoryItem::create($validated);
    }

    public function update(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'description' => 'nullable|string',
            'quantity' => 'sometimes|integer',
            'unit' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'supplier_id' => 'sometimes|exists:suppliers,id',
        ]);
        $item->update($validated);
        return $item;
    }

    public function destroy($id)
    {
        InventoryItem::destroy($id);
        return response()->noContent();
    }
}
