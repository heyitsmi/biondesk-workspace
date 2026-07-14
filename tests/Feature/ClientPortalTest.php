<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\ProjectStatus;
use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use App\Enums\TaskStatus;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\Task;
use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

test('contacts receive a portal token and invalid portal tokens return not found', function () {
    $contact = Contact::factory()->create();

    expect($contact->portal_token)->not->toBeNull();
    expect($contact->portal_token)->toHaveLength(32);

    $this->get(route('client-portal.show', ['contact' => 'not-a-real-token']))
        ->assertNotFound();
});

test('client portal only exposes scoped client-safe data', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio']);
    $contact = Contact::factory()->for($team)->create([
        'first_name' => 'Jane',
        'last_name' => 'Client',
        'company' => 'Acme Studio',
        'email' => 'jane@example.test',
    ]);
    $otherContact = Contact::factory()->for($team)->create();
    $otherTeam = Team::factory()->create();
    $otherTeamContact = Contact::factory()->for($otherTeam)->create();

    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create([
        'title' => 'Website Refresh',
        'status' => ProjectStatus::InProgress,
    ]);
    Task::factory()->for($project)->create([
        'title' => 'Homepage copy review',
        'status' => TaskStatus::Todo,
        'description' => 'Internal-only task notes',
    ]);

    $otherContactOpportunity = Opportunity::factory()->for($team)->for($otherContact)->create();
    Project::factory()->for($team)->for($otherContactOpportunity)->create([
        'title' => 'Other Contact Project',
    ]);
    $otherTeamOpportunity = Opportunity::factory()->for($otherTeam)->for($otherTeamContact)->create();
    Project::factory()->for($otherTeam)->for($otherTeamOpportunity)->create([
        'title' => 'Other Team Project',
    ]);

    $visibleDocument = Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Proposal,
        'status' => DocumentStatus::Sent,
        'number' => 'P-1001',
        'title' => 'Shared Proposal',
    ])->create();
    Document::factory()->for($team)->for($contact)->state([
        'status' => DocumentStatus::Draft,
        'number' => 'DRAFT-1002',
        'title' => 'Hidden Draft',
    ])->create();
    Document::factory()->for($team)->for($otherContact)->state([
        'status' => DocumentStatus::Viewed,
        'number' => 'P-2001',
        'title' => 'Other Contact Document',
    ])->create();

    RequestLog::factory()->for($project)->create([
        'text' => 'Please revise the first section.',
        'source' => RequestLogSource::ClientPortal,
        'classification' => RequestLogClassification::New,
        'visible_to_client' => true,
    ]);
    RequestLog::factory()->for($project)->create([
        'text' => 'Internal handoff note',
        'source' => RequestLogSource::Email,
        'visible_to_client' => false,
    ]);

    $this->get(route('client-portal.show', ['contact' => $contact->portal_token]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/portal')
            ->where('portal.teamName', 'Biondesk Studio')
            ->where('portal.contact.fullName', 'Jane Client')
            ->where('portal.stats.activeProjects', 1)
            ->where('portal.stats.documents', 1)
            ->where('portal.stats.openRequests', 1)
            ->has('portal.projects', 1)
            ->where('portal.projects.0.title', 'Website Refresh')
            ->has('portal.projects.0.tasks', 1)
            ->has('portal.projects.0.tasks.0', fn (Assert $task) => $task
                ->where('title', 'Homepage copy review')
                ->where('statusLabel', 'To Do')
                ->missing('description')
                ->etc(),
            )
            ->has('portal.documents', 1)
            ->where('portal.documents.0.id', $visibleDocument->id)
            ->where('portal.documents.0.number', 'P-1001')
            ->has('portal.requests', 1)
            ->where('portal.requests.0.text', 'Please revise the first section.')
        );
});

test('public request submission creates a client-visible request log', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();

    $this->post(route('client-portal.requests.store', [
        'contact' => $contact->portal_token,
        'project' => $project->id,
    ]), [
        'text' => 'Can we update the payment terms?',
    ])->assertRedirect();

    $requestLog = RequestLog::sole();

    expect($requestLog->project_id)->toBe($project->id);
    expect($requestLog->text)->toBe('Can we update the payment terms?');
    expect($requestLog->source)->toBe(RequestLogSource::ClientPortal);
    expect($requestLog->classification)->toBe(RequestLogClassification::New);
    expect($requestLog->visible_to_client)->toBeTrue();
});

test('public request submission cannot target another contact project', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $otherContact = Contact::factory()->for($team)->create();
    $otherOpportunity = Opportunity::factory()->for($team)->for($otherContact)->create();
    $otherProject = Project::factory()->for($team)->for($otherOpportunity)->create();

    $this->post(route('client-portal.requests.store', [
        'contact' => $contact->portal_token,
        'project' => $otherProject->id,
    ]), [
        'text' => 'This should not be accepted.',
    ])->assertNotFound();

    expect(RequestLog::count())->toBe(0);
});
