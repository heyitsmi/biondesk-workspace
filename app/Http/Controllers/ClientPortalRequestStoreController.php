<?php

namespace App\Http\Controllers;

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use App\Http\Requests\StoreClientPortalRequest;
use App\Models\Contact;
use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;

class ClientPortalRequestStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreClientPortalRequest $request, Contact $contact, int $project): RedirectResponse
    {
        $projectModel = Project::query()
            ->where('team_id', $contact->team_id)
            ->whereKey($project)
            ->whereHas('opportunity', fn (Builder $query) => $query->where('contact_id', $contact->id))
            ->firstOrFail();

        $projectModel->requestLogs()->create([
            'text' => $request->validated('text'),
            'source' => RequestLogSource::ClientPortal,
            'classification' => RequestLogClassification::New,
            'visible_to_client' => true,
        ]);

        $projectModel->logActivity('Client request submitted');

        return back();
    }
}
