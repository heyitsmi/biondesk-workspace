<?php

namespace Database\Factories;

use App\Models\EmbeddingIndexEntry;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmbeddingIndexEntry>
 */
class EmbeddingIndexEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $task = Task::factory()->create();

        return [
            'team_id' => $task->project->team_id,
            'project_id' => $task->project_id,
            'embeddable_type' => Task::class,
            'embeddable_id' => $task->id,
            'embedding_model' => 'text-embedding-3-small',
            'embedding_dimensions' => 1536,
            'content_hash' => hash('sha256', $task->title),
            'embedded_text' => $task->title,
            'embedding' => [1.0, 0.0, 0.0],
            'metadata' => ['title' => $task->title],
            'embedded_at' => now(),
        ];
    }
}
