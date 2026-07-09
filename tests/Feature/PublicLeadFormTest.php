<?php

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
