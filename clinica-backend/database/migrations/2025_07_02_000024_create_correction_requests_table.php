<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('correction_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // patient user
            $table->unsignedBigInteger('medical_record_id')->nullable();
            $table->text('request');
            $table->string('status')->default('Pending'); // Pending, Approved, Rejected
            $table->text('admin_response')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('medical_record_id')->references('id')->on('medical_records')->onDelete('set null');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('correction_requests');
    }
}; 