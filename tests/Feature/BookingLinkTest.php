<?php

use App\Enums\BookingStatus;
use App\Enums\EventRecurrence;
use App\Enums\OpportunityStage;
use App\Mail\BookingConfirmationMail;
use App\Mail\BookingScheduledForOwner;
use App\Models\Booking;
use App\Models\BookingLink;
use App\Models\Contact;
use App\Models\Event;
use App\Models\Opportunity;
use App\Models\Team;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

function bookingAvailability(array $windows = [['start' => '09:00', 'end' => '11:00']]): array
{
    return [
        'monday' => $windows,
        'tuesday' => [],
        'wednesday' => [],
        'thursday' => [],
        'friday' => [],
        'saturday' => [],
        'sunday' => [],
    ];
}

function makeBookingLink(Team $team, array $overrides = []): BookingLink
{
    return BookingLink::factory()->for($team)->create([
        'name' => 'Discovery Call',
        'slug' => 'discovery-call',
        'duration_minutes' => 30,
        'timezone' => 'Asia/Jakarta',
        'availability' => bookingAvailability(),
        'min_notice_minutes' => 0,
        'max_days_ahead' => 1,
        ...$overrides,
    ]);
}

function fakeTurnstile(): void
{
    config([
        'services.turnstile.secret_key' => 'test-secret',
        'services.turnstile.site_key' => 'test-site',
    ]);

    Http::fake([
        'https://challenges.cloudflare.com/*' => Http::response(['success' => true]),
    ]);
}

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-08-03 08:00:00', 'Asia/Jakarta'));
});

afterEach(function () {
    Carbon::setTestNow();
});

test('booking links are listed and scoped to the current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();

    makeBookingLink($team, ['name' => 'Discovery Call']);
    makeBookingLink($otherTeam, ['name' => 'Foreign Call', 'slug' => 'foreign-call']);

    $this->withoutVite();

    $this->actingAs($user)
        ->get(route('booking-links.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('booking-links/index')
            ->has('bookingLinks', 1)
            ->where('bookingLinks.0.name', 'Discovery Call')
            ->where('bookingLinks.0.slug', 'discovery-call')
        );
});

test('booking link can be created updated toggled and deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $payload = [
        'name' => 'Intro Call',
        'slug' => 'intro-call',
        'description' => 'A short intro call.',
        'is_active' => true,
        'duration_minutes' => 45,
        'buffer_before_minutes' => 10,
        'buffer_after_minutes' => 15,
        'timezone' => 'Asia/Jakarta',
        'availability' => bookingAvailability(),
        'min_notice_minutes' => 60,
        'max_days_ahead' => 14,
        'location' => 'Google Meet',
    ];

    $this->actingAs($user)
        ->post(route('booking-links.store', ['current_team' => $team->slug]), $payload)
        ->assertRedirect(route('booking-links.index', ['current_team' => $team->slug]));

    $bookingLink = BookingLink::sole();
    expect($bookingLink->team_id)->toBe($team->id)
        ->and($bookingLink->duration_minutes)->toBe(45);

    $this->actingAs($user)
        ->put(route('booking-links.update', [
            'current_team' => $team->slug,
            'bookingLink' => $bookingLink->id,
        ]), [
            ...$payload,
            'name' => 'Updated Intro Call',
            'slug' => 'updated-intro-call',
        ])
        ->assertRedirect(route('booking-links.index', ['current_team' => $team->slug]));

    expect($bookingLink->fresh()->name)->toBe('Updated Intro Call');

    $this->actingAs($user)
        ->patch(route('booking-links.toggle', [
            'current_team' => $team->slug,
            'bookingLink' => $bookingLink->id,
        ]))
        ->assertRedirect();

    expect($bookingLink->fresh()->is_active)->toBeFalse();

    $this->actingAs($user)
        ->delete(route('booking-links.destroy', [
            'current_team' => $team->slug,
            'bookingLink' => $bookingLink->id,
        ]))
        ->assertRedirect();

    expect(BookingLink::count())->toBe(0);
});

test('booking link slugs are unique per team only', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();

    makeBookingLink($team, ['slug' => 'intro-call']);
    makeBookingLink($otherTeam, ['slug' => 'intro-call']);

    $this->actingAs($user)
        ->post(route('booking-links.store', ['current_team' => $team->slug]), [
            'name' => 'Duplicate Intro',
            'slug' => 'intro-call',
            'duration_minutes' => 30,
            'timezone' => 'Asia/Jakarta',
            'availability' => bookingAvailability(),
            'min_notice_minutes' => 0,
            'max_days_ahead' => 7,
        ])
        ->assertSessionHasErrors('slug');

    expect(BookingLink::count())->toBe(2);
});

test('inactive public booking link returns not found', function () {
    $team = Team::factory()->create();
    makeBookingLink($team, ['is_active' => false]);

    $this->get(route('public-booking-link.show', [
        'team' => $team->slug,
        'bookingLink' => 'discovery-call',
    ]))->assertNotFound();
});

test('public booking page exposes available slots and hides event conflicts', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio']);
    makeBookingLink($team);

    Event::factory()->for($team)->create([
        'starts_at' => '2026-08-03 09:30:00',
        'ends_at' => '2026-08-03 10:00:00',
    ]);

    Event::factory()->for($team)->create([
        'starts_at' => '2026-07-27 10:00:00',
        'ends_at' => '2026-07-27 10:30:00',
        'recurrence' => EventRecurrence::Weekly,
    ]);

    $this->withoutVite();

    $this->get(route('public-booking-link.show', [
        'team' => $team->slug,
        'bookingLink' => 'discovery-call',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/booking-link')
            ->where('team.name', 'Biondesk Studio')
            ->where('bookingLink.name', 'Discovery Call')
            ->has('slotGroups.0.slots', 2)
            ->where('slotGroups.0.slots.0.startsAt', '2026-08-03T09:00:00')
            ->where('slotGroups.0.slots.1.startsAt', '2026-08-03T10:30:00')
        );
});

test('public booking submit creates contact opportunity event booking and sends mail', function () {
    Mail::fake();
    fakeTurnstile();

    $owner = User::factory()->create(['email' => 'owner@example.test']);
    $team = $owner->currentTeam;
    makeBookingLink($team);

    $this->post(route('public-booking-link.store', [
        'team' => $team->slug,
        'bookingLink' => 'discovery-call',
    ]), [
        'firstName' => 'Jane',
        'lastName' => 'Client',
        'email' => 'jane@example.test',
        'company' => 'Acme Co',
        'notes' => 'Need help scoping a redesign.',
        'startsAt' => '2026-08-03T09:00:00',
        'turnstileToken' => 'token',
    ])->assertRedirect();

    $contact = Contact::sole();
    $opportunity = Opportunity::sole();
    $event = Event::sole();
    $booking = Booking::sole();

    expect($contact->email)->toBe('jane@example.test')
        ->and($opportunity->contact_id)->toBe($contact->id)
        ->and($opportunity->stage)->toBe(OpportunityStage::Inbox)
        ->and($opportunity->source)->toBe('Booking link')
        ->and($event->title)->toBe('Discovery Call: Jane Client')
        ->and($booking->status)->toBe(BookingStatus::Scheduled)
        ->and($booking->contact_id)->toBe($contact->id)
        ->and($booking->opportunity_id)->toBe($opportunity->id)
        ->and($booking->event_id)->toBe($event->id);

    Mail::assertSent(BookingScheduledForOwner::class, fn (BookingScheduledForOwner $mail) => $mail->hasTo('owner@example.test'));
    Mail::assertSent(BookingConfirmationMail::class, fn (BookingConfirmationMail $mail) => $mail->hasTo('jane@example.test'));
});

test('public booking reuses existing contact by email', function () {
    Mail::fake();
    fakeTurnstile();

    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    makeBookingLink($team);
    $contact = Contact::factory()->for($team)->create([
        'email' => 'jane@example.test',
        'first_name' => 'Existing',
    ]);

    $this->post(route('public-booking-link.store', [
        'team' => $team->slug,
        'bookingLink' => 'discovery-call',
    ]), [
        'firstName' => 'Jane',
        'lastName' => 'Client',
        'email' => 'JANE@example.test',
        'startsAt' => '2026-08-03T09:00:00',
        'turnstileToken' => 'token',
    ])->assertRedirect();

    expect(Contact::count())->toBe(1)
        ->and(Booking::sole()->contact_id)->toBe($contact->id);
});

test('double submit for the same slot is rejected', function () {
    Mail::fake();
    fakeTurnstile();

    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    makeBookingLink($team);

    $payload = [
        'firstName' => 'Jane',
        'lastName' => 'Client',
        'email' => 'jane@example.test',
        'startsAt' => '2026-08-03T09:00:00',
        'turnstileToken' => 'token',
    ];

    $route = route('public-booking-link.store', [
        'team' => $team->slug,
        'bookingLink' => 'discovery-call',
    ]);

    $this->post($route, $payload)->assertRedirect();
    $this->post($route, [...$payload, 'email' => 'other@example.test'])
        ->assertSessionHasErrors('starts_at');

    expect(Booking::count())->toBe(1)
        ->and(Event::count())->toBe(1);
});

test('invalid slot outside availability is rejected', function () {
    Mail::fake();
    fakeTurnstile();

    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    makeBookingLink($team);

    $this->post(route('public-booking-link.store', [
        'team' => $team->slug,
        'bookingLink' => 'discovery-call',
    ]), [
        'firstName' => 'Jane',
        'lastName' => 'Client',
        'email' => 'jane@example.test',
        'startsAt' => '2026-08-03T12:00:00',
        'turnstileToken' => 'token',
    ])->assertSessionHasErrors('starts_at');

    expect(Booking::count())->toBe(0);
});
