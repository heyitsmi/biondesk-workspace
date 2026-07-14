<?php

namespace App\Support\RequestLogs;

use App\Models\EmbeddingIndexEntry;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\Task;
use App\Models\User;
use App\Support\Embeddings\EmbeddingIndexService;
use App\Support\Embeddings\EmbeddingTextBuilder;
use App\Support\Embeddings\OpenAIEmbeddingService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RequestLogSemanticMatcher
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private readonly EmbeddingTextBuilder $textBuilder,
        private readonly EmbeddingIndexService $indexService,
        private readonly OpenAIEmbeddingService $embeddingService,
    ) {}

    /**
     * @return list<array{id: int, title: string, status: string, description: string, tags: list<string>, similarity: float}>
     */
    public function taskMatches(Project $project, RequestLog $requestLog, User $user, int $limit = 12): array
    {
        $project->loadMissing(['team', 'tasks']);

        if ($project->tasks->isEmpty()) {
            return [];
        }

        $project->tasks->each(function (Task $task) use ($user): void {
            $text = $this->textBuilder->forTask($task);

            if (! $this->indexService->isFresh($task, $text)) {
                $this->indexService->refreshTask($task, $user);
            }
        });

        $queryEmbedding = $this->embeddingService->embed(
            $this->textBuilder->forRequestLog($requestLog),
            $project->team,
            $user,
        );

        $entries = DB::getDriverName() === 'pgsql'
            ? $this->pgMatches($project, $queryEmbedding['embedding'], $queryEmbedding['model'], $queryEmbedding['dimensions'], $limit)
            : $this->phpMatches($project, $queryEmbedding['embedding'], $queryEmbedding['model'], $queryEmbedding['dimensions'], $limit);

        return $entries
            ->map(function (array $match): array {
                /** @var EmbeddingIndexEntry $entry */
                $entry = $match['entry'];
                /** @var array{id?: int, title?: string, status?: string, description?: string, tags?: list<string>} $metadata */
                $metadata = $entry->metadata ?? [];

                return [
                    'id' => (int) ($metadata['id'] ?? $entry->embeddable_id),
                    'title' => (string) ($metadata['title'] ?? 'Untitled task'),
                    'status' => (string) ($metadata['status'] ?? 'todo'),
                    'description' => (string) ($metadata['description'] ?? ''),
                    'tags' => array_values($metadata['tags'] ?? []),
                    'similarity' => round((float) $match['similarity'], 4),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  list<float>  $embedding
     * @return Collection<int, array{entry: EmbeddingIndexEntry, similarity: float}>
     */
    private function pgMatches(Project $project, array $embedding, string $model, int $dimensions, int $limit): Collection
    {
        $rows = DB::table('embedding_index_entries')
            ->selectRaw('id, 1 - (embedding_vector <=> ?::vector) as similarity', [$this->vectorLiteral($embedding)])
            ->where('team_id', $project->team_id)
            ->where('project_id', $project->id)
            ->where('embeddable_type', Task::class)
            ->where('embedding_model', $model)
            ->where('embedding_dimensions', $dimensions)
            ->whereNotNull('embedding_vector')
            ->orderByRaw('embedding_vector <=> ?::vector', [$this->vectorLiteral($embedding)])
            ->limit($limit)
            ->get();

        $entries = EmbeddingIndexEntry::query()
            ->whereIn('id', $rows->pluck('id')->all())
            ->get()
            ->keyBy('id');

        return $rows
            ->map(fn (object $row) => [
                'entry' => $entries[(int) $row->id],
                'similarity' => (float) $row->similarity,
            ])
            ->filter(fn (array $match) => $match['entry'] instanceof EmbeddingIndexEntry)
            ->values();
    }

    /**
     * @param  list<float>  $embedding
     * @return Collection<int, array{entry: EmbeddingIndexEntry, similarity: float}>
     */
    private function phpMatches(Project $project, array $embedding, string $model, int $dimensions, int $limit): Collection
    {
        return EmbeddingIndexEntry::query()
            ->where('team_id', $project->team_id)
            ->where('project_id', $project->id)
            ->where('embeddable_type', Task::class)
            ->where('embedding_model', $model)
            ->where('embedding_dimensions', $dimensions)
            ->get()
            ->map(fn (EmbeddingIndexEntry $entry) => [
                'entry' => $entry,
                'similarity' => $this->cosine($embedding, $entry->embedding ?? []),
            ])
            ->sortByDesc('similarity')
            ->take($limit)
            ->values();
    }

    /**
     * @param  list<float>  $a
     * @param  list<float>  $b
     */
    private function cosine(array $a, array $b): float
    {
        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;
        $length = min(count($a), count($b));

        for ($index = 0; $index < $length; $index++) {
            $dot += $a[$index] * $b[$index];
            $normA += $a[$index] ** 2;
            $normB += $b[$index] ** 2;
        }

        if ($normA <= 0.0 || $normB <= 0.0) {
            return 0.0;
        }

        return $dot / (sqrt($normA) * sqrt($normB));
    }

    /**
     * @param  list<float>  $embedding
     */
    private function vectorLiteral(array $embedding): string
    {
        return '['.implode(',', array_map(fn (float $value) => (string) $value, $embedding)).']';
    }
}
