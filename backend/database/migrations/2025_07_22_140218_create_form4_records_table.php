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
    Schema::create('form4_records', function (Blueprint $table) {
        $table->id();
        $table->string('ticker')->index();
        $table->string('filer_name');
        $table->string('transaction_type');
        $table->decimal('file_value', 20, 2)->nullable();
        $table->bigInteger('shares')->nullable();
        $table->timestamp('filed_at');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form4_records');
    }
};
