<?php
/**
 * Migration to add profile fields to sekolahs table.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sekolahs', function (Blueprint $table) {
            $table->string('telepon')->nullable()->after('kepala_sekolah');
            $table->string('email_sekolah')->nullable()->after('telepon');
            $table->string('akreditasi', 2)->nullable()->after('email_sekolah');
            $table->integer('tahun_bergabung')->nullable()->after('akreditasi');
        });
    }

    public function down(): void
    {
        Schema::table('sekolahs', function (Blueprint $table) {
            $table->dropColumn(['telepon', 'email_sekolah', 'akreditasi', 'tahun_bergabung']);
        });
    }
};
