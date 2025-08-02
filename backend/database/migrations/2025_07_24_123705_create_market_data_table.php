<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('market_data', function (Blueprint $table) {
            $table->id();
            $table->string('symbol');
            $table->decimal('price', 10, 4)->nullable();
            $table->decimal('change', 10, 4)->nullable();
            $table->decimal('change_pct', 8, 4)->nullable();
            $table->bigInteger('volume')->nullable();
            $table->decimal('open', 10, 4)->nullable();
            $table->decimal('high', 10, 4)->nullable();
            $table->decimal('low', 10, 4)->nullable();
            $table->decimal('close', 10, 4)->nullable();
            $table->timestamp('market_timestamp')->nullable();
            $table->timestamps();
            
            $table->index('symbol');
            $table->index(['symbol', 'updated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market_data');
    }
};