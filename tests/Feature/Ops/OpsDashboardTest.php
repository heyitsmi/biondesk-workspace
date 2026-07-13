<?php

use App\Models\BionAiUsageLog;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('super admins can view the ops dashboard', function () {
    $admin = User::factory()->superAdmin()->create();
    User::factory()->count(3)->create();
    BionAiUsageLog::factory()->create();

    $this->actingAs($admin)
        ->get('/ops/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ops/dashboard')
            ->has('stats', 3)
            ->has('recentSignups'),
        );
});
