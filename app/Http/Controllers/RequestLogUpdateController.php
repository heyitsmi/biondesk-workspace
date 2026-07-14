<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateRequestLogRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;

class RequestLogUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateRequestLogRequest $request, string $current_team, int $project, int $requestLog): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $requestLogModel = $projectModel->requestLogs()->findOrFail($requestLog);

        $requestLogModel->update(Arr::except($request->validated(), ['attachments']));

        foreach ($request->file('attachments', []) as $file) {
            $requestLogModel->addMedia($file)->toMediaCollection('attachments');
        }

        $projectModel->logActivity('Request log updated');

        return back();
    }
}
