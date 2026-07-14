<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequestLogAiTasksRequest;
use Illuminate\Http\RedirectResponse;

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

        foreach ($request->validated('tasks') as $taskData) {
            $projectModel->tasks()->create([
                'request_log_id' => $requestLogModel->id,
                'title' => $taskData['title'],
                'status' => $taskData['status'],
                'description' => trim(($taskData['description'] ?? '')."\n\nAI source reason: ".($taskData['source_reason'] ?? '')),
                'tags' => $taskData['tags'] ?? [],
            ]);
        }

        $projectModel->logActivity('AI breakdown tasks created from request log', 'success');

        return back();
    }
}
