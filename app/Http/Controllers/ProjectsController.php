<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectsController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $projects = $team->projects()
            ->with(['opportunity.contact', 'tasks', 'requestLogs'])
            ->orderBy('sort_order')
            ->get();

        $completedCount = $projects->where('status', ProjectStatus::Completed)->count();

        return Inertia::render('projects/index', [
            'defaultView' => 'board',
            'summary' => [
                'activeCount' => (string) $projects->whereNotIn('status', [ProjectStatus::Completed, ProjectStatus::Cancelled])->count(),
                'waitingCount' => (string) $projects->where('status', ProjectStatus::WaitingOnClient)->count(),
                'completionRate' => $projects->count() > 0
                    ? round($completedCount / $projects->count() * 100).'%'
                    : '0%',
            ],
            'stages' => collect(ProjectStatus::cases())
                ->map(fn (ProjectStatus $status) => [
                    'key' => $status->value,
                    'label' => $status->label(),
                    'tone' => $status->tone(),
                ])
                ->all(),
            'projects' => $projects->map->toListItem()->all(),
        ]);
    }
}
