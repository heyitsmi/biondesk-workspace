<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        string $current_team,
        int $project,
    ): Response {
        $team = $request->user()->currentTeam;
        $model = $team->projects()
            ->with(['opportunity.contact', 'tasks', 'requestLogs'])
            ->findOrFail($project);

        return Inertia::render('projects/show', [
            'project' => $model->toDetailArray(),
            'stages' => collect(ProjectStatus::cases())
                ->map(fn (ProjectStatus $status) => [
                    'key' => $status->value,
                    'label' => $status->label(),
                    'tone' => $status->tone(),
                ])
                ->all(),
            'defaultTaskView' => 'board',
            'taskStages' => collect(TaskStatus::cases())
                ->map(fn (TaskStatus $status) => [
                    'key' => $status->value,
                    'label' => $status->label(),
                    'tone' => $status->tone(),
                ])
                ->all(),
        ]);
    }
}
