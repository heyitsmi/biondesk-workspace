<?php

use App\Actions\Teams\CreateTeam;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('app scaffold pages require authentication and verification', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->get(route('opportunities.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));

    $this->get(route('projects.show', ['current_team' => $team->slug, 'project' => 12]))
        ->assertRedirect(route('login'));

    $this->get(route('contacts.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));
});

test('authenticated users can view app scaffold pages for their current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get(route('opportunities.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('opportunities/index')
            ->where('defaultView', 'board')
            ->has('stages', 6)
            ->has('opportunities', 8),
        );

    $this->actingAs($user)
        ->get(route('projects.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/index')
            ->where('defaultView', 'board')
            ->has('stages', 6)
            ->has('projects', 6),
        );

    $this->actingAs($user)
        ->get(route('projects.show', ['current_team' => $team->slug, 'project' => 12]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/show')
            ->where('project.id', 12)
            ->where('project.title', 'Fintech Brand Identity')
            ->has('taskStages', 5)
            ->has('project.tasks')
            ->has('project.requestLogs'),
        );

    $this->actingAs($user)
        ->get(route('contacts.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contacts/index')
            ->has('contacts', 5)
            ->where('contactsCount', '5')
            ->where('defaultFilters.type', ''),
        );

    $this->actingAs($user)
        ->get(route('contacts.create', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contacts/create')
            ->where('contactsCount', '5')
            ->has('defaults'),
        );

    $this->actingAs($user)
        ->get(route('contacts.show', ['current_team' => $team->slug, 'contact' => 124]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contacts/show')
            ->where('contactsCount', '5')
            ->where('contact.id', 124)
            ->where('contact.fullName', 'John Smith')
            ->has('contact.relatedProjects')
            ->has('contact.activity'),
        );

    $this->actingAs($user)
        ->get(route('contacts.edit', ['current_team' => $team->slug, 'contact' => 124]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contacts/edit')
            ->where('contactsCount', '5')
            ->where('contact.id', 124)
            ->has('contact'),
        );

    $this->actingAs($user)
        ->get(route('proposals.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('proposals/index')
            ->where('defaultView', 'board')
            ->has('stages', 5)
            ->has('documents', 5)
            ->where('profileLibrarySummary.title', 'AI profile library ready'),
        );
});

test('visiting an app team route syncs the current team context', function () {
    $user = User::factory()->create();
    $secondaryTeam = app(CreateTeam::class)->handle($user, 'Second Studio');

    expect($user->fresh()->currentTeam->is($secondaryTeam))->toBeTrue();

    $primaryTeam = $user->personalTeam();
    $user->switchTeam($primaryTeam);

    $this->actingAs($user)
        ->get(route('projects.index', ['current_team' => $secondaryTeam->slug]))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('contacts.index', ['current_team' => $secondaryTeam->slug]))
        ->assertOk();

    expect($user->fresh()->currentTeam->is($secondaryTeam))->toBeTrue();
});

test('project detail route returns 404 for unknown stub project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get(route('projects.show', ['current_team' => $team->slug, 'project' => 9999]))
        ->assertNotFound();
});

test('contact detail routes return 404 for unknown stub contact', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get(route('contacts.show', ['current_team' => $team->slug, 'contact' => 9999]))
        ->assertNotFound();

    $this->actingAs($user)
        ->get(route('contacts.edit', ['current_team' => $team->slug, 'contact' => 9999]))
        ->assertNotFound();
});
