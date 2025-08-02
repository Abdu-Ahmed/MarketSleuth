<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('data_sources', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();            // e.g. "polygon", "yahoo"
            $table->string('name');                     // Friendly name
            $table->boolean('enabled')->default(false);
            $table->text('config')->nullable();         // JSON, e.g. { "api_key": "xxx" }
            $table->timestamps();
        });

        // Seed some defaults
        DB::table('data_sources')->insert([
          ['key'=>'polygon','name'=>'Polygon.io','enabled'=>false,'config'=>json_encode([])],
          ['key'=>'newsdata','name'=>'News Data','enabled'=>false,'config'=>json_encode([])],
          ['key'=>'fmp','name'=>'FMP','enabled'=>false,'config'=>json_encode([])],
        ]);
    }
    public function down() {
        Schema::dropIfExists('data_sources');
    }
};
