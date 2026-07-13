<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateEventRequest;
use Illuminate\Http\RedirectResponse;

class EventUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateEventRequest $request, string $current_team, int $event): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->events()->findOrFail($event);
        $model->update($request->validated());

        return to_route('calendar.index', ['current_team' => $team->slug]);
    }
}
