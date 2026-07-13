<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\OpportunityStage;
use App\Enums\ProjectStatus;
use App\Models\Contact;
use App\Models\Document;
use App\Models\DocumentItem;
use App\Models\Event;
use App\Models\Opportunity;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('pipeline value only sums open opportunities', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Negotiation, 'amount_value' => 5000]);
    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Sent, 'amount_value' => 3000]);
    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Won, 'amount_value' => 99999]);
    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Lost, 'amount_value' => 99999]);

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.0.label', 'Pipeline Value')
            ->where('stats.0.value', '$8,000')
            ->where('stats.0.change', '2 open opportunities'),
        );
});

test('win rate is based on the most recently closed deals', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    Opportunity::factory()->for($team)->for($contact)->count(3)->create(['stage' => OpportunityStage::Won]);
    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Lost]);

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.3.label', 'Win Rate')
            ->where('stats.3.value', '75%')
            ->where('stats.3.change', 'Based on last 4 deals'),
        );
});

test('to be collected sums remaining balance of unpaid invoices, excluding drafts and rejected', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $unpaidInvoice = Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'discount_percent' => 0,
        'tax_percent' => 0,
    ])->has(DocumentItem::factory()->state(['quantity' => 1, 'unit_price_value' => 1200]), 'items')->create();

    Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Draft,
        'discount_percent' => 0,
        'tax_percent' => 0,
    ])->has(DocumentItem::factory()->state(['quantity' => 1, 'unit_price_value' => 5000]), 'items')->create();

    Payment::factory()->for($unpaidInvoice)->create(['amount_value' => 200]);

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.1.label', 'To Be Collected')
            ->where('stats.1.value', '$1,000'),
        );
});

test('overdue invoices and stale waiting-on-client projects surface as priority actions', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    $overdueInvoice = Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => now()->subDays(5),
        'discount_percent' => 0,
        'tax_percent' => 0,
    ])->has(DocumentItem::factory()->state(['quantity' => 1, 'unit_price_value' => 2000]), 'items')->create();

    $staleProject = Project::factory()->for($team)->for($opportunity)->create(['status' => ProjectStatus::WaitingOnClient]);
    $staleProject->timestamps = false;
    $staleProject->updated_at = now()->subDays(6);
    $staleProject->save();

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('priorityActions', 2)
            ->where('priorityActions.0.title', "Invoice {$overdueInvoice->number} is 5 days overdue")
            ->where('priorityActions.0.tone', 'danger')
            ->where('priorityActions.1.title', "{$staleProject->title} waiting on client for 6 days")
            ->where('priorityActions.1.tone', 'accent'),
        );
});

test('recent opportunities lists the most recently updated opportunities', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $older = Opportunity::factory()->for($team)->for($contact)->create(['title' => 'Older Deal']);
    $older->timestamps = false;
    $older->updated_at = now()->subDays(2);
    $older->save();

    $newer = Opportunity::factory()->for($team)->for($contact)->create(['title' => 'Newer Deal']);

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('recentOpportunities', 2)
            ->where('recentOpportunities.0.title', 'Newer Deal')
            ->where('recentOpportunities.1.title', 'Older Deal'),
        );
});

test('activity feed shows recent real events with readable descriptions', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $invoice = Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
    ])->create();

    Payment::factory()->for($invoice)->create(['amount_value' => 500]);

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('activityFeed', 3)
            ->where('activityFeed.0.title', "Payment received for {$invoice->number} (\$500)")
            ->where('activityFeed.0.tone', 'success')
            ->where('activityFeed.1.title', 'Invoice created')
        );
});

test('dashboard data is scoped to the current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $otherTeam = Team::factory()->create();
    $otherContact = Contact::factory()->for($otherTeam)->create();
    Opportunity::factory()->for($otherTeam)->for($otherContact)->create(['stage' => OpportunityStage::Sent, 'amount_value' => 50000]);

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.0.value', '$0')
            ->has('recentOpportunities', 0)
            ->has('activityFeed', 0),
        );
});

test('upcoming events merges real events with aggregated deadlines, sorted and capped at five', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    Event::factory()->for($team)->create([
        'title' => 'Soonest call',
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHour(),
        'recurrence' => null,
    ]);

    Document::factory()->for($team)->for($contact)->create([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => now()->addDays(2),
    ]);

    for ($i = 3; $i < 8; $i++) {
        Event::factory()->for($team)->create([
            'starts_at' => now()->addDays($i),
            'ends_at' => now()->addDays($i)->addHour(),
            'recurrence' => null,
        ]);
    }

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('upcomingEvents', 5)
            ->where('upcomingEvents.0.title', 'Soonest call'),
        );
});

test('upcoming events includes a recurring event regardless of the fixed 14-day window', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    Event::factory()->for($team)->create([
        'title' => 'Monthly retro',
        'starts_at' => now()->subMonths(3),
        'ends_at' => now()->subMonths(3)->addHour(),
        'recurrence' => 'monthly',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('upcomingEvents.0.title', 'Monthly retro')
            ->where('upcomingEvents.0.recurring', true),
        );
});
