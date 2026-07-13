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
        Schema::create('recurring_invoice_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('currency')->default('USD');
            $table->unsignedInteger('tax_percent')->default(0);
            $table->text('notes')->nullable();
            $table->unsignedInteger('interval_months')->default(1);
            $table->unsignedInteger('due_days')->default(14);
            $table->date('starts_at');
            $table->date('ends_at')->nullable();
            $table->date('next_run_at');
            $table->date('last_generated_at')->nullable();
            $table->unsignedInteger('occurrences_generated')->default(0);
            $table->boolean('auto_send')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['team_id', 'is_active']);
            $table->index('next_run_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_invoice_templates');
    }
};
