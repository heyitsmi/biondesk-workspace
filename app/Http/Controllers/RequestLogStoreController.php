<?php

namespace App\Http\Controllers;

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use App\Enums\RequestLogStatus;
use App\Http\Requests\StoreRequestLogRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;

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
        $data['status'] ??= RequestLogStatus::Submitted->value;

        $requestLog = $projectModel->requestLogs()->create(Arr::except($data, ['attachments']));

        foreach ($request->file('attachments', []) as $file) {
            $requestLog->addMedia($file)->toMediaCollection('attachments');
        }

        $projectModel->logActivity('Request log added');

        return back();
    }
}
