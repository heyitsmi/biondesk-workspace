<?php

use App\Actions\Teams\CreateTeam;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('app scaffold pages require authentication and verification', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->get(route('opportunities.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));

    $this->get(route('projects.show', ['current_team' => $team->slug, 'project' => 12]))
        ->assertRedirect(route('login'));

    $this->get(route('proposals.show', ['current_team' => $team->slug, 'proposal' => 21]))
        ->assertRedirect(route('login'));

    $this->get(route('contacts.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));

    $this->get(route('reminders.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));

    $this->get(route('profiles.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));
});

test('authenticated users can view app scaffold pages for their current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();
    Opportunity::factory()->for($team)->for($contact)->create();

    $this->actingAs($user)
        ->get(route('projects.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/index')
            ->where('defaultView', 'board')
            ->has('stages', 6)
            ->has('projects', 1),
        );

    $this->actingAs($user)
        ->get(route('projects.show', ['current_team' => $team->slug, 'project' => $project->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/show')
            ->where('project.id', $project->id)
            ->where('project.title', $project->title)
            ->has('taskStages', 5)
            ->has('project.tasks')
            ->has('project.requestLogs'),
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

    $this->actingAs($user)
        ->get(route('projects.create', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/create')
            ->has('stages', 6)
            ->has('opportunities')
            ->has('defaults'),
        );

    $this->actingAs($user)
        ->get(route('projects.edit', ['current_team' => $team->slug, 'project' => $project->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/edit')
            ->where('project.id', $project->id)
            ->where('project.title', $project->title)
            ->has('stages', 6),
        );

    $this->actingAs($user)
        ->get(route('proposals.create', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('proposals/create')
            ->has('nextNumber')
            ->has('clients', 5)
            ->has('projects'),
        );

    $this->actingAs($user)
        ->get(route('proposals.edit', ['current_team' => $team->slug, 'proposal' => 21]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('proposals/edit')
            ->where('proposal.id', 21)
            ->where('proposal.title', 'Website Redesign Proposal')
            ->has('clients', 5)
            ->has('projects'),
        );

    $this->actingAs($user)
        ->get(route('proposals.show', ['current_team' => $team->slug, 'proposal' => 21]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('proposals/show')
            ->where('proposal.id', 21)
            ->where('proposal.title', 'Website Redesign Proposal')
            ->where('proposal.number', 'P-2026-004')
            ->has('proposal.lineItems', 3)
            ->has('proposal.preparedFor'),
        );

    $this->actingAs($user)
        ->get(route('reminders.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reminders/index')
            ->has('reminders', 8)
            ->where('summary.allCount', 8)
            ->where('summary.overdueCount', 2),
        );

    $this->actingAs($user)
        ->get(route('profiles.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('profiles/index')
            ->has('profiles', 5),
        );

    $this->actingAs($user)
        ->get(route('profiles.create', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('profiles/create')
            ->has('defaults'),
        );

    $this->actingAs($user)
        ->get(route('profiles.edit', ['current_team' => $team->slug, 'profile' => 1]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('profiles/edit')
            ->where('profile.id', 1)
            ->where('profile.title', 'Default Company Profile'),
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

test('profile edit route returns 404 for unknown stub profile', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get(route('profiles.edit', ['current_team' => $team->slug, 'profile' => 9999]))
        ->assertNotFound();
});

test('opportunity edit route returns 404 for unknown stub opportunity', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get(route('opportunities.edit', ['current_team' => $team->slug, 'opportunity' => 9999]))
        ->assertNotFound();
});

test('project edit route returns 404 for unknown stub project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get(route('projects.edit', ['current_team' => $team->slug, 'project' => 9999]))
        ->assertNotFound();
});

test('proposal edit route returns 404 for unknown stub proposal', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get(route('proposals.edit', ['current_team' => $team->slug, 'proposal' => 9999]))
        ->assertNotFound();
});

test('proposal show route returns 404 for unknown stub proposal', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get(route('proposals.show', ['current_team' => $team->slug, 'proposal' => 9999]))
        ->assertNotFound();
});
