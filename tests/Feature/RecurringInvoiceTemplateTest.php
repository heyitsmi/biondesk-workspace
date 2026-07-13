<?php

use App\Models\Contact;
use App\Models\RecurringInvoiceTemplate;
use App\Models\Team;
use App\Models\User;

test('a recurring invoice template can be created with line items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('invoices.recurring.store', ['current_team' => $team->slug]), [
            'title' => 'Monthly Retainer',
            'clientId' => $contact->id,
            'intervalMonths' => 1,
            'startsAt' => '2026-01-31',
            'dueDays' => 14,
            'autoSend' => true,
            'currency' => 'USD',
            'taxPercent' => '8',
            'notes' => 'Bank transfer only',
            'items' => [
                ['name' => 'Retainer', 'description' => '', 'qty' => 1, 'price' => '1000'],
            ],
        ])
        ->assertRedirect();

    $template = RecurringInvoiceTemplate::sole();
    expect($template->title)->toBe('Monthly Retainer');
    expect($template->contact_id)->toBe($contact->id);
    expect($template->starts_at->toDateString())->toBe('2026-01-31');
    expect($template->next_run_at->toDateString())->toBe('2026-01-31');
    expect($template->occurrences_generated)->toBe(0);
    expect($template->auto_send)->toBeTrue();
    expect($template->items)->toHaveCount(1);
});

test('a recurring invoice template can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create();

    $this->actingAs($user)
        ->put(route('invoices.recurring.update', ['current_team' => $team->slug, 'template' => $template->id]), [
            'title' => 'Updated Retainer',
            'clientId' => $contact->id,
            'intervalMonths' => 3,
            'startsAt' => $template->starts_at->toDateString(),
            'dueDays' => 30,
            'autoSend' => false,
            'currency' => 'USD',
            'taxPercent' => '0',
            'items' => [
                ['name' => 'Design Retainer', 'description' => '', 'qty' => 1, 'price' => '1500'],
            ],
        ])
        ->assertRedirect();

    $template = $template->fresh();
    expect($template->title)->toBe('Updated Retainer');
    expect($template->interval_months)->toBe(3);
    expect($template->due_days)->toBe(30);
    expect($template->auto_send)->toBeFalse();
    expect($template->items->sole()->name)->toBe('Design Retainer');
});

test('starts_at cannot be changed once a template has generated invoices', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'starts_at' => '2026-01-15',
        'occurrences_generated' => 2,
    ]);

    $this->actingAs($user)
        ->put(route('invoices.recurring.update', ['current_team' => $team->slug, 'template' => $template->id]), [
            'title' => $template->title,
            'clientId' => $contact->id,
            'intervalMonths' => $template->interval_months,
            'startsAt' => '2026-06-01',
            'dueDays' => $template->due_days,
            'currency' => $template->currency,
            'items' => [
                ['name' => 'Retainer', 'description' => '', 'qty' => 1, 'price' => '1000'],
            ],
        ])
        ->assertRedirect();

    expect($template->fresh()->starts_at->toDateString())->toBe('2026-01-15');
});

test('a recurring invoice template can be paused and resumed', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create(['is_active' => true]);

    $this->actingAs($user)
        ->patch(route('invoices.recurring.move', ['current_team' => $team->slug, 'template' => $template->id]), [
            'is_active' => false,
        ])
        ->assertRedirect();

    expect($template->fresh()->is_active)->toBeFalse();

    $this->actingAs($user)
        ->patch(route('invoices.recurring.move', ['current_team' => $team->slug, 'template' => $template->id]), [
            'is_active' => true,
        ])
        ->assertRedirect();

    expect($template->fresh()->is_active)->toBeTrue();
});

test('resuming a template with a stale next_run_at snaps it forward to today', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'is_active' => false,
        'next_run_at' => now()->subMonths(3)->toDateString(),
    ]);

    $this->actingAs($user)
        ->patch(route('invoices.recurring.move', ['current_team' => $team->slug, 'template' => $template->id]), [
            'is_active' => true,
        ])
        ->assertRedirect();

    expect($template->fresh()->next_run_at->toDateString())->toBe(now()->startOfDay()->toDateString());
});

test('a team cannot view, update, or move another team\'s recurring invoice template', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignContact = Contact::factory()->for($otherTeam)->create();
    $template = RecurringInvoiceTemplate::factory()->for($otherTeam)->for($foreignContact)->create();
    $ownContact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->get(route('invoices.recurring.show', ['current_team' => $team->slug, 'template' => $template->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->get(route('invoices.recurring.edit', ['current_team' => $team->slug, 'template' => $template->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->put(route('invoices.recurring.update', ['current_team' => $team->slug, 'template' => $template->id]), [
            'title' => 'Hacked',
            'clientId' => $ownContact->id,
            'intervalMonths' => 1,
            'startsAt' => $template->starts_at->toDateString(),
            'dueDays' => 14,
            'currency' => 'USD',
            'items' => [['name' => 'x', 'qty' => 1, 'price' => '1']],
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->patch(route('invoices.recurring.move', ['current_team' => $team->slug, 'template' => $template->id]), [
            'is_active' => false,
        ])
        ->assertNotFound();

    expect($template->fresh()->title)->not->toBe('Hacked');
});

test('interval_months out of bounds is rejected', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('invoices.recurring.store', ['current_team' => $team->slug]), [
            'clientId' => $contact->id,
            'intervalMonths' => 13,
            'startsAt' => now()->toDateString(),
            'dueDays' => 14,
            'currency' => 'USD',
            'items' => [['name' => 'x', 'qty' => 1, 'price' => '1']],
        ])
        ->assertSessionHasErrors('interval_months');
});

test('an ends_at before starts_at is rejected', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('invoices.recurring.store', ['current_team' => $team->slug]), [
            'clientId' => $contact->id,
            'intervalMonths' => 1,
            'startsAt' => '2026-06-01',
            'endsAt' => '2026-01-01',
            'dueDays' => 14,
            'currency' => 'USD',
            'items' => [['name' => 'x', 'qty' => 1, 'price' => '1']],
        ])
        ->assertSessionHasErrors('ends_at');
});

test('an empty items array is rejected', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('invoices.recurring.store', ['current_team' => $team->slug]), [
            'clientId' => $contact->id,
            'intervalMonths' => 1,
            'startsAt' => now()->toDateString(),
            'dueDays' => 14,
            'currency' => 'USD',
            'items' => [],
        ])
        ->assertSessionHasErrors('items');
});
