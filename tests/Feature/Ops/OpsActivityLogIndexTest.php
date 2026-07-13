<?php

use App\Models\Contact;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('super admins can view the paginated activity logs list', function () {
    $admin = User::factory()->superAdmin()->create();
    $team = Team::factory()->create();

    Contact::factory()->for($team)->create();

    $this->actingAs($admin)
        ->get('/ops/activity-logs')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ops/activity-logs/index')
            ->has('activities.data', 1)
            ->where('activities.data.0.subjectType', 'Contact')
            ->where('activities.data.0.event', 'created'),
        );
});
