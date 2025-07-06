<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['inventoryItem', 'supplier']);
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function show($id)
    {
        return Order::with(['inventoryItem', 'supplier'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|integer|min:1',
            'order_date' => 'required|date',
            'status' => 'required|in:Pending,Approved,Shipped,Delivered,Cancelled',
            'priority' => 'required|in:Low,Medium,High',
            'expected_delivery' => 'nullable|date|after:order_date',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);
        return Order::create($validated);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $validated = $request->validate([
            'inventory_item_id' => 'sometimes|exists:inventory_items,id',
            'quantity' => 'sometimes|integer|min:1',
            'order_date' => 'sometimes|date',
            'status' => 'sometimes|in:Pending,Approved,Shipped,Delivered,Cancelled',
            'priority' => 'sometimes|in:Low,Medium,High',
            'expected_delivery' => 'nullable|date|after:order_date',
            'supplier_id' => 'sometimes|exists:suppliers,id',
        ]);
        $order->update($validated);
        return $order->load(['inventoryItem', 'supplier']);
    }

    public function destroy($id)
    {
        Order::destroy($id);
        return response()->noContent();
    }

    // Get pending orders
    public function pending()
    {
        return Order::with(['inventoryItem', 'supplier'])
            ->where('status', 'Pending')
            ->orderBy('priority', 'desc')
            ->orderBy('order_date')
            ->get();
    }

    // Approve order
    public function approve($id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => 'Approved']);
        return $order->load(['inventoryItem', 'supplier']);
    }

    // Get order analytics
    public function analytics()
    {
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'Pending')->count();
        $approvedOrders = Order::where('status', 'Approved')->count();
        $deliveredOrders = Order::where('status', 'Delivered')->count();

        // Orders by priority
        $highPriority = Order::where('priority', 'High')->count();
        $mediumPriority = Order::where('priority', 'Medium')->count();
        $lowPriority = Order::where('priority', 'Low')->count();

        // Recent orders (last 30 days)
        $recentOrders = Order::where('created_at', '>=', Carbon::now()->subDays(30))
            ->with(['inventoryItem', 'supplier'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'approved_orders' => $approvedOrders,
            'delivered_orders' => $deliveredOrders,
            'high_priority' => $highPriority,
            'medium_priority' => $mediumPriority,
            'low_priority' => $lowPriority,
            'recent_orders' => $recentOrders
        ]);
    }
}
