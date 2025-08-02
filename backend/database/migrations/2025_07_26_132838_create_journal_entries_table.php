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
    Schema::create('journal_entries', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->string('ticker');
        $table->enum('type', ['buy','sell','note']);
        $table->decimal('quantity', 16, 4)->nullable();
        $table->decimal('price', 16, 4)->nullable();
        $table->decimal('pl', 16, 4)->nullable(); // profit/loss
        $table->json('tags')->nullable();        // e.g. ["momentum","covered call"]
        $table->text('notes')->nullable();
        $table->string('attachment_url')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
