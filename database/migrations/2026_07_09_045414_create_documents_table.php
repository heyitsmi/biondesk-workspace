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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('proposal');
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('opportunity_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('number');
            $table->string('title')->nullable();
            $table->string('status')->default('draft');
            $table->date('issued_at')->nullable();
            $table->date('valid_until')->nullable();
            $table->date('due_at')->nullable();
            $table->string('currency')->default('USD');
            $table->unsignedInteger('discount_percent')->default(0);
            $table->unsignedInteger('tax_percent')->default(0);
            $table->text('content')->nullable();
            $table->text('notes')->nullable();
            $table->string('public_token')->nullable()->unique();
            $table->timestamps();

            $table->unique(['team_id', 'number']);
            $table->index(['team_id', 'type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
