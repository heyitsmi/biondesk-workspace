<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('super admins can view the paginated users list', function () {
    $admin = User::factory()->superAdmin()->create();
    User::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get('/ops/users')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ops/users/index')
            ->has('users.data', 4)
            ->where('users.current_page', 1),
        );
});

test('the super admin badge is set correctly for a lone admin user', function () {
    $admin = User::factory()->superAdmin()->create();

    $this->actingAs($admin)
        ->get('/ops/users')
        ->assertInertia(fn (Assert $page) => $page
            ->component('ops/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.isSuperAdmin', true),
        );
});
