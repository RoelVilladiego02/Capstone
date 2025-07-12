<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('uploaded_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // patient user
            $table->unsignedBigInteger('medical_record_id')->nullable();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('type')->nullable(); // e.g., lab result, x-ray, etc.
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('medical_record_id')->references('id')->on('medical_records')->onDelete('set null');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('uploaded_documents');
    }
}; 