<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RequestLogConvertToTaskController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $project, int $requestLog): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $requestLogModel = $projectModel->requestLogs()->findOrFail($requestLog);

        $task = $projectModel->tasks()->create([
            'title' => Str::limit($requestLogModel->text, 80),
            'status' => TaskStatus::Todo,
            'description' => trim($requestLogModel->text."\n\n".$requestLogModel->notes),
        ]);

        foreach ($requestLogModel->getMedia('attachments') as $media) {
            $media->move($task, 'attachments');
        }

        $requestLogModel->delete();

        $projectModel->logActivity("Request converted to task: {$task->title}", 'success');

        return back();
    }
}
