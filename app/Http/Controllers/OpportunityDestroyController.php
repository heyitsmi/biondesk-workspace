<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OpportunityDestroyController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $opportunity): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->opportunities()->findOrFail($opportunity);
        $model->delete();

        return to_route('opportunities.index', ['current_team' => $team->slug]);
    }
}
