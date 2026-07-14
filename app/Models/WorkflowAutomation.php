<?php

namespace App\Models;

use App\Enums\WorkflowAutomationTrigger;
use Database\Factories\WorkflowAutomationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property string $template
 * @property WorkflowAutomationTrigger $trigger
 * @property array<string, mixed>|null $conditions
 * @property array<int, array<string, mixed>> $actions
 * @property bool $is_active
 * @property Carbon|null $last_run_at
 */
#[Fillable(['team_id', 'name', 'template', 'trigger', 'conditions', 'actions', 'is_active', 'last_run_at'])]
class WorkflowAutomation extends Model
{
    /** @use HasFactory<WorkflowAutomationFactory> */
    use HasFactory;

    /**
     * Get the team this automation belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get all run records for this automation.
     *
     * @return HasMany<WorkflowAutomationRun, $this>
     */
    public function runs(): HasMany
    {
        return $this->hasMany(WorkflowAutomationRun::class);
    }

    /**
     * Get the array shape used by the automations UI.
     *
     * @return array<string, mixed>
     */
    public function toListArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'template' => $this->template,
            'trigger' => $this->trigger->value,
            'triggerLabel' => $this->trigger->label(),
            'conditions' => $this->conditions ?? [],
            'actions' => $this->actions,
            'isActive' => $this->is_active,
            'lastRunAt' => $this->last_run_at?->diffForHumans() ?? 'Never',
            'createdAt' => $this->created_at?->format('M j, Y') ?? '',
        ];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'trigger' => WorkflowAutomationTrigger::class,
            'conditions' => 'array',
            'actions' => 'array',
            'is_active' => 'boolean',
            'last_run_at' => 'datetime',
        ];
    }
}
