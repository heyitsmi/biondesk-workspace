<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProposalDestroyController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $proposal): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Proposal)->findOrFail($proposal);
        $document->delete();

        return to_route('proposals.index', ['current_team' => $team->slug]);
    }
}
