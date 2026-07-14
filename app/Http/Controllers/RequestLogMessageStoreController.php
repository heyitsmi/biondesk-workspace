<?php

namespace App\Http\Controllers;

use App\Enums\RequestLogMessageAuthorType;
use App\Http\Requests\StoreRequestLogMessageRequest;
use Illuminate\Http\RedirectResponse;

class RequestLogMessageStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreRequestLogMessageRequest $request, string $current_team, int $project, int $requestLog): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);
        $requestLogModel = $projectModel->requestLogs()->findOrFail($requestLog);

        $message = $requestLogModel->messages()->create([
            'author_type' => RequestLogMessageAuthorType::Team,
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        foreach ($request->file('attachments', []) as $file) {
            $message->addMedia($file)->toMediaCollection('attachments');
        }

        $projectModel->logActivity('Team replied to request');

        return back();
    }
}
