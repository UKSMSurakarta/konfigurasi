<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengumumans', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('isi');
            $table->unsignedBigInteger('sender_id'); // user yang mengirim
            $table->enum('target_type', ['all', 'opd'])->default('opd');
            $table->unsignedBigInteger('opd_id')->nullable(); // null jika target = all
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('opd_id')->references('id')->on('opds')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengumumans');
    }
};
