<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->integer('quantity');
            $table->string('unit');
            $table->decimal('price', 10, 2);
            $table->integer('threshold')->default(0); // Minimum stock level for alerts
            $table->string('category')->nullable(); // Category for filtering
            $table->string('location')->nullable(); // Storage location
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
