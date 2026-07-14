<?php

namespace Database\Factories;

use App\Enums\WorkflowAutomationAction;
use App\Enums\WorkflowAutomationTrigger;
use App\Models\Team;
use App\Models\WorkflowAutomation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkflowAutomation>
 */
class WorkflowAutomationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'name' => fake()->sentence(3),
            'template' => 'new_client_request_task',
            'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted,
            'conditions' => [],
            'actions' => [[
                'type' => WorkflowAutomationAction::CreateTask->value,
                'title' => 'Review client request',
                'description' => 'Created by workflow automation.',
            ]],
            'is_active' => true,
        ];
    }
}
