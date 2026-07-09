<?php

namespace App\Http\Controllers;

use App\Models\ReminderJob;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RemindersController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $reminders = ReminderJob::query()
            ->whereHas('document', fn ($query) => $query->where('team_id', $team->id))
            ->with('document')
            ->get();

        return Inertia::render('reminders/index', [
            'summary' => [
                'allCount' => $reminders->count(),
                'todayCount' => $reminders->filter(fn (ReminderJob $reminder) => $reminder->bucket() === 'today')->count(),
                'upcomingCount' => $reminders->filter(fn (ReminderJob $reminder) => $reminder->bucket() === 'upcoming')->count(),
                'overdueCount' => $reminders->filter(fn (ReminderJob $reminder) => $reminder->bucket() === 'overdue')->count(),
            ],
            'reminders' => $reminders->map(fn (ReminderJob $reminder) => $reminder->toReminderArray())->all(),
        ]);
    }
}
