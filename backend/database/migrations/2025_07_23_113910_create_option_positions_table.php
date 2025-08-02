<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('option_positions', function (Blueprint $table) {
            $table->id();
            $table->string('ticker')->index();
            $table->decimal('strike', 10, 2);
            $table->date('expiry');
            $table->decimal('premium_received', 10, 2);
            $table->integer('contracts')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('option_positions');
    }
};
