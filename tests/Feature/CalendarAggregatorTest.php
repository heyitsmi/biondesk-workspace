<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\OpportunityStage;
use App\Enums\ProjectStatus;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\Team;
use App\Support\Calendar\CalendarAggregator;
use Carbon\Carbon;

test('invoice due dates only include sent or viewed invoices within range', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    $sent = Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => '2026-08-10',
    ]);
    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Draft,
        'due_at' => '2026-08-10',
    ]);
    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => '2027-01-01',
    ]);

    $entries = (new CalendarAggregator)->build($team, Carbon::parse('2026-08-01'), Carbon::parse('2026-08-31'));
    $invoiceEntries = collect($entries)->where('extendedProps.kind', 'invoice');

    expect($invoiceEntries)->toHaveCount(1);
    expect($invoiceEntries->first()['extendedProps']['recordId'])->toBe($sent->id);
});

test('quote expiries exclude accepted quotes and quotes outside range', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    $sent = Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Quote,
        'status' => DocumentStatus::Viewed,
        'valid_until' => '2026-08-15',
    ]);
    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Quote,
        'status' => DocumentStatus::Accepted,
        'valid_until' => '2026-08-15',
    ]);

    $entries = (new CalendarAggregator)->build($team, Carbon::parse('2026-08-01'), Carbon::parse('2026-08-31'));
    $quoteEntries = collect($entries)->where('extendedProps.kind', 'quote');

    expect($quoteEntries)->toHaveCount(1);
    expect($quoteEntries->first()['extendedProps']['recordId'])->toBe($sent->id);
});

test('project deadlines exclude completed and cancelled projects', function () {
    $team = Team::factory()->create();
    $opportunity = Opportunity::factory()->for($team)->for(Contact::factory()->for($team))->create();

    $active = Project::factory()->for($team)->for($opportunity)->create([
        'status' => ProjectStatus::InProgress,
        'due_date' => '2026-08-20',
    ]);
    Project::factory()->for($team)->for($opportunity)->create([
        'status' => ProjectStatus::Completed,
        'due_date' => '2026-08-20',
    ]);

    $entries = (new CalendarAggregator)->build($team, Carbon::parse('2026-08-01'), Carbon::parse('2026-08-31'));
    $projectEntries = collect($entries)->where('extendedProps.kind', 'project');

    expect($projectEntries)->toHaveCount(1);
    expect($projectEntries->first()['extendedProps']['recordId'])->toBe($active->id);
});

test('opportunity close dates exclude won and lost opportunities', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    $open = Opportunity::factory()->for($team)->for($contact)->create([
        'stage' => OpportunityStage::Negotiation,
        'close_date' => '2026-08-25',
    ]);
    Opportunity::factory()->for($team)->for($contact)->create([
        'stage' => OpportunityStage::Won,
        'close_date' => '2026-08-25',
    ]);

    $entries = (new CalendarAggregator)->build($team, Carbon::parse('2026-08-01'), Carbon::parse('2026-08-31'));
    $opportunityEntries = collect($entries)->where('extendedProps.kind', 'opportunity');

    expect($opportunityEntries)->toHaveCount(1);
    expect($opportunityEntries->first()['extendedProps']['recordId'])->toBe($open->id);
});

test('records from another team never appear in the aggregator', function () {
    $team = Team::factory()->create();
    $otherTeam = Team::factory()->create();
    $otherContact = Contact::factory()->for($otherTeam)->create();

    Document::factory()->for($otherTeam)->for($otherContact)->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => '2026-08-10',
    ]);

    $entries = (new CalendarAggregator)->build($team, Carbon::parse('2026-08-01'), Carbon::parse('2026-08-31'));

    expect($entries)->toBe([]);
});
