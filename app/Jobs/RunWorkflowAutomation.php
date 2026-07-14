<?php

namespace App\Jobs;

use App\Enums\WorkflowAutomationTrigger;
use App\Support\WorkflowAutomations\WorkflowAutomationRunner;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;

class RunWorkflowAutomation implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        public int $teamId,
        public string $trigger,
        public string $subjectType,
        public int $subjectId,
        public array $context = [],
    ) {}

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("workflow-automation:{$this->teamId}:{$this->trigger}:{$this->subjectType}:{$this->subjectId}"))
                ->releaseAfter(30)
                ->expireAfter(180),
        ];
    }

    /**
     * Execute the job.
     */
    public function handle(WorkflowAutomationRunner $runner): void
    {
        $trigger = WorkflowAutomationTrigger::tryFrom($this->trigger);

        if (! $trigger) {
            return;
        }

        $runner->runForTrigger($this->teamId, $trigger, $this->subjectType, $this->subjectId, $this->context);
    }
}
