<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProposalsController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $proposals = $team->documents()
            ->where('type', DocumentType::Proposal)
            ->with(['contact', 'items'])
            ->get();

        return Inertia::render('proposals/index', [
            'defaultView' => 'board',
            'summary' => [
                'draftCount' => (string) $proposals->where('status', DocumentStatus::Draft)->count(),
                'sentCount' => (string) $proposals->where('status', DocumentStatus::Sent)->count(),
                'acceptedCount' => (string) $proposals->where('status', DocumentStatus::Accepted)->count(),
            ],
            'stages' => collect(DocumentStatus::cases())
                ->map(fn (DocumentStatus $status) => [
                    'key' => $status->value,
                    'label' => $status->label(),
                    'tone' => $status->tone(),
                ])
                ->all(),
            'documents' => $proposals->map(fn (Document $document) => $document->toProposalListItem())->all(),
            'profileLibrarySummary' => [
                'title' => 'AI profile library ready',
                'description' => "Proposal generation will eventually personalize drafts using {$team->name}'s snippets, proof, and testimonials.",
            ],
        ]);
    }
}
