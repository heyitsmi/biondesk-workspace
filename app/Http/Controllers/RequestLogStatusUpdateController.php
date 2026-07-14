<?php

namespace App\Http\Controllers;

use App\Enums\WorkflowAutomationTrigger;
use App\Http\Requests\UpdateRequestLogStatusRequest;
use App\Jobs\RunWorkflowAutomation;
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
        $oldStatus = $requestLogModel->status->value;

        $requestLogModel->update([
            'status' => $request->validated('status'),
        ]);

        $projectModel->logActivity('Request status updated');

        if ($oldStatus !== $requestLogModel->status->value) {
            RunWorkflowAutomation::dispatch(
                $team->id,
                WorkflowAutomationTrigger::RequestStatusChanged->value,
                $requestLogModel::class,
                $requestLogModel->id,
                [
                    'old_status' => $oldStatus,
                    'new_status' => $requestLogModel->status->value,
                    'status' => $requestLogModel->status->value,
                ],
            );
        }

        return back();
    }
}
