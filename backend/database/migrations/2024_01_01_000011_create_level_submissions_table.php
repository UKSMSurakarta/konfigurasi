<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('level_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sekolah_id')->constrained('sekolahs')->onDelete('cascade');
            $table->foreignId('level_id')->constrained('levels')->onDelete('cascade');
            $table->foreignId('period_id')->constrained('assessment_periods')->onDelete('cascade');
            $table->enum('status', ['draft', 'submitted', 'final'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->integer('total_skor')->default(0);
            $table->timestamps();
            
            $table->index(['sekolah_id', 'level_id', 'period_id'], 'sekolah_level_period_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('level_submissions');
    }
};
