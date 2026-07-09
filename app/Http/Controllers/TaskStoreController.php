<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Http\Requests\StoreTaskRequest;
use Illuminate\Http\RedirectResponse;

class TaskStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreTaskRequest $request, string $current_team, int $project): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);

        $data = $request->validated();
        $data['status'] ??= TaskStatus::Todo->value;

        $task = $projectModel->tasks()->create($data);

        foreach ($request->file('attachments', []) as $file) {
            $task->addMedia($file)->toMediaCollection('attachments');
        }

        $projectModel->logActivity("Task added: {$task->title}");

        return back();
    }
}
