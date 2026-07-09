<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Enums\ActivityEvent;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property int $opportunity_id
 * @property string $title
 * @property ProjectStatus $status
 * @property float $sort_order
 * @property Carbon|null $start_date
 * @property Carbon|null $due_date
 * @property string|null $description
 * @property int $budget_value
 */
#[Fillable(['opportunity_id', 'title', 'status', 'sort_order', 'start_date', 'due_date', 'description', 'budget_value'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    use LogsActivity;

    /**
     * Get the team this project belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the opportunity this project was created from.
     *
     * @return BelongsTo<Opportunity, $this>
     */
    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    /**
     * Get {id, title} options for the team's projects, used in document create
     * forms' "Linked Project" picker.
     *
     * @return array<int, array{id: int, title: string}>
     */
    public static function optionsFor(Team $team): array
    {
        return $team->projects()
            ->get()
            ->map(fn (self $project) => [
                'id' => $project->id,
                'title' => $project->title,
            ])
            ->values()
            ->all();
    }

    /**
     * Get the tasks for this project.
     *
     * @return HasMany<Task, $this>
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the request logs for this project.
     *
     * @return HasMany<RequestLog, $this>
     */
    public function requestLogs(): HasMany
    {
        return $this->hasMany(RequestLog::class);
    }

    /**
     * Get the client display name for this project, via its opportunity's contact.
     */
    public function clientName(): string
    {
        $contact = $this->opportunity->contact;

        return $contact->company ?: $contact->fullName();
    }

    /**
     * Get the formatted budget, e.g. "$5,000".
     */
    public function formattedBudget(): string
    {
        return '$'.number_format($this->budget_value);
    }

    /**
     * Log a manual activity entry against this project, e.g. for task/request log
     * mutations that aren't captured by the model's own automatic activity logging.
     */
    public function logActivity(string $description, string $tone = 'muted'): void
    {
        activity()
            ->performedOn($this)
            ->causedBy(auth()->user())
            ->withProperties(['tone' => $tone])
            ->log($description);
    }

    /**
     * Get the array shape used for project board/list rows.
     *
     * @return array<string, mixed>
     */
    public function toListItem(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'client' => $this->clientName(),
            'stage' => $this->status->value,
            'stageLabel' => $this->status->label(),
            'tone' => $this->status->tone(),
            'progress' => $this->progressPercent(),
            'sortOrder' => $this->sort_order,
            'dueAt' => $this->due_date?->format('M j') ?? '',
            'dueOrder' => $this->due_date === null ? PHP_INT_MAX : $this->due_date->timestamp,
            'budget' => $this->formattedBudget(),
            'requestLogCount' => $this->requestLogs->count(),
            'tasks' => $this->tasks->map->toListItem()->all(),
            'requestLogs' => $this->requestLogs
                ->map(fn (RequestLog $requestLog) => [
                    'id' => $requestLog->id,
                    'message' => $requestLog->text,
                    'createdAt' => $requestLog->created_at?->diffForHumans() ?? '',
                ])
                ->all(),
        ];
    }

    /**
     * Get the array shape used for the project show page.
     *
     * @return array<string, mixed>
     */
    public function toDetailArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'client' => $this->clientName(),
            'stage' => $this->status->value,
            'stageLabel' => $this->status->label(),
            'tone' => $this->status->tone(),
            'dueAt' => $this->due_date?->format('M j') ?? '',
            'description' => $this->description ?? '',
            'tasks' => $this->tasks->map->toDetailArray()->all(),
            'requestLogs' => $this->requestLogs->map->toDetailArray()->all(),
            'activity' => $this->activitiesAsSubject()
                ->latest()
                ->take(20)
                ->get()
                ->map(fn ($activity) => [
                    'text' => $activity->description,
                    'time' => $activity->created_at?->diffForHumans() ?? '',
                    'tone' => $activity->getProperty('tone', 'muted'),
                ])
                ->all(),
        ];
    }

    /**
     * Get the percentage of tasks marked done, rounded to the nearest whole number.
     */
    protected function progressPercent(): int
    {
        $total = $this->tasks->count();

        if ($total === 0) {
            return 0;
        }

        $done = $this->tasks->filter(fn (Task $task) => $task->status === TaskStatus::Done)->count();

        return (int) round($done / $total * 100);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'sort_order' => 'float',
            'start_date' => 'date',
            'due_date' => 'date',
        ];
    }

    /**
     * Get the options for logging activity on this model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn (string $eventName) => match ($eventName) {
                ActivityEvent::Created->value => 'Project created',
                ActivityEvent::Updated->value => 'Project details updated',
                ActivityEvent::Deleted->value => 'Project deleted',
                default => $eventName,
            });
    }
}
