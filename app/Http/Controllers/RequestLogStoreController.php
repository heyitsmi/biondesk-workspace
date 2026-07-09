<?php

namespace App\Http\Controllers;

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use App\Http\Requests\StoreRequestLogRequest;
use Illuminate\Http\RedirectResponse;

class RequestLogStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreRequestLogRequest $request, string $current_team, int $project): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()->findOrFail($project);

        $data = $request->validated();
        $data['source'] ??= RequestLogSource::Email->value;
        $data['classification'] ??= RequestLogClassification::New->value;

        $requestLog = $projectModel->requestLogs()->create($data);

        foreach ($request->file('attachments', []) as $file) {
            $requestLog->addMedia($file)->toMediaCollection('attachments');
        }

        $projectModel->logActivity('Request log added');

        return back();
    }
}
