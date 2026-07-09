<?php

namespace App\Http\Controllers;

use App\Http\Requests\MoveTaskRequest;
use Illuminate\Http\RedirectResponse;

class TaskMoveController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MoveTaskRequest $request, string $current_team, int $project, int $task): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $taskModel = $projectModel->tasks()->findOrFail($task);

        $taskModel->update($request->validated());

        $projectModel->logActivity("Task \"{$taskModel->title}\" moved to {$taskModel->status->label()}", 'accent');

        return back();
    }
}
