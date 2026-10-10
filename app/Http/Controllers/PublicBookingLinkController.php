<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Support\Booking\BookingSlotService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicBookingLinkController extends Controller
{
    /**
     * Display a public booking link.
     */
    public function __invoke(Request $request, BookingSlotService $slots, string $team, string $bookingLink): Response
    {
        $teamModel = Team::findByLeadFormSlug($team);
        $bookingLinkModel = $teamModel->bookingLinks()
            ->where('slug', $bookingLink)
            ->where('is_active', true)
            ->firstOrFail();

        $bookingLinkModel->setRelation('team', $teamModel);

        return Inertia::render('public/booking-link', [
            'team' => [
                'name' => $teamModel->name,
                'slug' => $teamModel->slug,
                'leadFormSlug' => $teamModel->leadFormPublicSlug(),
                'imageUrl' => $teamModel->publicBrandImageUrl(),
            ],
            'bookingLink' => [
                'name' => $bookingLinkModel->name,
                'slug' => $bookingLinkModel->slug,
                'description' => $bookingLinkModel->description ?? '',
                'durationMinutes' => $bookingLinkModel->duration_minutes,
                'timezone' => $bookingLinkModel->timezone,
                'location' => $bookingLinkModel->location ?? '',
            ],
            'slotGroups' => $slots->groupedSlots($bookingLinkModel),
            'turnstileSiteKey' => config('services.turnstile.site_key'),
        ]);
    }
}
