<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOpportunityRequest;
use Illuminate\Http\RedirectResponse;

class OpportunityStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreOpportunityRequest $request, string $current_team): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $team->opportunities()->create($request->validated());

        return to_route('opportunities.index', ['current_team' => $team->slug]);
    }
}
