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
        Schema::table('sekolah_sertifikats', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('is_auto');
            $table->text('catatan_superadmin')->nullable()->after('file_path');
            $table->string('status')->default('published')->after('catatan_superadmin');
            $table->string('nomor_surat')->nullable()->change();
            $table->string('predikat')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sekolah_sertifikats', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'catatan_superadmin', 'status']);
            $table->string('nomor_surat')->nullable(false)->change();
            $table->string('predikat')->nullable(false)->change();
        });
    }
};
