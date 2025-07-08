<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('age')->nullable()->after('phone_number');
            $table->string('gender')->nullable()->after('age');
            $table->string('status')->default('Active')->after('gender');
            $table->string('specialization')->nullable()->after('status');
            $table->string('department')->nullable()->after('specialization');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['age', 'gender', 'status', 'specialization', 'department']);
        });
    }
}; 