<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\ProjectStatus;
use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use App\Enums\RequestLogStatus;
use App\Enums\WorkflowAutomationAction;
use App\Enums\WorkflowAutomationRunStatus;
use App\Enums\WorkflowAutomationTrigger;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Event;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\RequestLogMessage;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Models\WorkflowAutomation;
use App\Models\WorkflowAutomationRun;
use App\Support\WorkflowAutomations\WorkflowAutomationRunner;
use Inertia\Testing\AssertableInertia as Assert;

function workflowAutomationProject(Team $team): Project
{
    $contact = Contact::factory()->for($team)->create([
        'first_name' => 'Jane',
        'last_name' => 'Client',
        'company' => 'Acme Co',
    ]);
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    return Project::factory()->for($team)->for($opportunity)->create([
        'title' => 'Website Refresh',
    ]);
}

test('workflow automations index is scoped to the current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();

    WorkflowAutomation::factory()->for($team)->create(['name' => 'Client request triage']);
    WorkflowAutomation::factory()->for($otherTeam)->create(['name' => 'Foreign automation']);

    $this->withoutVite();

    $this->actingAs($user)
        ->get(route('automations.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('automations/index')
            ->has('automations', 1)
            ->where('automations.0.name', 'Client request triage')
            ->has('templates', 7)
        );
});

test('workflow automation can be created, updated, toggled, and deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $payload = [
        'name' => 'New request triage',
        'template' => 'new_client_request_task',
        'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted->value,
        'conditions' => [],
        'actions' => [[
            'type' => WorkflowAutomationAction::CreateTask->value,
            'title' => 'Review client request',
            'description' => 'Created automatically.',
            'tags' => ['automation'],
        ]],
        'is_active' => true,
    ];

    $this->actingAs($user)
        ->post(route('automations.store', ['current_team' => $team->slug]), $payload)
        ->assertRedirect(route('automations.index', ['current_team' => $team->slug]));

    $automation = WorkflowAutomation::sole();
    expect($automation->team_id)->toBe($team->id);
    expect($automation->name)->toBe('New request triage');
    expect($automation->trigger)->toBe(WorkflowAutomationTrigger::ClientRequestSubmitted);

    $this->actingAs($user)
        ->put(route('automations.update', ['current_team' => $team->slug, 'automation' => $automation->id]), [
            ...$payload,
            'name' => 'Updated request triage',
            'is_active' => false,
        ])
        ->assertRedirect(route('automations.index', ['current_team' => $team->slug]));

    expect($automation->fresh()->name)->toBe('Updated request triage');
    expect($automation->fresh()->is_active)->toBeFalse();

    $this->actingAs($user)
        ->patch(route('automations.toggle', ['current_team' => $team->slug, 'automation' => $automation->id]))
        ->assertRedirect();

    expect($automation->fresh()->is_active)->toBeTrue();

    $this->actingAs($user)
        ->delete(route('automations.destroy', ['current_team' => $team->slug, 'automation' => $automation->id]))
        ->assertRedirect();

    expect(WorkflowAutomation::count())->toBe(0);
});

test('invalid workflow trigger and action are rejected', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('automations.store', ['current_team' => $team->slug]), [
            'name' => 'Invalid automation',
            'template' => 'invalid',
            'trigger' => 'not_a_trigger',
            'actions' => [['type' => 'not_an_action']],
        ])
        ->assertSessionHasErrors(['trigger', 'actions.0.type']);

    expect(WorkflowAutomation::count())->toBe(0);

    $this->actingAs($user)
        ->post(route('automations.store', ['current_team' => $team->slug]), [
            'name' => 'Invalid status automation',
            'template' => 'request_submitted_reviewing',
            'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted->value,
            'conditions' => [],
            'actions' => [[
                'type' => WorkflowAutomationAction::UpdateRequestStatus->value,
                'status' => 'almost_done',
            ]],
        ])
        ->assertSessionHasErrors(['actions.0.status']);

    expect(WorkflowAutomation::count())->toBe(0);
});

test('inactive automations do not run', function () {
    $team = Team::factory()->create();
    $project = workflowAutomationProject($team);
    $requestLog = RequestLog::factory()->for($project)->create(['text' => 'Please change the hero image.']);

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted,
        'is_active' => false,
    ]);

    app(WorkflowAutomationRunner::class)->runForTrigger(
        $team->id,
        WorkflowAutomationTrigger::ClientRequestSubmitted,
        RequestLog::class,
        $requestLog->id,
    );

    expect(Task::count())->toBe(0);
    expect(WorkflowAutomationRun::count())->toBe(0);
});

test('client request submitted creates one task idempotently', function () {
    $team = Team::factory()->create();
    $project = workflowAutomationProject($team);
    $requestLog = RequestLog::factory()->for($project)->create(['text' => 'Please revise the pricing table.']);

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted,
        'actions' => [[
            'type' => WorkflowAutomationAction::CreateTask->value,
            'title' => 'Triage: {{request_preview}}',
            'description' => '{{request_text}}',
        ]],
    ]);

    $runner = app(WorkflowAutomationRunner::class);
    $runner->runForTrigger($team->id, WorkflowAutomationTrigger::ClientRequestSubmitted, RequestLog::class, $requestLog->id);
    $runner->runForTrigger($team->id, WorkflowAutomationTrigger::ClientRequestSubmitted, RequestLog::class, $requestLog->id);

    $task = Task::sole();
    expect($task->project_id)->toBe($project->id);
    expect($task->request_log_id)->toBe($requestLog->id);
    expect($task->title)->toContain('Triage: Please revise');
    expect(WorkflowAutomationRun::count())->toBe(1);
    expect(WorkflowAutomationRun::sole()->status)->toBe(WorkflowAutomationRunStatus::Success);
});

test('client portal request submission triggers automation through the queued job', function () {
    $team = Team::factory()->create();
    $project = workflowAutomationProject($team);
    $contact = $project->opportunity->contact;

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted,
        'actions' => [[
            'type' => WorkflowAutomationAction::CreateTask->value,
            'title' => 'Portal request: {{request_preview}}',
            'description' => '{{request_text}}',
        ]],
    ]);

    $this->post(route('client-portal.requests.store', [
        'contact' => $contact->portal_token,
        'project' => $project->id,
    ]), [
        'text' => 'Can we update the launch checklist?',
    ])->assertRedirect();

    expect(RequestLog::count())->toBe(1);
    expect(Task::count())->toBe(1);
    expect(Task::sole()->title)->toContain('Portal request: Can we update');
});

test('client reply creates a follow-up task once per message', function () {
    $team = Team::factory()->create();
    $project = workflowAutomationProject($team);
    $requestLog = RequestLog::factory()->for($project)->create([
        'visible_to_client' => true,
        'source' => RequestLogSource::ClientPortal,
        'classification' => RequestLogClassification::New,
        'status' => RequestLogStatus::Submitted,
    ]);

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ClientRequestReplied,
        'actions' => [[
            'type' => WorkflowAutomationAction::CreateTask->value,
            'title' => 'Reply follow-up: {{request_preview}}',
            'description' => '{{message_body}}',
        ]],
    ]);

    $message = RequestLogMessage::factory()->for($requestLog)->create([
        'body' => 'Here are the requested files.',
    ]);

    $runner = app(WorkflowAutomationRunner::class);
    $runner->runForTrigger($team->id, WorkflowAutomationTrigger::ClientRequestReplied, RequestLogMessage::class, $message->id);
    $runner->runForTrigger($team->id, WorkflowAutomationTrigger::ClientRequestReplied, RequestLogMessage::class, $message->id);

    expect(Task::count())->toBe(1);
    expect(Task::sole()->description)->toBe('Here are the requested files.');
    expect(WorkflowAutomationRun::count())->toBe(1);
});

test('request and project status actions are scoped and valid', function () {
    $team = Team::factory()->create();
    $project = workflowAutomationProject($team);
    $requestLog = RequestLog::factory()->for($project)->create([
        'status' => RequestLogStatus::Submitted,
    ]);

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::RequestStatusChanged,
        'actions' => [[
            'type' => WorkflowAutomationAction::UpdateProjectStatus->value,
            'status' => ProjectStatus::InReview->value,
        ]],
    ]);
    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ProjectStatusChanged,
        'conditions' => ['status' => ProjectStatus::Completed->value],
        'actions' => [[
            'type' => WorkflowAutomationAction::AddActivityLog->value,
            'message' => 'Project completed via automation.',
            'tone' => 'success',
        ]],
    ]);

    $runner = app(WorkflowAutomationRunner::class);
    $runner->runForTrigger($team->id, WorkflowAutomationTrigger::RequestStatusChanged, RequestLog::class, $requestLog->id, [
        'old_status' => RequestLogStatus::Submitted->value,
        'new_status' => RequestLogStatus::Reviewing->value,
        'status' => RequestLogStatus::Reviewing->value,
    ]);

    expect($project->fresh()->status)->toBe(ProjectStatus::InReview);

    $project->update(['status' => ProjectStatus::Completed]);
    $runner->runForTrigger($team->id, WorkflowAutomationTrigger::ProjectStatusChanged, Project::class, $project->id, [
        'old_status' => ProjectStatus::InReview->value,
        'new_status' => ProjectStatus::Completed->value,
        'status' => ProjectStatus::Completed->value,
    ]);

    expect($project->activitiesAsSubject()->where('description', 'Project completed via automation.')->exists())->toBeTrue();
});

test('project waiting on client can create a calendar event', function () {
    $team = Team::factory()->create();
    $project = workflowAutomationProject($team);

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ProjectStatusChanged,
        'conditions' => ['status' => ProjectStatus::WaitingOnClient->value],
        'actions' => [[
            'type' => WorkflowAutomationAction::CreateCalendarEvent->value,
            'title' => 'Follow up with {{contact_name}}',
            'description' => 'Waiting on client.',
            'delay_days' => 1,
        ]],
    ]);

    app(WorkflowAutomationRunner::class)->runForTrigger(
        $team->id,
        WorkflowAutomationTrigger::ProjectStatusChanged,
        Project::class,
        $project->id,
        ['status' => ProjectStatus::WaitingOnClient->value],
    );

    $event = Event::sole();
    expect($event->team_id)->toBe($team->id);
    expect($event->title)->toBe('Follow up with Acme Co');
});

test('scheduled invoice and quote triggers are idempotent', function () {
    $team = Team::factory()->create();
    $project = workflowAutomationProject($team);
    $contact = $project->opportunity->contact;

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::InvoiceOverdue,
        'actions' => [[
            'type' => WorkflowAutomationAction::CreateTask->value,
            'title' => 'Follow up overdue invoice {{document_number}}',
        ]],
    ]);
    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::QuoteUnresponded,
        'actions' => [[
            'type' => WorkflowAutomationAction::CreateTask->value,
            'title' => 'Follow up quote {{document_number}}',
        ]],
    ]);

    Document::factory()->for($team)->for($contact)->for($project)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'number' => 'INV-2026-0001',
        'due_at' => now()->subDay(),
    ])->create();
    Document::factory()->for($team)->for($contact)->for($project)->state([
        'type' => DocumentType::Quote,
        'status' => DocumentStatus::Viewed,
        'number' => 'QUO-2026-0001',
        'valid_until' => now()->subDay(),
    ])->create();

    $this->artisan('workflow-automations:run-due')->assertSuccessful();
    $this->artisan('workflow-automations:run-due')->assertSuccessful();

    expect(Task::count())->toBe(2);
    expect(WorkflowAutomationRun::count())->toBe(2);
});

test('workflow automation records skipped and failed runs', function () {
    $team = Team::factory()->create();
    $project = workflowAutomationProject($team);

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ProjectStatusChanged,
        'conditions' => ['status' => ProjectStatus::Completed->value],
        'actions' => [[
            'type' => WorkflowAutomationAction::AddActivityLog->value,
            'message' => 'Completed.',
        ]],
    ]);
    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ProjectStatusChanged,
        'actions' => [['type' => 'broken_action']],
    ]);

    app(WorkflowAutomationRunner::class)->runForTrigger(
        $team->id,
        WorkflowAutomationTrigger::ProjectStatusChanged,
        Project::class,
        $project->id,
        ['status' => ProjectStatus::InProgress->value],
    );

    expect(WorkflowAutomationRun::query()->where('status', WorkflowAutomationRunStatus::Skipped)->count())->toBe(1);
    expect(WorkflowAutomationRun::query()->where('status', WorkflowAutomationRunStatus::Failed)->count())->toBe(1);
});

test('foreign team subjects cannot trigger automation', function () {
    $team = Team::factory()->create();
    $otherTeam = Team::factory()->create();
    $foreignProject = workflowAutomationProject($otherTeam);
    $foreignRequestLog = RequestLog::factory()->for($foreignProject)->create();

    WorkflowAutomation::factory()->for($team)->create([
        'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted,
    ]);

    app(WorkflowAutomationRunner::class)->runForTrigger(
        $team->id,
        WorkflowAutomationTrigger::ClientRequestSubmitted,
        RequestLog::class,
        $foreignRequestLog->id,
    );

    expect(Task::count())->toBe(0);
    expect(WorkflowAutomationRun::count())->toBe(0);
});
