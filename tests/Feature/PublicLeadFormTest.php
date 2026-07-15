<?php

use App\Models\BookingLink;
use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

test('public lead form renders for valid team slug', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio']);

    $response = $this->get(route('public-lead-form', ['team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/lead-form')
        ->where('team.name', 'Biondesk Studio')
        ->where('team.slug', $team->slug)
        ->where('settings.enabled', true)
        ->where('settings.title', 'Work with Biondesk Studio')
        ->has('settings.services')
        ->has('turnstileSiteKey'),
    );
});

test('public lead form returns not found for unknown team slug', function () {
    $response = $this->get('/p/missing-team');

    $response->assertNotFound();
});

test('public lead form renders and resolves via a custom lead form slug', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio', 'lead_form_slug' => 'hilmi-studio']);

    $response = $this->get(route('public-lead-form', ['team' => 'hilmi-studio']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/lead-form')
        ->where('team.name', 'Biondesk Studio')
        ->where('team.slug', $team->slug)
        ->where('team.leadFormSlug', 'hilmi-studio')
        ->where('settings.slug', 'hilmi-studio')
        ->where('settings.customSlug', 'hilmi-studio'),
    );

    $this->get(route('public-lead-form', ['team' => $team->slug]))->assertOk();
});

test('public lead form exposes the form title used for the browser tab', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio', 'lead_form_title' => 'Custom Inquiry Title']);

    $response = $this->get(route('public-lead-form', ['team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/lead-form')
        ->where('settings.title', 'Custom Inquiry Title'),
    );
});

test('public lead form exposes saved social links', function () {
    $team = Team::factory()->create([
        'name' => 'Biondesk Studio',
        'lead_form_social_links' => [
            ['platform' => 'instagram', 'url' => 'https://instagram.com/biondesk'],
            ['platform' => 'website', 'url' => 'https://biondesk.test'],
        ],
    ]);

    $response = $this->get(route('public-lead-form', ['team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/lead-form')
        ->where('settings.socialLinks', [
            ['platform' => 'instagram', 'url' => 'https://instagram.com/biondesk'],
            ['platform' => 'website', 'url' => 'https://biondesk.test'],
        ]),
    );
});

test('public lead form exposes selected active booking link when enabled', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio']);
    $bookingLink = BookingLink::factory()->for($team)->create([
        'name' => 'Discovery Call',
        'slug' => 'discovery-call',
        'description' => 'Pick a time for a quick call.',
        'duration_minutes' => 30,
        'is_active' => true,
    ]);

    $team->update([
        'lead_form_show_booking_link' => true,
        'lead_form_booking_link_id' => $bookingLink->id,
    ]);

    $response = $this->get(route('public-lead-form', ['team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/lead-form')
        ->where('settings.showBookingLink', true)
        ->where('settings.bookingLinkId', $bookingLink->id)
        ->where('settings.bookingLink.name', 'Discovery Call')
        ->where('settings.bookingLink.description', 'Pick a time for a quick call.')
        ->where('settings.bookingLink.url', "/book/{$team->slug}/discovery-call")
        ->where('settings.bookingLink.durationMinutes', 30),
    );
});

test('public lead form hides booking link when disabled or inactive', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio']);
    $bookingLink = BookingLink::factory()->for($team)->create([
        'is_active' => false,
    ]);

    $team->update([
        'lead_form_show_booking_link' => true,
        'lead_form_booking_link_id' => $bookingLink->id,
    ]);

    $this->get(route('public-lead-form', ['team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('settings.bookingLink', null),
        );

    $bookingLink->update(['is_active' => true]);
    $team->update(['lead_form_show_booking_link' => false]);

    $this->get(route('public-lead-form', ['team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('settings.bookingLink', null),
        );
});

test('public lead form exposes custom SEO meta title and description', function () {
    $team = Team::factory()->create([
        'name' => 'Biondesk Studio',
        'lead_form_meta_title' => 'Custom SEO Title',
        'lead_form_meta_description' => 'Custom SEO description for search engines.',
    ]);

    $response = $this->get(route('public-lead-form', ['team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/lead-form')
        ->where('settings.metaTitle', 'Custom SEO Title')
        ->where('settings.metaDescription', 'Custom SEO description for search engines.'),
    );
});

test('public lead form falls back SEO meta fields to title and welcome message', function () {
    $team = Team::factory()->create([
        'name' => 'Biondesk Studio',
        'lead_form_title' => 'Work with Biondesk',
        'lead_form_welcome_message' => 'Tell us about your project and budget.',
    ]);

    $response = $this->get(route('public-lead-form', ['team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/lead-form')
        ->where('settings.metaTitle', 'Work with Biondesk')
        ->where('settings.metaDescription', 'Tell us about your project and budget.')
        ->where('settings.ogImageUrl', null),
    );
});
