<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicLeadFormController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Team $team, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('public/lead-form', $stubWorkspaceData->publicLeadForm($team));
    }
}
