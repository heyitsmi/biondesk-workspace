<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingLinkRequest;
use App\Http\Requests\UpdateBookingLinkRequest;
use App\Models\BookingLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingLinkController extends Controller
{
    /**
     * Display booking links for the current team.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('booking-links/index', [
            'bookingLinks' => $team->bookingLinks()
                ->with('team')
                ->withCount('bookings')
                ->latest()
                ->get()
                ->map->toListArray()
                ->all(),
        ]);
    }

    /**
     * Show the create form.
     */
    public function create(): Response
    {
        return Inertia::render('booking-links/create-edit', [
            'mode' => 'create',
            'bookingLink' => null,
            'defaults' => [
                'availability' => BookingLink::defaultAvailability(),
                'timezone' => config('app.timezone', 'Asia/Jakarta'),
                'durationMinutes' => 30,
                'bufferBeforeMinutes' => 0,
                'bufferAfterMinutes' => 0,
                'minNoticeMinutes' => 120,
                'maxDaysAhead' => 14,
            ],
        ]);
    }

    /**
     * Store a booking link.
     */
    public function store(StoreBookingLinkRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $team->bookingLinks()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking link created.')]);

        return to_route('booking-links.index', ['current_team' => $team->slug]);
    }

    /**
     * Show the edit form.
     */
    public function edit(Request $request, string $current_team, int $bookingLink): Response
    {
        $team = $request->user()->currentTeam;
        $model = $team->bookingLinks()->with('team')->findOrFail($bookingLink);

        return Inertia::render('booking-links/create-edit', [
            'mode' => 'edit',
            'bookingLink' => $model->toListArray(),
            'defaults' => null,
        ]);
    }

    /**
     * Update a booking link.
     */
    public function update(UpdateBookingLinkRequest $request, string $current_team, int $bookingLink): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->bookingLinks()->findOrFail($bookingLink);

        $model->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking link updated.')]);

        return to_route('booking-links.index', ['current_team' => $team->slug]);
    }

    /**
     * Delete a booking link.
     */
    public function destroy(Request $request, string $current_team, int $bookingLink): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $team->bookingLinks()->findOrFail($bookingLink)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking link deleted.')]);

        return back();
    }
}
