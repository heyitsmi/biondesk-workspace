<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Http\Requests\UpdateProposalRequest;
use Illuminate\Http\RedirectResponse;

class ProposalUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateProposalRequest $request, string $current_team, int $proposal): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Proposal)->findOrFail($proposal);

        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        $document->update($data);
        $document->syncItems($items);

        return to_route('proposals.show', ['current_team' => $team->slug, 'proposal' => $document->id]);
    }
}
