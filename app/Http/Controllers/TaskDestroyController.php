<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskDestroyController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $project, int $task): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $taskModel = $projectModel->tasks()->findOrFail($task);
        $title = $taskModel->title;
        $taskModel->delete();

        $projectModel->logActivity("Task deleted: {$title}", 'danger');

        return back();
    }
}
