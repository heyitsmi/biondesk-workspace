<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\ProjectStatus;
use App\Enums\RequestLogClassification;
use App\Enums\RequestLogMessageAuthorType;
use App\Enums\RequestLogSource;
use App\Enums\RequestLogStatus;
use App\Enums\TaskStatus;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\RequestLogMessage;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        'status' => RequestLogStatus::Reviewing,
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
            ->where('portal.requests.0.status', 'reviewing')
            ->where('portal.requests.0.statusLabel', 'Reviewing')
        );
});

test('public request submission creates a client-visible request log with attachments', function () {
    Storage::fake('public');

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();

    $this->post(route('client-portal.requests.store', [
        'contact' => $contact->portal_token,
        'project' => $project->id,
    ]), [
        'text' => 'Can we update the payment terms?',
        'attachments' => [
            UploadedFile::fake()->image('payment.png'),
            UploadedFile::fake()->create('terms.pdf', 200, 'application/pdf'),
        ],
    ])->assertRedirect();

    $requestLog = RequestLog::sole();

    expect($requestLog->project_id)->toBe($project->id);
    expect($requestLog->text)->toBe('Can we update the payment terms?');
    expect($requestLog->source)->toBe(RequestLogSource::ClientPortal);
    expect($requestLog->classification)->toBe(RequestLogClassification::New);
    expect($requestLog->status)->toBe(RequestLogStatus::Submitted);
    expect($requestLog->visible_to_client)->toBeTrue();
    expect($requestLog->getMedia('attachments'))->toHaveCount(2);
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

test('public request reply creates a client-authored thread message with attachments', function () {
    Storage::fake('public');

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();
    $requestLog = RequestLog::factory()->for($project)->create([
        'visible_to_client' => true,
        'status' => RequestLogStatus::Submitted,
    ]);

    $this->post(route('client-portal.request-messages.store', [
        'contact' => $contact->portal_token,
        'project' => $project->id,
        'requestLog' => $requestLog->id,
    ]), [
        'body' => 'Adding a screenshot for context.',
        'attachments' => [UploadedFile::fake()->image('context.png')],
    ])->assertRedirect();

    $message = RequestLogMessage::sole();

    expect($message->request_log_id)->toBe($requestLog->id);
    expect($message->author_type)->toBe(RequestLogMessageAuthorType::Client);
    expect($message->contact_id)->toBe($contact->id);
    expect($message->body)->toBe('Adding a screenshot for context.');
    expect($message->getMedia('attachments'))->toHaveCount(1);
});

test('public request reply cannot target hidden or foreign requests', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();
    $hiddenRequest = RequestLog::factory()->for($project)->create([
        'visible_to_client' => false,
    ]);

    $otherContact = Contact::factory()->for($team)->create();
    $otherOpportunity = Opportunity::factory()->for($team)->for($otherContact)->create();
    $otherProject = Project::factory()->for($team)->for($otherOpportunity)->create();
    $foreignRequest = RequestLog::factory()->for($otherProject)->create([
        'visible_to_client' => true,
    ]);

    $this->post(route('client-portal.request-messages.store', [
        'contact' => $contact->portal_token,
        'project' => $project->id,
        'requestLog' => $hiddenRequest->id,
    ]), [
        'body' => 'Should fail.',
    ])->assertNotFound();

    $this->post(route('client-portal.request-messages.store', [
        'contact' => $contact->portal_token,
        'project' => $otherProject->id,
        'requestLog' => $foreignRequest->id,
    ]), [
        'body' => 'Should also fail.',
    ])->assertNotFound();

    expect(RequestLogMessage::count())->toBe(0);
});

test('portal payload includes safe attachments thread messages and open request stats', function () {
    Storage::fake('public');

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create(['first_name' => 'Jane', 'last_name' => 'Doe']);
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();
    RequestLog::factory()->for($project)->create([
        'visible_to_client' => true,
        'status' => RequestLogStatus::Resolved,
    ]);
    $openRequest = RequestLog::factory()->for($project)->create([
        'text' => 'Please review this.',
        'visible_to_client' => true,
        'status' => RequestLogStatus::InProgress,
    ]);
    $openRequest->addMedia(UploadedFile::fake()->image('original.png'))->toMediaCollection('attachments');
    $message = RequestLogMessage::factory()->for($openRequest)->create([
        'author_type' => RequestLogMessageAuthorType::Client,
        'contact_id' => $contact->id,
        'body' => 'Here is more detail.',
    ]);
    $message->addMedia(UploadedFile::fake()->create('detail.pdf', 200, 'application/pdf'))->toMediaCollection('attachments');

    $this->get(route('client-portal.show', ['contact' => $contact->portal_token]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/portal')
            ->where('portal.stats.openRequests', 1)
            ->has('portal.requests', 2)
            ->where('portal.requests.0.uuid', $openRequest->uuid)
            ->where('portal.requests.0.projectId', $project->id)
            ->where('portal.requests.0.status', 'in_progress')
            ->has('portal.requests.0.attachments', 1)
            ->where('portal.requests.0.messages.0.body', 'Here is more detail.')
            ->has('portal.requests.0.messages.0.attachments', 1)
        );
});

test('client can open only their visible request detail by uuid', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create(['first_name' => 'Jane', 'last_name' => 'Doe']);
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create(['title' => 'Portal Website']);
    $requestLog = RequestLog::factory()->for($project)->create([
        'text' => 'Please update the hero copy.',
        'visible_to_client' => true,
        'status' => RequestLogStatus::Reviewing,
    ]);

    $this->get(route('client-portal.requests.show', [
        'contact' => $contact->portal_token,
        'project' => $project->id,
        'requestLog' => $requestLog->uuid,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/request-log-show')
            ->where('project.id', $project->id)
            ->where('project.title', 'Portal Website')
            ->where('requestLog.uuid', $requestLog->uuid)
            ->where('requestLog.text', 'Please update the hero copy.')
            ->where('requestLog.status', 'reviewing')
        );
});

test('hidden internal and foreign client request details return not found', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();
    $hiddenRequest = RequestLog::factory()->for($project)->create([
        'visible_to_client' => false,
    ]);

    $otherContact = Contact::factory()->for($team)->create();
    $otherOpportunity = Opportunity::factory()->for($team)->for($otherContact)->create();
    $otherProject = Project::factory()->for($team)->for($otherOpportunity)->create();
    $foreignRequest = RequestLog::factory()->for($otherProject)->create([
        'visible_to_client' => true,
    ]);

    $this->get(route('client-portal.requests.show', [
        'contact' => $contact->portal_token,
        'project' => $project->id,
        'requestLog' => $hiddenRequest->uuid,
    ]))->assertNotFound();

    $this->get(route('client-portal.requests.show', [
        'contact' => $contact->portal_token,
        'project' => $otherProject->id,
        'requestLog' => $foreignRequest->uuid,
    ]))->assertNotFound();
});

test('client can reply with attachments from dedicated request detail page', function () {
    Storage::fake('public');

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();
    $requestLog = RequestLog::factory()->for($project)->create([
        'visible_to_client' => true,
    ]);

    $this->from(route('client-portal.requests.show', [
        'contact' => $contact->portal_token,
        'project' => $project->id,
        'requestLog' => $requestLog->uuid,
    ]))
        ->post(route('client-portal.request-messages.store', [
            'contact' => $contact->portal_token,
            'project' => $project->id,
            'requestLog' => $requestLog->id,
        ]), [
            'body' => 'Adding the requested screenshot.',
            'attachments' => [UploadedFile::fake()->image('screenshot.png')],
        ])
        ->assertRedirect(route('client-portal.requests.show', [
            'contact' => $contact->portal_token,
            'project' => $project->id,
            'requestLog' => $requestLog->uuid,
        ]));

    $message = RequestLogMessage::sole();

    expect($message->author_type)->toBe(RequestLogMessageAuthorType::Client);
    expect($message->body)->toBe('Adding the requested screenshot.');
    expect($message->getMedia('attachments'))->toHaveCount(1);
});
