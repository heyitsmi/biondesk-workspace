<?php

namespace App\Http\Controllers;

use App\Enums\WorkflowAutomationTrigger;
use App\Http\Requests\MoveProjectRequest;
use App\Jobs\RunWorkflowAutomation;
use Illuminate\Http\RedirectResponse;

class ProjectMoveController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MoveProjectRequest $request, string $current_team, int $project): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->projects()->findOrFail($project);
        $oldStatus = $model->status->value;
        $model->update($request->validated());

        if ($oldStatus !== $model->status->value) {
            RunWorkflowAutomation::dispatch(
                $team->id,
                WorkflowAutomationTrigger::ProjectStatusChanged->value,
                $model::class,
                $model->id,
                [
                    'old_status' => $oldStatus,
                    'new_status' => $model->status->value,
                    'status' => $model->status->value,
                ],
            );
        }

        return back();
    }
}
