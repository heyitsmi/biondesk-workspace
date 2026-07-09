<?php

use App\Enums\ProjectStatus;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('projects index lists only the current team\'s projects with summary', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    $opportunityA = Opportunity::factory()->for($team)->for($contact)->create();
    $opportunityB = Opportunity::factory()->for($team)->for($contact)->create();
    Project::factory()->for($team)->for($opportunityA)->create(['status' => ProjectStatus::Completed]);
    Project::factory()->for($team)->for($opportunityB)->create(['status' => ProjectStatus::InProgress]);
    Project::factory()->for($otherTeam)->for(
        Opportunity::factory()->for($otherTeam)->for(Contact::factory()->for($otherTeam)),
    )->create();

    $this->actingAs($user)
        ->get(route('projects.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/index')
            ->has('stages', 6)
            ->has('projects', 2)
            ->where('summary.activeCount', '1')
            ->where('summary.completionRate', '50%'),
        );
});

test('the create page returns stages, opportunities without a project, and defaults', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $available = Opportunity::factory()->for($team)->for($contact)->create();
    $linkedOpportunity = Opportunity::factory()->for($team)->for($contact)->create();
    Project::factory()->for($team)->for($linkedOpportunity)->create();

    $this->actingAs($user)
        ->get(route('projects.create', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/create')
            ->has('stages', 6)
            ->has('opportunities', 1)
            ->where('opportunities.0.id', $available->id)
            ->where('defaults.status', 'not_started'),
        );
});

test('the create page pre-fills the title and opportunity when given an opportunity_id', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create(['title' => 'Website Revamp']);

    $this->actingAs($user)
        ->get(route('projects.create', ['current_team' => $team->slug]).'?opportunity_id='.$opportunity->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('defaults.opportunityId', $opportunity->id)
            ->where('defaults.title', 'Website Revamp'),
        );
});

test('a project can be created for an opportunity belonging to the team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    $response = $this->actingAs($user)
        ->post(route('projects.store', ['current_team' => $team->slug]), [
            'opportunity_id' => $opportunity->id,
            'title' => 'Website Revamp Project',
            'status' => 'in_progress',
            'budget_value' => 5000,
        ]);

    $project = Project::sole();
    $response->assertRedirect(route('projects.show', ['current_team' => $team->slug, 'project' => $project->id]));

    expect($project->team_id)->toBe($team->id);
    expect($project->opportunity_id)->toBe($opportunity->id);
    expect($project->status)->toBe(ProjectStatus::InProgress);
    expect($project->budget_value)->toBe(5000);
    expect($project->sort_order)->toBeGreaterThan(0);
});

test('a project can be created from the camelCase payload the frontend form sends', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    $this->actingAs($user)
        ->post(route('projects.store', ['current_team' => $team->slug]), [
            'opportunityId' => $opportunity->id,
            'title' => 'Website Revamp Project',
            'budgetValue' => '2500',
        ])
        ->assertSessionDoesntHaveErrors();

    $project = Project::sole();
    expect($project->opportunity_id)->toBe($opportunity->id);
    expect($project->budget_value)->toBe(2500);
    expect($project->status)->toBe(ProjectStatus::NotStarted);
});

test('a project cannot be created for another team\'s opportunity', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignOpportunity = Opportunity::factory()->for($otherTeam)->for(Contact::factory()->for($otherTeam))->create();

    $this->actingAs($user)
        ->post(route('projects.store', ['current_team' => $team->slug]), [
            'opportunity_id' => $foreignOpportunity->id,
            'title' => 'Hijacked Project',
        ])
        ->assertSessionHasErrors('opportunity_id');

    expect(Project::count())->toBe(0);
});

test('a project cannot be created for an opportunity that already has one', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    Project::factory()->for($team)->for($opportunity)->create();

    $this->actingAs($user)
        ->post(route('projects.store', ['current_team' => $team->slug]), [
            'opportunity_id' => $opportunity->id,
            'title' => 'Duplicate Project',
        ])
        ->assertSessionHasErrors('opportunity_id');

    expect(Project::count())->toBe(1);
});

test('a project can be edited via the dedicated edit page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create(['title' => 'Old Title']);

    $this->actingAs($user)
        ->get(route('projects.edit', ['current_team' => $team->slug, 'project' => $project->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/edit')
            ->where('project.id', $project->id)
            ->where('project.title', 'Old Title'),
        );

    $this->actingAs($user)
        ->put(route('projects.update', ['current_team' => $team->slug, 'project' => $project->id]), [
            'title' => 'New Title',
            'status' => 'completed',
            'start_date' => '2026-01-01',
            'due_date' => '2026-02-01',
            'budget_value' => 8000,
        ])
        ->assertRedirect(route('projects.show', ['current_team' => $team->slug, 'project' => $project->id]));

    $project->refresh();
    expect($project->title)->toBe('New Title');
    expect($project->status)->toBe(ProjectStatus::Completed);
    expect($project->budget_value)->toBe(8000);
    expect($project->start_date->toDateString())->toBe('2026-01-01');
});

test('a partial project update from the inline details editor does not clobber dates or budget', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create([
        'due_date' => '2026-03-15',
        'budget_value' => 12000,
    ]);

    $this->actingAs($user)
        ->put(route('projects.update', ['current_team' => $team->slug, 'project' => $project->id]), [
            'title' => 'Updated via Details tab',
            'status' => 'in_review',
            'description' => 'New description',
        ])
        ->assertRedirect();

    $project->refresh();
    expect($project->title)->toBe('Updated via Details tab');
    expect($project->status)->toBe(ProjectStatus::InReview);
    expect($project->due_date->toDateString())->toBe('2026-03-15');
    expect($project->budget_value)->toBe(12000);
});

test('a project\'s status and sort order can be moved via the drag endpoint', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create(['status' => ProjectStatus::NotStarted, 'sort_order' => 0]);

    $this->actingAs($user)
        ->patch(route('projects.move', ['current_team' => $team->slug, 'project' => $project->id]), [
            'status' => 'in_progress',
            'sort_order' => 1500.5,
        ])
        ->assertRedirect();

    $project->refresh();
    expect($project->status)->toBe(ProjectStatus::InProgress);
    expect($project->sort_order)->toBe(1500.5);
});

test('a team cannot view, update, move, or delete another team\'s project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignOpportunity = Opportunity::factory()->for($otherTeam)->for(Contact::factory()->for($otherTeam))->create();
    $project = Project::factory()->for($otherTeam)->for($foreignOpportunity)->create();

    $this->actingAs($user)
        ->get(route('projects.show', ['current_team' => $team->slug, 'project' => $project->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->get(route('projects.edit', ['current_team' => $team->slug, 'project' => $project->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->put(route('projects.update', ['current_team' => $team->slug, 'project' => $project->id]), [
            'title' => 'Hacked',
            'status' => 'completed',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->patch(route('projects.move', ['current_team' => $team->slug, 'project' => $project->id]), [
            'status' => 'completed',
            'sort_order' => 1,
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('projects.destroy', ['current_team' => $team->slug, 'project' => $project->id]))
        ->assertNotFound();

    expect($project->fresh()->title)->not->toBe('Hacked');
});

test('a project can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();

    $this->actingAs($user)
        ->delete(route('projects.destroy', ['current_team' => $team->slug, 'project' => $project->id]))
        ->assertRedirect(route('projects.index', ['current_team' => $team->slug]));

    expect(Project::find($project->id))->toBeNull();
});

test('the show page returns the project detail with tasks, request logs, and activity', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();

    $this->actingAs($user)
        ->get(route('projects.show', ['current_team' => $team->slug, 'project' => $project->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/show')
            ->where('project.id', $project->id)
            ->has('taskStages', 5)
            ->has('project.tasks')
            ->has('project.requestLogs')
            ->has('project.activity'),
        );
});
