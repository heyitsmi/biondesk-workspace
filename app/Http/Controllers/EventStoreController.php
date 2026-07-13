<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use Illuminate\Http\RedirectResponse;

class EventStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreEventRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $team->events()->create($request->validated());

        return to_route('calendar.index', ['current_team' => $team->slug]);
    }
}
