<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return Order::all();
    }

    public function show($id)
    {
        return Order::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|integer',
            'order_date' => 'required|date',
            'status' => 'required|string',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);
        return Order::create($validated);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $validated = $request->validate([
            'inventory_item_id' => 'sometimes|exists:inventory_items,id',
            'quantity' => 'sometimes|integer',
            'order_date' => 'sometimes|date',
            'status' => 'sometimes|string',
            'supplier_id' => 'sometimes|exists:suppliers,id',
        ]);
        $order->update($validated);
        return $order;
    }

    public function destroy($id)
    {
        Order::destroy($id);
        return response()->noContent();
    }
}
