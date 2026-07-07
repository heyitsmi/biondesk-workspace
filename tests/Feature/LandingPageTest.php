<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('landing page can be rendered for guests', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome'),
    );
});

test('landing page still renders for authenticated users', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->where('currentTeam.slug', $user->currentTeam->slug),
    );
});
