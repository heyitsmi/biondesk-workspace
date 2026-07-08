<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunityCreateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('opportunities/create', $stubWorkspaceData->opportunityCreateContext($request->user()->currentTeam));
    }
}
