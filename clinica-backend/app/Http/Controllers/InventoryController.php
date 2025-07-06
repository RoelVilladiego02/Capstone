<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventoryController extends Controller
{
    public function index()
    {
        return InventoryItem::with('supplier')->get();
    }

    public function show($id)
    {
        return InventoryItem::with('supplier')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:0',
            'unit' => 'required|string',
            'price' => 'required|numeric|min:0',
            'threshold' => 'required|integer|min:0',
            'category' => 'nullable|string',
            'location' => 'nullable|string',
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
            'quantity' => 'sometimes|integer|min:0',
            'unit' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'threshold' => 'sometimes|integer|min:0',
            'category' => 'nullable|string',
            'location' => 'nullable|string',
            'supplier_id' => 'sometimes|exists:suppliers,id',
        ]);
        $item->update($validated);
        return $item->load('supplier');
    }

    public function destroy($id)
    {
        InventoryItem::destroy($id);
        return response()->noContent();
    }

    // Get low stock items
    public function lowStock()
    {
        return InventoryItem::with('supplier')
            ->whereRaw('quantity <= threshold')
            ->orderBy('quantity')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                    'threshold' => $item->threshold,
                    'category' => $item->category,
                    'status' => $item->quantity === 0 ? 'Critical' : 'Low',
                    'supplier' => $item->supplier->name
                ];
            });
    }

    // Get inventory analytics
    public function analytics()
    {
        $totalItems = InventoryItem::count();
        $lowStockCount = InventoryItem::lowStock()->count();
        $outOfStockCount = InventoryItem::outOfStock()->count();
        $categoriesCount = InventoryItem::distinct('category')->count();

        // Get recent activity (last 7 days)
        $recentActivity = InventoryItem::where('updated_at', '>=', Carbon::now()->subDays(7))
            ->with('supplier')
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'total_items' => $totalItems,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'categories_count' => $categoriesCount,
            'recent_activity' => $recentActivity
        ]);
    }

    // Get usage trends
    public function usageTrends(Request $request)
    {
        $period = $request->get('period', 'monthly');
        
        // Mock usage trends data - in a real app, you'd track actual usage
        $trends = [];
        
        if ($period === 'monthly') {
            $trends = [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'data' => [150, 230, 180, 290, 200, 250]
            ];
        } elseif ($period === 'quarterly') {
            $trends = [
                'labels' => ['Q1', 'Q2', 'Q3', 'Q4'],
                'data' => [560, 720, 680, 890]
            ];
        } else {
            $trends = [
                'labels' => ['2020', '2021', '2022', '2023', '2024'],
                'data' => [2100, 2800, 3200, 2850, 3100]
            ];
        }

        return response()->json($trends);
    }
}
