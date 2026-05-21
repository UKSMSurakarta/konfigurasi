<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('level_submissions', function (Blueprint $table) {
            // Update status enum by changing column type (Laravel 10+ handles this well)
            $table->string('status')->default('draft')->change(); 
            
            // Add missing fields
            $table->timestamp('verified_at')->nullable()->after('finalized_at');
            $table->foreignId('verifier_id')->nullable()->after('verified_at')->constrained('users')->onDelete('set null');
            $table->text('catatan_verifikator')->nullable()->after('verifier_id');
        });
    }

    public function down(): void
    {
        Schema::table('level_submissions', function (Blueprint $table) {
            $table->dropForeign(['verifier_id']);
            $table->dropColumn(['verified_at', 'verifier_id', 'catatan_verifikator']);
            // Enum rollback is tricky, usually not needed if we keep it string
        });
    }
};
