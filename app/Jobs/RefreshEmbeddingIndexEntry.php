<?php

namespace App\Jobs;

use App\Models\RequestLog;
use App\Models\Task;
use App\Models\User;
use App\Support\Ai\AiGenerationException;
use App\Support\Embeddings\EmbeddingIndexService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Backoff;

#[Backoff([10, 60, 300])]
class RefreshEmbeddingIndexEntry implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly string $embeddableType,
        public readonly int $embeddableId,
        public readonly ?int $userId = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(EmbeddingIndexService $indexService): void
    {
        $user = $this->userId === null ? null : User::find($this->userId);

        if ($this->embeddableType === Task::class) {
            $task = Task::query()->find($this->embeddableId);

            if ($task !== null) {
                $indexService->refreshTask($task, $user);
            }

            return;
        }

        if ($this->embeddableType === RequestLog::class) {
            $requestLog = RequestLog::query()->find($this->embeddableId);

            if ($requestLog !== null) {
                $indexService->refreshRequestLog($requestLog, $user);
            }
        }
    }

    public function retryUntil(): \DateTimeInterface
    {
        return now()->addMinutes(20);
    }

    public function failed(?\Throwable $exception): void
    {
        if (! $exception instanceof AiGenerationException) {
            return;
        }
    }
}
