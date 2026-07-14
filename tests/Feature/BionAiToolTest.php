<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\OpportunityStage;
use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Event;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Support\AiChat\Tools\GetInvoicePaymentStatusTool;
use App\Support\AiChat\Tools\GetOpenTasksTool;
use App\Support\AiChat\Tools\GetOverdueInvoicesTool;
use App\Support\AiChat\Tools\GetPipelineSummaryTool;
use App\Support\AiChat\Tools\GetProjectStatusSummaryTool;
use App\Support\AiChat\Tools\GetTodayScheduleTool;
use App\Support\AiChat\Tools\GetUpcomingDeadlinesTool;
use App\Support\AiChat\Tools\ToolRegistry;

test('get_overdue_invoices returns only sent/viewed invoices past due, scoped to the team', function () {
    $team = Team::factory()->create();
    $otherTeam = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'number' => 'INV-0001',
        'due_at' => now()->subDays(3),
    ]);
    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Draft,
        'due_at' => now()->subDays(3),
    ]);
    Document::factory()->for($otherTeam)->for(Contact::factory()->for($otherTeam))->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => now()->subDays(3),
    ]);

    $result = (new GetOverdueInvoicesTool)->execute($team, []);

    expect($result['invoices'])->toHaveCount(1);
    expect($result['invoices'][0]['number'])->toBe('INV-0001');
});

test('get_today_schedule returns events and aggregated deadlines for today', function () {
    $team = Team::factory()->create();

    Event::factory()->for($team)->create([
        'title' => 'Client call',
        'starts_at' => now()->setTime(14, 0),
        'ends_at' => now()->setTime(15, 0),
        'recurrence' => null,
    ]);

    $result = (new GetTodayScheduleTool)->execute($team, []);

    expect($result['events'])->toHaveCount(1);
    expect($result['events'][0]['title'])->toBe('Client call');
});

test('get_upcoming_deadlines wraps CalendarAggregator with a days_ahead parameter', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Quote,
        'status' => DocumentStatus::Sent,
        'valid_until' => now()->addDays(5),
    ]);
    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Quote,
        'status' => DocumentStatus::Sent,
        'valid_until' => now()->addDays(50),
    ]);

    $result = (new GetUpcomingDeadlinesTool)->execute($team, ['days_ahead' => 10]);

    expect($result['deadlines'])->toHaveCount(1);
});

test('get_open_tasks annotates results with the parent project due date, not a per-task date', function () {
    $team = Team::factory()->create();
    $opportunity = Opportunity::factory()->for($team)->for(Contact::factory()->for($team))->create();
    $project = Project::factory()->for($team)->for($opportunity)->create(['due_date' => '2026-08-01']);

    Task::factory()->for($project)->create(['title' => 'Open task', 'status' => TaskStatus::Todo]);
    Task::factory()->for($project)->create(['title' => 'Finished task', 'status' => TaskStatus::Done]);

    $result = (new GetOpenTasksTool)->execute($team, []);

    expect($result['tasks'])->toHaveCount(1);
    expect($result['tasks'][0]['title'])->toBe('Open task');
    expect($result['tasks'][0])->not->toHaveKey('dueDate');
    expect($result['tasks'][0]['projectDueDate'])->toBe('2026-08-01');
});

test('get_open_tasks can be scoped to a single project', function () {
    $team = Team::factory()->create();
    $opportunity = Opportunity::factory()->for($team)->for(Contact::factory()->for($team))->create();
    $project = Project::factory()->for($team)->for($opportunity)->create();
    $otherProject = Project::factory()->for($team)->for($opportunity)->create();

    Task::factory()->for($project)->create(['status' => TaskStatus::Todo]);
    Task::factory()->for($otherProject)->create(['status' => TaskStatus::Todo]);

    $result = (new GetOpenTasksTool)->execute($team, ['project_id' => $project->id]);

    expect($result['tasks'])->toHaveCount(1);
});

test('get_project_status_summary counts by status and lists stale waiting-on-client projects', function () {
    $team = Team::factory()->create();
    $opportunity = Opportunity::factory()->for($team)->for(Contact::factory()->for($team))->create();

    Project::factory()->for($team)->for($opportunity)->create(['status' => ProjectStatus::InProgress]);
    $stale = Project::factory()->for($team)->for($opportunity)->create(['status' => ProjectStatus::WaitingOnClient]);
    $stale->timestamps = false;
    $stale->updated_at = now()->subDays(5);
    $stale->save();

    $result = (new GetProjectStatusSummaryTool)->execute($team, []);

    expect($result['countsByStatus'][ProjectStatus::InProgress->value])->toBe(1);
    expect($result['staleWaitingOnClient'])->toHaveCount(1);
});

test('get_pipeline_summary breaks down opportunities by stage', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Negotiation, 'amount_value' => 1000]);
    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Negotiation, 'amount_value' => 2000]);

    $result = (new GetPipelineSummaryTool)->execute($team, []);

    expect($result['byStage'][OpportunityStage::Negotiation->value]['count'])->toBe(2);
});

test('get_invoice_payment_status fuzzy-matches by number and reports amounts', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'number' => 'INV-0099',
    ]);

    $result = (new GetInvoicePaymentStatusTool)->execute($team, ['number' => '0099']);

    expect($result['invoices'])->toHaveCount(1);
    expect($result['invoices'][0]['number'])->toBe('INV-0099');
});

test('tool registry returns a structured error for an unknown tool', function () {
    $team = Team::factory()->create();

    $result = ToolRegistry::default()->call('not_a_real_tool', [], $team);

    expect($result)->toHaveKey('error');
});
