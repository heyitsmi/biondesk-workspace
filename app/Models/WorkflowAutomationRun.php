<?php

namespace App\Models;

use App\Enums\WorkflowAutomationRunStatus;
use App\Enums\WorkflowAutomationTrigger;
use Database\Factories\WorkflowAutomationRunFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $team_id
 * @property int $workflow_automation_id
 * @property WorkflowAutomationTrigger $trigger
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property WorkflowAutomationRunStatus $status
 * @property string $idempotency_key
 * @property string|null $message
 * @property array<string, mixed>|null $context
 * @property Carbon $ran_at
 */
#[Fillable(['team_id', 'workflow_automation_id', 'trigger', 'subject_type', 'subject_id', 'status', 'idempotency_key', 'message', 'context', 'ran_at'])]
class WorkflowAutomationRun extends Model
{
    /** @use HasFactory<WorkflowAutomationRunFactory> */
    use HasFactory;

    /**
     * Get the team this run belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the automation this run belongs to.
     *
     * @return BelongsTo<WorkflowAutomation, $this>
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(WorkflowAutomation::class, 'workflow_automation_id');
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
            'automationName' => $this->automation?->name ?? 'Automation',
            'trigger' => $this->trigger->value,
            'triggerLabel' => $this->trigger->label(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'statusTone' => $this->status->tone(),
            'message' => $this->message ?? '',
            'ranAt' => $this->ran_at->diffForHumans(),
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
            'status' => WorkflowAutomationRunStatus::class,
            'context' => 'array',
            'ran_at' => 'datetime',
        ];
    }
}
