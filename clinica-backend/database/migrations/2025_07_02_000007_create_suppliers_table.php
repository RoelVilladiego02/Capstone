<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('phone');
            $table->string('email');
            $table->string('address');
            $table->string('category')->nullable(); // Medical Equipment, Pharmaceuticals, etc.
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->decimal('rating', 2, 1)->default(0.0); // Rating out of 5
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
