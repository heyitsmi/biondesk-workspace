<?php

namespace App\Http\Controllers;

use App\Models\ReminderJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReminderDismissController extends Controller
{
    /**
     * Handle the incoming request. Toggles a reminder between dismissed
     * (handled) and active.
     */
    public function __invoke(Request $request, string $current_team, int $reminder): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $reminderJob = ReminderJob::whereHas('document', fn ($query) => $query->where('team_id', $team->id))
            ->findOrFail($reminder);

        $reminderJob->update(['dismissed_at' => $reminderJob->dismissed_at === null ? now() : null]);

        return back();
    }
}
