<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTaskRequest;
use Illuminate\Http\RedirectResponse;

class TaskUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateTaskRequest $request, string $current_team, int $project, int $task): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $taskModel = $projectModel->tasks()->findOrFail($task);

        $taskModel->update($request->validated());

        foreach ($request->file('attachments', []) as $file) {
            $taskModel->addMedia($file)->toMediaCollection('attachments');
        }

        $projectModel->logActivity("Task updated: {$taskModel->title}");

        return back();
    }
}
