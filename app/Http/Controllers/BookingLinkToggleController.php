<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingLinkToggleController extends Controller
{
    /**
     * Toggle a booking link active state.
     */
    public function __invoke(Request $request, string $current_team, int $bookingLink): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->bookingLinks()->findOrFail($bookingLink);

        $model->update(['is_active' => ! $model->is_active]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $model->is_active ? __('Booking link enabled.') : __('Booking link paused.'),
        ]);

        return back();
    }
}
