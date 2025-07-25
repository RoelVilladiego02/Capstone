<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items');
            $table->integer('quantity');
            $table->date('order_date');
            $table->enum('status', ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'])->default('Pending');
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
            $table->date('expected_delivery')->nullable();
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
