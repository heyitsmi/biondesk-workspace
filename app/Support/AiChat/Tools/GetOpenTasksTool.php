<?php

namespace App\Support\AiChat\Tools;

use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;

class GetOpenTasksTool implements Tool
{
    public function name(): string
    {
        return 'get_open_tasks';
    }

    public function description(): string
    {
        return "Get the team's tasks that are not done yet. Tasks do not have individual due dates in this system — urgency must be inferred from the parent project's due date, included in each result.";
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'project_id' => [
                    'type' => 'integer',
                    'description' => 'Limit to tasks in this project only.',
                ],
            ],
            'required' => [],
        ];
    }

    public function execute(Team $team, array $args): array
    {
        $projectId = isset($args['project_id']) ? (int) $args['project_id'] : null;

        if ($projectId !== null) {
            $project = $team->projects()->find($projectId);

            if ($project === null) {
                return ['error' => "No project found with id {$projectId}."];
            }

            $projects = collect([$project]);
        } else {
            $projects = $team->projects()->with('tasks')->get();
        }

        $tasks = $projects->flatMap(fn (Project $project) => $project->tasks
            ->where('status', '!=', TaskStatus::Done)
            ->map(fn (Task $task) => [
                'title' => $task->title,
                'status' => $task->status->value,
                'project' => $project->title,
                'projectDueDate' => $project->due_date?->toDateString(),
            ])
            ->all());

        return ['tasks' => $tasks->values()->all()];
    }
}
