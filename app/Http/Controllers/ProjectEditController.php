<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectEditController extends Controller
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
        $model = $team->projects()->with('opportunity.contact')->findOrFail($project);

        return Inertia::render('projects/edit', [
            'stages' => collect(ProjectStatus::cases())
                ->map(fn (ProjectStatus $status) => [
                    'key' => $status->value,
                    'label' => $status->label(),
                    'tone' => $status->tone(),
                ])
                ->all(),
            'project' => [
                'id' => $model->id,
                'title' => $model->title,
                'opportunityTitle' => $model->opportunity->title,
                'client' => $model->clientName(),
                'status' => $model->status->value,
                'startDate' => $model->start_date?->toDateString() ?? '',
                'dueDate' => $model->due_date?->toDateString() ?? '',
                'description' => $model->description ?? '',
                'budgetValue' => (string) $model->budget_value,
            ],
        ]);
    }
}
