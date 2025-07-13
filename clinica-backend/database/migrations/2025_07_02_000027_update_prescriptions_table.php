<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            // Drop the old single medication columns
            $table->dropColumn(['medication', 'dosage', 'instructions']);
            
            // Add new columns for multiple medications support
            $table->json('medications')->after('date');
            $table->string('diagnosis')->after('medications');
            $table->string('status')->default('Active')->after('notes');
            $table->date('next_checkup')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            // Revert the changes
            $table->dropColumn(['medications', 'diagnosis', 'status', 'next_checkup']);
            $table->string('medication');
            $table->string('dosage');
            $table->string('instructions')->nullable();
        });
    }
}; 