<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Http\Requests\MoveDocumentStatusRequest;
use Illuminate\Http\RedirectResponse;

class ProposalMoveController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MoveDocumentStatusRequest $request, string $current_team, int $proposal): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Proposal)->findOrFail($proposal);
        $document->update(['status' => $request->validated('status')]);

        return back();
    }
}
