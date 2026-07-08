<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunityEditController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        string $current_team,
        StubWorkspaceData $stubWorkspaceData,
        int $opportunity,
    ): Response {
        $page = $stubWorkspaceData->opportunityEditContext($request->user()->currentTeam, $opportunity);

        abort_if($page === null, 404);

        return Inertia::render('opportunities/edit', $page);
    }
}
