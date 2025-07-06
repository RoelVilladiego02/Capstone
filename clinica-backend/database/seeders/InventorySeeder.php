<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\InventoryItem;
use App\Models\Order;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // Create sample suppliers
        $suppliers = [
            [
                'name' => 'Medical Supplies Co.',
                'contact_name' => 'John Smith',
                'phone' => '+1234567890',
                'email' => 'john@medicalsupplies.com',
                'address' => '123 Supply Street, Medical District',
                'category' => 'Medical Equipment',
                'status' => 'Active',
                'rating' => 4.5
            ],
            [
                'name' => 'PharmaCare Inc.',
                'contact_name' => 'Sarah Johnson',
                'phone' => '+0987654321',
                'email' => 'sarah@pharmacare.com',
                'address' => '456 Pharma Avenue, Health District',
                'category' => 'Pharmaceuticals',
                'status' => 'Active',
                'rating' => 4.8
            ],
            [
                'name' => 'Safety Supplies Inc.',
                'contact_name' => 'Mike Wilson',
                'phone' => '+1122334455',
                'email' => 'mike@safetysupplies.com',
                'address' => '789 Safety Road, Industrial Zone',
                'category' => 'PPE',
                'status' => 'Active',
                'rating' => 4.2
            ]
        ];

        foreach ($suppliers as $supplierData) {
            Supplier::create($supplierData);
        }

        // Create sample inventory items
        $inventoryItems = [
            [
                'name' => 'Surgical Masks',
                'description' => '3-ply disposable surgical masks',
                'quantity' => 50,
                'unit' => 'pieces',
                'price' => 0.50,
                'threshold' => 100,
                'category' => 'PPE',
                'location' => 'Storage A1',
                'supplier_id' => 3
            ],
            [
                'name' => 'Amoxicillin 500mg',
                'description' => 'Antibiotic tablets',
                'quantity' => 350,
                'unit' => 'tablets',
                'price' => 1.25,
                'threshold' => 200,
                'category' => 'Medications',
                'location' => 'Pharmacy B2',
                'supplier_id' => 2
            ],
            [
                'name' => 'Blood Pressure Monitor',
                'description' => 'Digital automatic BP monitor',
                'quantity' => 15,
                'unit' => 'units',
                'price' => 89.99,
                'threshold' => 5,
                'category' => 'Equipment',
                'location' => 'Equipment Room C1',
                'supplier_id' => 1
            ],
            [
                'name' => 'Disposable Gloves',
                'description' => 'Latex-free disposable gloves',
                'quantity' => 25,
                'unit' => 'boxes',
                'price' => 12.99,
                'threshold' => 50,
                'category' => 'PPE',
                'location' => 'Storage A2',
                'supplier_id' => 3
            ],
            [
                'name' => 'Paracetamol 500mg',
                'description' => 'Pain relief tablets',
                'quantity' => 1000,
                'unit' => 'tablets',
                'price' => 0.75,
                'threshold' => 300,
                'category' => 'Medications',
                'location' => 'Pharmacy B1',
                'supplier_id' => 2
            ],
            [
                'name' => 'Syringes 5ml',
                'description' => 'Disposable syringes with needles',
                'quantity' => 0,
                'unit' => 'boxes',
                'price' => 15.99,
                'threshold' => 50,
                'category' => 'Medical Supplies',
                'location' => 'Storage A3',
                'supplier_id' => 1
            ],
            [
                'name' => 'Stethoscope',
                'description' => 'Professional stethoscope',
                'quantity' => 8,
                'unit' => 'units',
                'price' => 129.99,
                'threshold' => 3,
                'category' => 'Equipment',
                'location' => 'Equipment Room C2',
                'supplier_id' => 1
            ],
            [
                'name' => 'Bandages',
                'description' => 'Sterile gauze bandages',
                'quantity' => 75,
                'unit' => 'rolls',
                'price' => 5.99,
                'threshold' => 100,
                'category' => 'Medical Supplies',
                'location' => 'Storage A4',
                'supplier_id' => 3
            ]
        ];

        foreach ($inventoryItems as $itemData) {
            InventoryItem::create($itemData);
        }

        // Create sample orders
        $orders = [
            [
                'inventory_item_id' => 1,
                'quantity' => 500,
                'order_date' => now()->subDays(2),
                'status' => 'Pending',
                'priority' => 'High',
                'expected_delivery' => now()->addDays(5),
                'supplier_id' => 3
            ],
            [
                'inventory_item_id' => 4,
                'quantity' => 1000,
                'order_date' => now()->subDays(1),
                'status' => 'Approved',
                'priority' => 'Medium',
                'expected_delivery' => now()->addDays(7),
                'supplier_id' => 3
            ],
            [
                'inventory_item_id' => 6,
                'quantity' => 200,
                'order_date' => now(),
                'status' => 'Pending',
                'priority' => 'High',
                'expected_delivery' => now()->addDays(3),
                'supplier_id' => 1
            ]
        ];

        foreach ($orders as $orderData) {
            Order::create($orderData);
        }
    }
} 