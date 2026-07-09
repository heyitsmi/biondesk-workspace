<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Http\Requests\StoreProposalRequest;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;

class ProposalStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreProposalRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        $data['type'] = DocumentType::Proposal;
        $data['number'] = Document::nextNumber($team, DocumentType::Proposal);

        $document = $team->documents()->create($data);
        $document->syncItems($items);

        return to_route('proposals.show', ['current_team' => $team->slug, 'proposal' => $document->id]);
    }
}
