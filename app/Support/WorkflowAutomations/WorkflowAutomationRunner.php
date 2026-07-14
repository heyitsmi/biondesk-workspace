<?php

namespace App\Support\WorkflowAutomations;

use App\Enums\EventColor;
use App\Enums\ProjectStatus;
use App\Enums\RequestLogStatus;
use App\Enums\TaskStatus;
use App\Enums\WorkflowAutomationAction;
use App\Enums\WorkflowAutomationRunStatus;
use App\Enums\WorkflowAutomationTrigger;
use App\Models\Document;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\RequestLogMessage;
use App\Models\Task;
use App\Models\Team;
use App\Models\WorkflowAutomation;
use App\Models\WorkflowAutomationRun;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Throwable;

class WorkflowAutomationRunner
{
    /**
     * Run active automations for one trigger and subject.
     *
     * @param  array<string, mixed>  $context
     */
    public function runForTrigger(
        int $teamId,
        WorkflowAutomationTrigger $trigger,
        string $subjectType,
        int $subjectId,
        array $context = [],
    ): void {
        $team = Team::query()->find($teamId);
        $subject = $this->resolveSubject($subjectType, $subjectId);

        if (! $team || ! $subject || ! $this->subjectBelongsToTeam($subject, $team)) {
            return;
        }

        WorkflowAutomation::query()
            ->whereBelongsTo($team)
            ->where('is_active', true)
            ->where('trigger', $trigger)
            ->get()
            ->each(fn (WorkflowAutomation $automation) => $this->runAutomation($automation, $subject, $context));
    }

    /**
     * Execute one active automation against one subject.
     *
     * @param  array<string, mixed>  $context
     */
    private function runAutomation(WorkflowAutomation $automation, Model $subject, array $context): void
    {
        $idempotencyKey = $this->idempotencyKey($automation, $subject, $context);

        if (WorkflowAutomationRun::query()->where('idempotency_key', $idempotencyKey)->exists()) {
            return;
        }

        if (! $this->matchesConditions($automation, $subject, $context)) {
            $this->recordRun($automation, $subject, WorkflowAutomationRunStatus::Skipped, $idempotencyKey, 'Conditions did not match.', $context);

            return;
        }

        try {
            $results = [];

            DB::transaction(function () use ($automation, $subject, $context, &$results): void {
                foreach ($automation->actions as $action) {
                    $results[] = $this->executeAction($automation, $subject, $action, $context);
                }

                $automation->update(['last_run_at' => now()]);
            });

            $message = collect($results)->filter()->join(' ');
            $status = $message === '' ? WorkflowAutomationRunStatus::Skipped : WorkflowAutomationRunStatus::Success;

            $this->recordRun($automation, $subject, $status, $idempotencyKey, $message ?: 'No action was performed.', $context);
        } catch (Throwable $exception) {
            $this->recordRun($automation, $subject, WorkflowAutomationRunStatus::Failed, $idempotencyKey, $exception->getMessage(), $context);
        }
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function matchesConditions(WorkflowAutomation $automation, Model $subject, array $context): bool
    {
        $conditions = $automation->conditions ?? [];

        if ($conditions === []) {
            return true;
        }

        if (isset($conditions['status'])) {
            $status = $context['status'] ?? $context['new_status'] ?? $this->statusValue($subject);

            if ($status !== $conditions['status']) {
                return false;
            }
        }

        if (isset($conditions['document_status']) && $subject instanceof Document) {
            return $subject->status->value === $conditions['document_status'];
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $action
     * @param  array<string, mixed>  $context
     */
    private function executeAction(WorkflowAutomation $automation, Model $subject, array $action, array $context): string
    {
        $type = WorkflowAutomationAction::tryFrom((string) ($action['type'] ?? ''));

        return match ($type) {
            WorkflowAutomationAction::CreateTask => $this->createTask($automation, $subject, $action, $context),
            WorkflowAutomationAction::CreateCalendarEvent => $this->createCalendarEvent($automation, $subject, $action, $context),
            WorkflowAutomationAction::UpdateRequestStatus => $this->updateRequestStatus($subject, $action),
            WorkflowAutomationAction::UpdateProjectStatus => $this->updateProjectStatus($subject, $action),
            WorkflowAutomationAction::AddActivityLog => $this->addActivityLog($subject, $action, $context),
            default => throw new InvalidArgumentException('Unsupported workflow action.'),
        };
    }

    /**
     * @param  array<string, mixed>  $action
     * @param  array<string, mixed>  $context
     */
    private function createTask(WorkflowAutomation $automation, Model $subject, array $action, array $context): string
    {
        $project = $this->resolveProject($subject);

        if (! $project) {
            return 'No linked project was available for task creation.';
        }

        $requestLog = $this->resolveRequestLog($subject);
        $title = $this->interpolate((string) ($action['title'] ?? 'Workflow automation task'), $subject, $context);
        $description = $this->interpolate((string) ($action['description'] ?? ''), $subject, $context);
        $status = TaskStatus::tryFrom((string) ($action['status'] ?? TaskStatus::Todo->value)) ?? TaskStatus::Todo;

        $task = Task::query()->firstOrCreate([
            'project_id' => $project->id,
            'request_log_id' => $requestLog?->id,
            'title' => $title,
        ], [
            'status' => $status,
            'description' => $description,
            'tags' => Arr::wrap($action['tags'] ?? ['automation']),
        ]);

        return $task->wasRecentlyCreated
            ? "Task created: {$task->title}."
            : "Task already existed: {$task->title}.";
    }

    /**
     * @param  array<string, mixed>  $action
     * @param  array<string, mixed>  $context
     */
    private function createCalendarEvent(WorkflowAutomation $automation, Model $subject, array $action, array $context): string
    {
        $project = $this->resolveProject($subject);
        $team = $automation->team;

        if (! $project) {
            return 'No linked project was available for calendar event creation.';
        }

        $delayDays = max(0, (int) ($action['delay_days'] ?? 2));
        $startsAt = now()->addDays($delayDays)->startOfDay();
        $title = $this->interpolate((string) ($action['title'] ?? 'Workflow follow-up'), $subject, $context);

        $event = $team->events()->firstOrCreate([
            'title' => $title,
            'starts_at' => $startsAt,
        ], [
            'description' => $this->interpolate((string) ($action['description'] ?? ''), $subject, $context),
            'ends_at' => null,
            'all_day' => true,
            'location' => null,
            'color' => EventColor::Accent,
            'recurrence' => null,
        ]);

        return $event->wasRecentlyCreated
            ? "Calendar event created: {$event->title}."
            : "Calendar event already existed: {$event->title}.";
    }

    /**
     * @param  array<string, mixed>  $action
     */
    private function updateRequestStatus(Model $subject, array $action): string
    {
        $requestLog = $this->resolveRequestLog($subject);
        $status = RequestLogStatus::tryFrom((string) ($action['status'] ?? ''));

        if (! $requestLog || ! $status) {
            return 'Request status update skipped.';
        }

        if ($requestLog->status === $status) {
            return "Request status already {$status->label()}.";
        }

        $requestLog->update(['status' => $status]);

        return "Request status updated to {$status->label()}.";
    }

    /**
     * @param  array<string, mixed>  $action
     */
    private function updateProjectStatus(Model $subject, array $action): string
    {
        $project = $this->resolveProject($subject);
        $status = ProjectStatus::tryFrom((string) ($action['status'] ?? ''));

        if (! $project || ! $status) {
            return 'Project status update skipped.';
        }

        if ($project->status === $status) {
            return "Project status already {$status->label()}.";
        }

        $project->update(['status' => $status]);

        return "Project status updated to {$status->label()}.";
    }

    /**
     * @param  array<string, mixed>  $action
     * @param  array<string, mixed>  $context
     */
    private function addActivityLog(Model $subject, array $action, array $context): string
    {
        $project = $this->resolveProject($subject);

        if (! $project) {
            return 'Activity log skipped.';
        }

        $message = $this->interpolate((string) ($action['message'] ?? 'Workflow automation ran.'), $subject, $context);

        activity()
            ->performedOn($project)
            ->withProperties(['tone' => (string) ($action['tone'] ?? 'accent')])
            ->log($message);

        return 'Activity log added.';
    }

    private function resolveSubject(string $subjectType, int $subjectId): ?Model
    {
        if (! in_array($subjectType, [Document::class, Project::class, RequestLog::class, RequestLogMessage::class], true)) {
            return null;
        }

        /** @var class-string<Model> $subjectType */
        return $subjectType::query()->find($subjectId);
    }

    private function subjectBelongsToTeam(Model $subject, Team $team): bool
    {
        return match (true) {
            $subject instanceof Project => $subject->team_id === $team->id,
            $subject instanceof Document => $subject->team_id === $team->id,
            $subject instanceof RequestLog => $subject->project()->whereBelongsTo($team)->exists(),
            $subject instanceof RequestLogMessage => $subject->requestLog?->project()->whereBelongsTo($team)->exists() ?? false,
            default => false,
        };
    }

    private function resolveProject(Model $subject): ?Project
    {
        return match (true) {
            $subject instanceof Project => $subject,
            $subject instanceof RequestLog => $subject->project,
            $subject instanceof RequestLogMessage => $subject->requestLog?->project,
            $subject instanceof Document => $subject->project,
            default => null,
        };
    }

    private function resolveRequestLog(Model $subject): ?RequestLog
    {
        return match (true) {
            $subject instanceof RequestLog => $subject,
            $subject instanceof RequestLogMessage => $subject->requestLog,
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function interpolate(string $text, Model $subject, array $context): string
    {
        $requestLog = $this->resolveRequestLog($subject);
        $project = $this->resolveProject($subject);
        $document = $subject instanceof Document ? $subject : null;
        $message = $subject instanceof RequestLogMessage ? $subject : null;
        $contact = $project?->opportunity?->contact ?? $document?->contact;

        $replacements = [
            '{{request_text}}' => $requestLog?->text ?? '',
            '{{request_preview}}' => str($requestLog?->text ?? 'request')->limit(42)->toString(),
            '{{message_body}}' => $message?->body ?? '',
            '{{project_title}}' => $project?->title ?? 'Project',
            '{{document_number}}' => $document?->number ?? 'document',
            '{{contact_name}}' => $contact?->company ?: ($contact?->fullName() ?? 'client'),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $text);
    }

    private function statusValue(Model $subject): ?string
    {
        if ($subject instanceof Project || $subject instanceof RequestLog || $subject instanceof Document) {
            return $subject->status->value;
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function idempotencyKey(WorkflowAutomation $automation, Model $subject, array $context): string
    {
        $fingerprint = Arr::only($context, ['old_status', 'new_status', 'status']);

        return sha1(json_encode([
            $automation->id,
            $automation->trigger->value,
            $subject::class,
            $subject->getKey(),
            $fingerprint,
        ], JSON_THROW_ON_ERROR));
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function recordRun(
        WorkflowAutomation $automation,
        Model $subject,
        WorkflowAutomationRunStatus $status,
        string $idempotencyKey,
        string $message,
        array $context,
    ): void {
        WorkflowAutomationRun::query()->create([
            'team_id' => $automation->team_id,
            'workflow_automation_id' => $automation->id,
            'trigger' => $automation->trigger,
            'subject_type' => $subject::class,
            'subject_id' => $subject->getKey(),
            'status' => $status,
            'idempotency_key' => $idempotencyKey,
            'message' => $message,
            'context' => $context,
            'ran_at' => now(),
        ]);
    }
}
