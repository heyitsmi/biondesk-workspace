<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('embedding_index_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('embeddable_type');
            $table->unsignedBigInteger('embeddable_id');
            $table->string('embedding_model');
            $table->unsignedSmallInteger('embedding_dimensions');
            $table->string('content_hash', 64);
            $table->text('embedded_text');
            $table->json('embedding')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('embedded_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->unique(['embeddable_type', 'embeddable_id', 'embedding_model', 'embedding_dimensions'], 'embedding_entries_unique_source');
            $table->index(['team_id', 'project_id', 'embeddable_type'], 'embedding_entries_scope_index');
            $table->index(['content_hash']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('create extension if not exists vector');
            DB::statement('alter table embedding_index_entries add column embedding_vector vector(1536)');
            DB::statement('create index embedding_entries_vector_cosine_index on embedding_index_entries using hnsw (embedding_vector vector_cosine_ops)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('embedding_index_entries');
    }
};
