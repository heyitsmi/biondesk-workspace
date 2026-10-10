<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\ContactStatus;
use App\Enums\ContactType;
use App\Enums\EventColor;
use App\Enums\OpportunityStage;
use App\Http\Requests\StorePublicBookingRequest;
use App\Mail\BookingConfirmationMail;
use App\Mail\BookingScheduledForOwner;
use App\Models\Booking;
use App\Models\BookingLink;
use App\Models\Team;
use App\Support\Booking\BookingSlotService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class PublicBookingStoreController extends Controller
{
    /**
     * Store a public booking.
     */
    public function __invoke(
        StorePublicBookingRequest $request,
        BookingSlotService $slots,
        string $team,
        string $bookingLink,
    ): RedirectResponse {
        $teamModel = Team::findByLeadFormSlug($team);
        $bookingLinkModel = $teamModel->bookingLinks()
            ->where('slug', $bookingLink)
            ->where('is_active', true)
            ->firstOrFail();

        $data = $request->validated();

        $booking = DB::transaction(function () use ($teamModel, $bookingLinkModel, $data, $slots): Booking {
            /** @var BookingLink $lockedBookingLink */
            $lockedBookingLink = $teamModel->bookingLinks()
                ->whereKey($bookingLinkModel->id)
                ->lockForUpdate()
                ->firstOrFail();
            $lockedBookingLink->setRelation('team', $teamModel);

            if (! $slots->isSlotAvailable($lockedBookingLink, $data['starts_at'])) {
                throw ValidationException::withMessages([
                    'starts_at' => __('This time is no longer available. Please choose another slot.'),
                ]);
            }

            $startsAt = $slots->parseSlotStart($data['starts_at'], $lockedBookingLink->timezone);
            $endsAt = $startsAt->addMinutes($lockedBookingLink->duration_minutes);
            $fullName = trim("{$data['first_name']} {$data['last_name']}");

            $contact = $teamModel->contacts()
                ->whereRaw('LOWER(email) = ?', [mb_strtolower($data['email'])])
                ->first();

            if ($contact === null) {
                $contact = $teamModel->contacts()->create([
                    'type' => ContactType::Lead,
                    'status' => ContactStatus::Prospect,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $data['email'],
                    'company' => $data['company'] ?? null,
                ]);
            }

            $opportunity = $teamModel->opportunities()->create([
                'contact_id' => $contact->id,
                'title' => ($contact->company ?: $contact->fullName())." - {$lockedBookingLink->name}",
                'stage' => OpportunityStage::Inbox,
                'source' => 'Booking link',
                'description' => trim(implode("\n\n", array_filter([
                    "Booked {$lockedBookingLink->name} for {$startsAt->format('M j, Y H:i')} ({$lockedBookingLink->timezone}).",
                    $lockedBookingLink->location ? "Location: {$lockedBookingLink->location}" : null,
                    $data['notes'] ?? null,
                ]))),
            ]);

            $event = $teamModel->events()->create([
                'title' => "{$lockedBookingLink->name}: {$fullName}",
                'description' => trim(implode("\n\n", array_filter([
                    $data['notes'] ?? null,
                    "Email: {$data['email']}",
                    is_string($data['company'] ?? null) && $data['company'] !== '' ? "Company: {$data['company']}" : null,
                ]))),
                'starts_at' => $startsAt->format('Y-m-d H:i:s'),
                'ends_at' => $endsAt->format('Y-m-d H:i:s'),
                'all_day' => false,
                'location' => $lockedBookingLink->location,
                'color' => EventColor::Accent,
                'recurrence' => null,
            ]);

            return $teamModel->bookings()->create([
                'booking_link_id' => $lockedBookingLink->id,
                'contact_id' => $contact->id,
                'opportunity_id' => $opportunity->id,
                'event_id' => $event->id,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'company' => $data['company'] ?? null,
                'notes' => $data['notes'] ?? null,
                'starts_at' => $startsAt->format('Y-m-d H:i:s'),
                'ends_at' => $endsAt->format('Y-m-d H:i:s'),
                'timezone' => $lockedBookingLink->timezone,
                'status' => BookingStatus::Scheduled,
            ]);
        });

        $booking->load(['bookingLink.team', 'contact', 'opportunity', 'event']);

        if ($owner = $teamModel->owner()) {
            Mail::to($owner->email)->send(new BookingScheduledForOwner($booking));
        }

        Mail::to($booking->email)->send(new BookingConfirmationMail($booking));

        return back();
    }
}
