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
        Schema::create('bion_ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('bion_ai_conversations')->cascadeOnDelete();
            $table->string('role', 20);
            $table->longText('content')->nullable();
            $table->json('tool_calls')->nullable();
            $table->string('tool_name')->nullable();
            $table->string('tool_call_id')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bion_ai_messages');
    }
};
