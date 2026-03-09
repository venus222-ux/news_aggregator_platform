<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::connection('mongodb')->getCollection('articles')->createIndex(['url' => 1], ['unique' => true]);
        DB::connection('mongodb')->getCollection('articles')->createIndex(['published_at' => -1]);
        DB::connection('mongodb')->getCollection('articles')->createIndex(['category_id' => 1]);
    }

    public function down(): void
    {
        // Drop indexes if needed
    }
};
