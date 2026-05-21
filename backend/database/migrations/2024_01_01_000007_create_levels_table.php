<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->integer('urutan');
            $table->text('deskripsi')->nullable();
            $table->foreignId('period_id')->constrained('assessment_periods')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['period_id', 'urutan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('levels');
    }
};
