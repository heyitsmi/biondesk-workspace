<?php

namespace App\Console\Commands;

use App\Jobs\RefreshEmbeddingIndexEntry;
use App\Models\RequestLog;
use App\Models\Task;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('embedding-index:backfill {--team=} {--project=} {--source=tasks : tasks, requests, or all} {--sync : Run immediately instead of queueing jobs}')]
#[Description('Backfill semantic embedding index entries for task/request matching')]
class BackfillEmbeddingIndex extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $source = (string) $this->option('source');

        if (! in_array($source, ['tasks', 'requests', 'all'], true)) {
            $this->error('The --source option must be tasks, requests, or all.');

            return self::FAILURE;
        }

        $count = 0;

        if (in_array($source, ['tasks', 'all'], true)) {
            $count += $this->queueTasks();
        }

        if (in_array($source, ['requests', 'all'], true)) {
            $count += $this->queueRequestLogs();
        }

        $this->info("Queued {$count} embedding index refresh jobs.");

        return self::SUCCESS;
    }

    private function queueTasks(): int
    {
        $count = 0;

        Task::query()
            ->when($this->option('project'), fn ($query, mixed $projectId) => $query->where('project_id', (int) $projectId))
            ->when($this->option('team'), fn ($query, mixed $teamId) => $query->whereHas('project', fn ($projectQuery) => $projectQuery->where('team_id', (int) $teamId)))
            ->orderBy('id')
            ->each(function (Task $task) use (&$count): void {
                $this->dispatchRefresh(Task::class, $task->id);
                $count++;
            });

        return $count;
    }

    private function queueRequestLogs(): int
    {
        $count = 0;

        RequestLog::query()
            ->when($this->option('project'), fn ($query, mixed $projectId) => $query->where('project_id', (int) $projectId))
            ->when($this->option('team'), fn ($query, mixed $teamId) => $query->whereHas('project', fn ($projectQuery) => $projectQuery->where('team_id', (int) $teamId)))
            ->orderBy('id')
            ->each(function (RequestLog $requestLog) use (&$count): void {
                $this->dispatchRefresh(RequestLog::class, $requestLog->id);
                $count++;
            });

        return $count;
    }

    private function dispatchRefresh(string $type, int $id): void
    {
        $job = new RefreshEmbeddingIndexEntry($type, $id);

        if ($this->option('sync')) {
            dispatch_sync($job);

            return;
        }

        dispatch($job);
    }
}
