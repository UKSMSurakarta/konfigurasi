<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jawabans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sekolah_id')->constrained('sekolahs')->onDelete('cascade');
            $table->foreignId('pertanyaan_id')->constrained('pertanyaans')->onDelete('cascade');
            $table->foreignId('period_id')->constrained('assessment_periods')->onDelete('cascade');
            $table->text('jawaban_teks')->nullable();
            $table->integer('nilai')->default(0);
            $table->string('file_path')->nullable();
            $table->boolean('is_final')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            
            $table->index(['sekolah_id', 'pertanyaan_id', 'period_id'], 'sekolah_pertanyaan_period_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jawabans');
    }
};
