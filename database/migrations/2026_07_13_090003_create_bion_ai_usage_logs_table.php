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
        Schema::create('bion_ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained('bion_ai_conversations')->nullOnDelete();
            $table->string('provider', 20);
            $table->string('model');
            $table->unsignedInteger('input_tokens');
            $table->unsignedInteger('output_tokens');
            // Micro-units of USD (1 USD = 1,000,000 micros), not cents — a
            // single chat turn typically costs a fraction of a cent, which
            // would round to 0 in an integer cents column and make every
            // usage log look free.
            $table->unsignedBigInteger('estimated_cost_micros')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['team_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bion_ai_usage_logs');
    }
};
