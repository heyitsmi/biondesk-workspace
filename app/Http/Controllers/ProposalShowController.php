<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProposalShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $proposal): Response
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Proposal)->with(['contact', 'items'])->find($proposal);

        abort_if($document === null, 404);

        return Inertia::render('proposals/show', [
            'proposal' => $document->toProposalDetailArray(),
        ]);
    }
}
