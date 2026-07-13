<?php

namespace App\Http\Controllers;

use App\Http\Requests\MoveEventRequest;
use Illuminate\Http\RedirectResponse;

class EventMoveController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MoveEventRequest $request, string $current_team, int $event): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->events()->findOrFail($event);

        // Recurring events have no per-occurrence exception mechanism, so
        // dragging/resizing them must never be allowed to persist — the
        // client already hides this via `editable: false`, this is the
        // server-side backstop against a bypassed client.
        abort_if($model->recurrence !== null, 422);

        $model->update($request->validated());

        return back();
    }
}
