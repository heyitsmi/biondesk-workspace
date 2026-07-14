<?php

namespace App\Support\Embeddings;

use App\Models\EmbeddingIndexEntry;
use App\Models\RequestLog;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class EmbeddingIndexService
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private readonly EmbeddingTextBuilder $textBuilder,
        private readonly OpenAIEmbeddingService $embeddingService,
    ) {}

    public function refreshTask(Task $task, ?User $user = null): EmbeddingIndexEntry
    {
        $task->loadMissing('project.team');

        return $this->refresh(
            model: $task,
            team: $task->project->team,
            projectId: $task->project_id,
            text: $this->textBuilder->forTask($task),
            metadata: $this->textBuilder->taskMetadata($task),
            user: $user,
        );
    }

    public function refreshRequestLog(RequestLog $requestLog, ?User $user = null): EmbeddingIndexEntry
    {
        $requestLog->loadMissing('project.team');

        return $this->refresh(
            model: $requestLog,
            team: $requestLog->project->team,
            projectId: $requestLog->project_id,
            text: $this->textBuilder->forRequestLog($requestLog),
            metadata: [
                'id' => $requestLog->id,
                'uuid' => $requestLog->uuid,
                'classification' => $requestLog->classification->value,
                'status' => $requestLog->status->value,
            ],
            user: $user,
        );
    }

    public function isFresh(Model $model, string $text): bool
    {
        $entry = EmbeddingIndexEntry::query()
            ->where('embeddable_type', $model::class)
            ->where('embeddable_id', $model->getKey())
            ->where('embedding_model', (string) config('services.openai.embedding_model', 'text-embedding-3-small'))
            ->where('embedding_dimensions', (int) config('services.openai.embedding_dimensions', 1536))
            ->first();

        return $entry !== null
            && $entry->content_hash === $this->hash($text)
            && $entry->embedded_at !== null
            && $entry->embedding !== null;
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function refresh(
        Model $model,
        Team $team,
        int $projectId,
        string $text,
        array $metadata,
        ?User $user,
    ): EmbeddingIndexEntry {
        $embedding = $this->embeddingService->embed($text, $team, $user);
        $hash = $this->hash($text);

        $entry = EmbeddingIndexEntry::updateOrCreate(
            [
                'embeddable_type' => $model::class,
                'embeddable_id' => $model->getKey(),
                'embedding_model' => $embedding['model'],
                'embedding_dimensions' => $embedding['dimensions'],
            ],
            [
                'team_id' => $team->id,
                'project_id' => $projectId,
                'content_hash' => $hash,
                'embedded_text' => $text,
                'embedding' => $embedding['embedding'],
                'metadata' => $metadata,
                'embedded_at' => now(),
                'failed_at' => null,
                'failure_reason' => null,
            ],
        );

        $this->storePgVector($entry, $embedding['embedding']);

        return $entry;
    }

    private function hash(string $text): string
    {
        return hash('sha256', $text);
    }

    /**
     * @param  list<float>  $embedding
     */
    private function storePgVector(EmbeddingIndexEntry $entry, array $embedding): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::update(
            'update embedding_index_entries set embedding_vector = ?::vector where id = ?',
            [$this->vectorLiteral($embedding), $entry->id],
        );
    }

    /**
     * @param  list<float>  $embedding
     */
    private function vectorLiteral(array $embedding): string
    {
        return '['.implode(',', array_map(fn (float $value) => (string) $value, $embedding)).']';
    }
}
