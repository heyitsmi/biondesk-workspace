<?php

namespace App\Http\Controllers;

use App\Enums\RequestLogMessageAuthorType;
use App\Http\Requests\StoreClientPortalRequestMessage;
use App\Models\Contact;
use App\Models\Project;
use App\Models\RequestLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;

class ClientPortalRequestMessageStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreClientPortalRequestMessage $request, Contact $contact, int $project, int $requestLog): RedirectResponse
    {
        $projectModel = Project::query()
            ->where('team_id', $contact->team_id)
            ->whereKey($project)
            ->whereHas('opportunity', fn (Builder $query) => $query->where('contact_id', $contact->id))
            ->firstOrFail();

        $requestLogModel = RequestLog::query()
            ->whereBelongsTo($projectModel)
            ->whereKey($requestLog)
            ->where('visible_to_client', true)
            ->firstOrFail();

        $message = $requestLogModel->messages()->create([
            'author_type' => RequestLogMessageAuthorType::Client,
            'contact_id' => $contact->id,
            'body' => $request->validated('body'),
        ]);

        foreach ($request->file('attachments', []) as $file) {
            $message->addMedia($file)->toMediaCollection('attachments');
        }

        $projectModel->logActivity('Client replied to request');

        return back();
    }
}
