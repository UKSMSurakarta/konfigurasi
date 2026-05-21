<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['superadmin', 'admin', 'user', 'sekolah'])->default('user')->after('password');
            $table->unsignedBigInteger('opd_id')->nullable()->after('role');
            $table->unsignedBigInteger('sekolah_id')->nullable()->after('opd_id');
            $table->boolean('is_active')->default(true)->after('sekolah_id');
            
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'opd_id', 'sekolah_id', 'is_active']);
        });
    }
};
