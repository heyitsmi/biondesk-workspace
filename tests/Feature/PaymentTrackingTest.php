<?php

use App\Enums\DocumentType;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a payment can be recorded against an invoice', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $invoice = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();
    $invoice->syncItems([['name' => 'Retainer', 'description' => null, 'quantity' => 1, 'unit_price_value' => 1000]]);

    $this->actingAs($user)
        ->post(route('invoices.payments.store', ['current_team' => $team->slug, 'invoice' => $invoice->id]), [
            'method' => 'Bank Transfer',
            'amountValue' => 400,
            'paidAt' => '2026-01-10',
            'notes' => 'Deposit',
        ])
        ->assertRedirect(route('invoices.show', ['current_team' => $team->slug, 'invoice' => $invoice->id]));

    $payment = $invoice->payments()->sole();
    expect($payment->method)->toBe('Bank Transfer');
    expect($payment->amount_value)->toBe(400);
});

test('amount paid and amount due are computed from multiple payment records', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $invoice = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice, 'discount_percent' => 0, 'tax_percent' => 0])->create();
    $invoice->syncItems([['name' => 'Project', 'description' => null, 'quantity' => 1, 'unit_price_value' => 1000]]);

    $invoice->payments()->create(['method' => 'Bank Transfer', 'amount_value' => 400, 'paid_at' => '2026-01-01']);
    $invoice->payments()->create(['method' => 'Cash', 'amount_value' => 300, 'paid_at' => '2026-01-15']);

    expect($invoice->amountPaidValue())->toBe(700);
    expect($invoice->amountDueValue())->toBe(300);

    $this->actingAs($user)
        ->get(route('invoices.show', ['current_team' => $team->slug, 'invoice' => $invoice->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('invoices/show')
            ->where('invoice.amountPaid', '$700')
            ->where('invoice.amountDue', '$300')
            ->has('invoice.payments', 2),
        );
});

test('amount due never goes negative when payments exceed the total', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $invoice = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();
    $invoice->syncItems([['name' => 'Project', 'description' => null, 'quantity' => 1, 'unit_price_value' => 500]]);

    $invoice->payments()->create(['method' => 'Bank Transfer', 'amount_value' => 700, 'paid_at' => '2026-01-01']);

    expect($invoice->amountDueValue())->toBe(0);
});

test('a payment cannot be recorded against a non-invoice document', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $proposal = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal])->create();

    $this->actingAs($user)
        ->post(route('invoices.payments.store', ['current_team' => $team->slug, 'invoice' => $proposal->id]), [
            'method' => 'Bank Transfer',
            'amountValue' => 100,
            'paidAt' => '2026-01-10',
        ])
        ->assertNotFound();

    expect($proposal->payments()->count())->toBe(0);
});

test('a team cannot record a payment against another team\'s invoice', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignContact = Contact::factory()->for($otherTeam)->create();
    $invoice = Document::factory()->for($otherTeam)->for($foreignContact)->state(['type' => DocumentType::Invoice])->create();

    $this->actingAs($user)
        ->post(route('invoices.payments.store', ['current_team' => $team->slug, 'invoice' => $invoice->id]), [
            'method' => 'Bank Transfer',
            'amountValue' => 100,
            'paidAt' => '2026-01-10',
        ])
        ->assertNotFound();

    expect($invoice->payments()->count())->toBe(0);
});
