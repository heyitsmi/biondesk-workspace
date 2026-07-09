<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateOpportunityRequest;
use Illuminate\Http\RedirectResponse;

class OpportunityUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateOpportunityRequest $request, string $current_team, int $opportunity): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->opportunities()->findOrFail($opportunity);
        $model->update($request->validated());

        return to_route('opportunities.index', ['current_team' => $team->slug]);
    }
}
