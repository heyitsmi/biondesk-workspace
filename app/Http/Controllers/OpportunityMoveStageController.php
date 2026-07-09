<?php

namespace App\Http\Controllers;

use App\Http\Requests\MoveOpportunityStageRequest;
use Illuminate\Http\RedirectResponse;

class OpportunityMoveStageController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MoveOpportunityStageRequest $request, string $current_team, int $opportunity): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->opportunities()->findOrFail($opportunity);
        $model->update(['stage' => $request->validated('stage')]);

        return back();
    }
}
