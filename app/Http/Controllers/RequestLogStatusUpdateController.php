<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateRequestLogStatusRequest;
use Illuminate\Http\RedirectResponse;

class RequestLogStatusUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateRequestLogStatusRequest $request, string $current_team, int $project, int $requestLog): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $requestLogModel = $projectModel->requestLogs()->findOrFail($requestLog);

        $requestLogModel->update([
            'status' => $request->validated('status'),
        ]);

        $projectModel->logActivity('Request status updated');

        return back();
    }
}
