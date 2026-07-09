<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RequestLogDestroyController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $project, int $requestLog): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $requestLogModel = $projectModel->requestLogs()->findOrFail($requestLog);
        $requestLogModel->delete();

        $projectModel->logActivity('Request log dismissed', 'danger');

        return back();
    }
}
