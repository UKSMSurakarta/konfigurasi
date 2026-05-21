<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pertanyaans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->constrained('levels')->onDelete('cascade');
            $table->text('teks_pertanyaan');
            $table->enum('tipe_jawaban', ['ya_tidak', 'pilihan_ganda', 'isian', 'upload']);
            $table->integer('bobot')->default(1);
            $table->integer('urutan');
            $table->boolean('is_required')->default(true);
            $table->timestamps();
            
            $table->index(['level_id', 'urutan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pertanyaans');
    }
};
