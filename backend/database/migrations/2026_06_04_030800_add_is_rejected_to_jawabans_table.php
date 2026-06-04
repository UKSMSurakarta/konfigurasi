<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('jawabans', 'is_rejected')) {
            Schema::table('jawabans', function (Blueprint $table) {
                $table->boolean('is_rejected')->default(false)->after('is_final');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('jawabans', 'is_rejected')) {
            Schema::table('jawabans', function (Blueprint $table) {
                $table->dropColumn('is_rejected');
            });
        }
    }
};
