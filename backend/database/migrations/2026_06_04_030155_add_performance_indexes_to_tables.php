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
        Schema::table('sekolahs', function (Blueprint $table) {
            $table->index('opd_id', 'idx_sekolahs_opd_id');
        });

        Schema::table('level_submissions', function (Blueprint $table) {
            $table->index(['sekolah_id', 'period_id', 'status'], 'idx_level_sub_sekolah_period_status');
            $table->index('status', 'idx_level_sub_status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('opd_id', 'idx_users_opd_id');
            $table->index('sekolah_id', 'idx_users_sekolah_id');
            $table->index('role', 'idx_users_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sekolahs', function (Blueprint $table) {
            $table->dropIndex('idx_sekolahs_opd_id');
        });

        Schema::table('level_submissions', function (Blueprint $table) {
            $table->dropIndex('idx_level_sub_sekolah_period_status');
            $table->dropIndex('idx_level_sub_status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_opd_id');
            $table->dropIndex('idx_users_sekolah_id');
            $table->dropIndex('idx_users_role');
        });
    }
};
