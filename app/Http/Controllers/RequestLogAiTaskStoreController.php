<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequestLogAiTasksRequest;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class RequestLogAiTaskStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreRequestLogAiTasksRequest $request, string $current_team, int $project, int $requestLog): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $requestLogModel = $projectModel->requestLogs()->findOrFail($requestLog);
        $tasks = $request->validated('tasks');
        $createdCount = 0;

        foreach ($tasks as $taskData) {
            $description = trim(($taskData['description'] ?? '')."\n\nAI source reason: ".($taskData['source_reason'] ?? ''));
            $task = Task::query()->firstOrCreate([
                'project_id' => $projectModel->id,
                'request_log_id' => $requestLogModel->id,
                'title' => $taskData['title'],
            ], [
                'status' => $taskData['status'],
                'description' => $description,
                'tags' => $taskData['tags'] ?? [],
            ]);

            if ($task->wasRecentlyCreated) {
                $createdCount++;
            }
        }

        if ($createdCount > 0) {
            $projectModel->logActivity('AI breakdown tasks created from request log', 'success');
        }

        $message = $createdCount > 0
            ? trans_choice(':count task created from AI breakdown.|:count tasks created from AI breakdown.', $createdCount, [
                'count' => $createdCount,
            ])
            : __('Selected AI tasks were already created.');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);

        return back();
    }
}
