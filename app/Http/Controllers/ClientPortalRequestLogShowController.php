<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Project;
use App\Models\RequestLog;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class ClientPortalRequestLogShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Contact $contact, int $project, string $requestLog): Response
    {
        $projectModel = Project::query()
            ->where('team_id', $contact->team_id)
            ->whereKey($project)
            ->whereHas('opportunity', fn (Builder $query) => $query->where('contact_id', $contact->id))
            ->firstOrFail();

        $requestLogModel = RequestLog::query()
            ->whereBelongsTo($projectModel)
            ->where('uuid', $requestLog)
            ->where('visible_to_client', true)
            ->with(['messages.user', 'messages.contact', 'media'])
            ->firstOrFail();

        $contact->loadMissing('team');

        return Inertia::render('client/request-log-show', [
            'portal' => [
                'teamName' => $contact->team->name,
                'portalToken' => $contact->portal_token,
                'contact' => [
                    'name' => $contact->displayName(),
                    'fullName' => $contact->fullName(),
                    'company' => $contact->company,
                    'initials' => $contact->initials(),
                    'email' => $contact->email,
                ],
            ],
            'project' => [
                'id' => $projectModel->id,
                'title' => $projectModel->title,
                'statusLabel' => $projectModel->status->label(),
                'tone' => $projectModel->status->tone(),
                'dueAt' => $projectModel->due_date?->format('M j, Y') ?? 'No due date',
            ],
            'requestLog' => [
                ...$requestLogModel->toClientPortalArray(),
                'uuid' => $requestLogModel->uuid,
                'projectTitle' => $projectModel->title,
            ],
        ]);
    }
}
