<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProposalEditController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        string $current_team,
        StubWorkspaceData $stubWorkspaceData,
        int $proposal,
    ): Response {
        $page = $stubWorkspaceData->proposalEditContext($request->user()->currentTeam, $proposal);

        abort_if($page === null, 404);

        return Inertia::render('proposals/edit', $page);
    }
}
