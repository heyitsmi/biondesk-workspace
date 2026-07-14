<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RequestLogShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $project, string $requestLog): Response
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()
            ->with('opportunity.contact')
            ->findOrFail($project);

        $requestLogModel = $projectModel->requestLogs()
            ->where('uuid', $requestLog)
            ->with(['messages.user', 'messages.contact'])
            ->firstOrFail();

        return Inertia::render('projects/request-log-show', [
            'project' => [
                'id' => $projectModel->id,
                'title' => $projectModel->title,
                'client' => $projectModel->clientName(),
                'stageLabel' => $projectModel->status->label(),
                'tone' => $projectModel->status->tone(),
            ],
            'requestLog' => $requestLogModel->toDetailArray(),
        ]);
    }
}
