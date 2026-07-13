<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EventDestroyController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $event): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->events()->findOrFail($event);
        $model->delete();

        return to_route('calendar.index', ['current_team' => $team->slug]);
    }
}
