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
        Schema::create('scanner_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scanner_id')->constrained()->cascadeOnDelete();
            $table->string('ticker')->index();
            $table->timestamp('matched_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scanner_results');
    }
};
