<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sekolahs', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('npsn')->unique();
            $table->enum('jenjang', ['TK', 'SD', 'SMP', 'SMA', 'SMK']);
            $table->text('alamat')->nullable();
            $table->string('kepala_sekolah')->nullable();
            $table->foreignId('opd_id')->constrained('opds')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('jenjang');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sekolahs');
    }
};
