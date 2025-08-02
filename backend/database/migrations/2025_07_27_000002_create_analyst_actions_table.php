<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analyst_actions', function (Blueprint $table) {
            $table->id();
            $table->string('symbol')->index();
            $table->date('action_date')->index();
            $table->string('from_rating')->nullable();
            $table->string('to_rating')->nullable();
            $table->string('source_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analyst_actions');
    }
};
