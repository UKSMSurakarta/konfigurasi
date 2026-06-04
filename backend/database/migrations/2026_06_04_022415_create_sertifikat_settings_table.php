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
        Schema::create('sertifikat_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opd_id')->constrained('opds')->cascadeOnDelete();
            $table->string('nama_penerbit')->default('Dinas Kesehatan');
            $table->string('jabatan_penandatangan')->default('Kepala Dinas Kesehatan');
            $table->string('format_nomor_surat')->default('UKS/[TAHUN]/[ID_SEKOLAH]');
            $table->boolean('is_auto_number')->default(true);
            $table->string('logo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sertifikat_settings');
    }
};
