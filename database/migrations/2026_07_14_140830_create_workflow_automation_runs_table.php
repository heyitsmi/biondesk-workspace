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
        Schema::create('workflow_automation_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('workflow_automation_id')->constrained()->cascadeOnDelete();
            $table->string('trigger');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('status');
            $table->string('idempotency_key')->unique();
            $table->text('message')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('ran_at');
            $table->timestamps();

            $table->index(['team_id', 'status', 'ran_at']);
            $table->index(['subject_type', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_automation_runs');
    }
};
