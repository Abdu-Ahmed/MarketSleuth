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
    Schema::create('dividend_records', function (Blueprint $table) {
        $table->id();
        $table->string('ticker')->index();
        $table->decimal('amount', 12, 4);
        $table->date('ex_date');
        $table->date('pay_date')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dividend_records');
    }
};
