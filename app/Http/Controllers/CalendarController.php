<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Support\Calendar\CalendarAggregator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('calendar/index', [
            'events' => $team->events()->get()->map(fn (Event $event) => $event->toCalendarArray())->all(),
            'aggregated' => (new CalendarAggregator)->build($team, now()->subMonths(3), now()->addMonths(12)),
        ]);
    }
}
