<?php

use App\Models\User;

test('non-admin users get a 403 on all ops routes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/ops/dashboard')->assertForbidden();
    $this->actingAs($user)->get('/ops/users')->assertForbidden();
    $this->actingAs($user)->get('/ops/ai-usage-logs')->assertForbidden();
    $this->actingAs($user)->get('/ops/activity-logs')->assertForbidden();
});

test('guests are redirected to login on all ops routes', function () {
    $this->get('/ops/dashboard')->assertRedirect(route('login'));
    $this->get('/ops/users')->assertRedirect(route('login'));
    $this->get('/ops/ai-usage-logs')->assertRedirect(route('login'));
    $this->get('/ops/activity-logs')->assertRedirect(route('login'));
});

test('super admins can access all ops routes', function () {
    $admin = User::factory()->superAdmin()->create();

    $this->actingAs($admin)->get('/ops/dashboard')->assertOk();
    $this->actingAs($admin)->get('/ops/users')->assertOk();
    $this->actingAs($admin)->get('/ops/ai-usage-logs')->assertOk();
    $this->actingAs($admin)->get('/ops/activity-logs')->assertOk();
});
