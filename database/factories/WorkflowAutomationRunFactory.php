<?php

namespace Database\Factories;

use App\Enums\WorkflowAutomationRunStatus;
use App\Enums\WorkflowAutomationTrigger;
use App\Models\Team;
use App\Models\WorkflowAutomation;
use App\Models\WorkflowAutomationRun;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WorkflowAutomationRun>
 */
class WorkflowAutomationRunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workflow_automation_id' => WorkflowAutomation::factory(),
            'team_id' => fn (array $attributes): mixed => WorkflowAutomation::query()
                ->find($attributes['workflow_automation_id'])
                ?->team_id ?? Team::factory(),
            'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted,
            'status' => WorkflowAutomationRunStatus::Success,
            'idempotency_key' => (string) Str::uuid(),
            'message' => fake()->sentence(),
            'context' => [],
            'ran_at' => now(),
        ];
    }
}
