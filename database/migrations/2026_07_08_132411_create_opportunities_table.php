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
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('stage')->default('inbox');
            $table->string('source')->nullable();
            $table->unsignedInteger('amount_value')->default(0);
            $table->string('priority')->default('medium');
            $table->date('close_date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['team_id', 'stage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
