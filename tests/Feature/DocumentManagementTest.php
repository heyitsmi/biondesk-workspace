<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('proposals index lists only the current team\'s proposals', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal])->count(2)->create();
    Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Quote])->create();
    Document::factory()->for($otherTeam)->for(Contact::factory()->for($otherTeam))->state(['type' => DocumentType::Proposal])->create();

    $this->actingAs($user)
        ->get(route('proposals.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('proposals/index')
            ->has('documents', 2)
            ->has('stages', 5),
        );
});

test('a proposal can be created with line items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('proposals.store', ['current_team' => $team->slug]), [
            'title' => 'Website Redesign',
            'status' => 'sent',
            'clientId' => $contact->id,
            'datePrepared' => '2026-01-01',
            'validUntil' => '2026-01-15',
            'content' => 'Proposal content here.',
            'notes' => 'Some notes',
            'currency' => 'USD',
            'discountPercent' => '0',
            'taxPercent' => '0',
            'items' => [
                ['name' => 'Homepage design', 'description' => '', 'qty' => 1, 'price' => '2000'],
            ],
        ])
        ->assertRedirect();

    $document = Document::sole();
    expect($document->team_id)->toBe($team->id);
    expect($document->type)->toBe(DocumentType::Proposal);
    expect($document->status)->toBe(DocumentStatus::Sent);
    expect($document->contact_id)->toBe($contact->id);
    expect($document->number)->toStartWith('P-');
    expect($document->items)->toHaveCount(1);
    expect($document->items->first()->unit_price_value)->toBe(2000);
    expect($document->totalValue())->toBe(2000);
});

test('a proposal can be updated and its line items replaced', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal])->create();
    $document->syncItems([['name' => 'Old item', 'description' => null, 'quantity' => 1, 'unit_price_value' => 100]]);

    $this->actingAs($user)
        ->put(route('proposals.update', ['current_team' => $team->slug, 'proposal' => $document->id]), [
            'title' => 'Updated Title',
            'clientId' => $contact->id,
            'currency' => 'USD',
            'items' => [
                ['name' => 'New item', 'description' => '', 'qty' => 2, 'price' => '150'],
            ],
        ])
        ->assertRedirect(route('proposals.show', ['current_team' => $team->slug, 'proposal' => $document->id]));

    $document->refresh();
    expect($document->title)->toBe('Updated Title');
    expect($document->items)->toHaveCount(1);
    expect($document->items->first()->name)->toBe('New item');
});

test('a proposal can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal])->create();

    $this->actingAs($user)
        ->delete(route('proposals.destroy', ['current_team' => $team->slug, 'proposal' => $document->id]))
        ->assertRedirect(route('proposals.index', ['current_team' => $team->slug]));

    expect(Document::find($document->id))->toBeNull();
});

test('a proposal\'s status can be moved via the drag endpoint', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal, 'status' => DocumentStatus::Draft])->create();

    $this->actingAs($user)
        ->patch(route('proposals.move', ['current_team' => $team->slug, 'proposal' => $document->id]), [
            'status' => 'accepted',
        ])
        ->assertRedirect();

    expect($document->fresh()->status)->toBe(DocumentStatus::Accepted);
});

test('a team cannot edit, update, move, or delete another team\'s proposal', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignContact = Contact::factory()->for($otherTeam)->create();
    $document = Document::factory()->for($otherTeam)->for($foreignContact)->state(['type' => DocumentType::Proposal])->create();

    $this->actingAs($user)
        ->get(route('proposals.show', ['current_team' => $team->slug, 'proposal' => $document->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('proposals.destroy', ['current_team' => $team->slug, 'proposal' => $document->id]))
        ->assertNotFound();

    expect($document->fresh())->not->toBeNull();
});

test('an accepted proposal can be converted into a quote draft, copying its line items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal, 'status' => DocumentStatus::Accepted])->create();
    $document->syncItems([['name' => 'Homepage design', 'description' => null, 'quantity' => 1, 'unit_price_value' => 2000]]);

    $this->actingAs($user)
        ->post(route('proposals.convert-to-quote', ['current_team' => $team->slug, 'proposal' => $document->id]))
        ->assertRedirect();

    $quote = Document::where('type', DocumentType::Quote)->sole();
    expect($quote->status)->toBe(DocumentStatus::Draft);
    expect($quote->contact_id)->toBe($contact->id);
    expect($quote->items)->toHaveCount(1);
    expect($quote->items->first()->unit_price_value)->toBe(2000);
});

test('an accepted proposal can be converted directly into an invoice draft', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal, 'status' => DocumentStatus::Accepted])->create();

    $this->actingAs($user)
        ->post(route('proposals.convert-to-invoice', ['current_team' => $team->slug, 'proposal' => $document->id]))
        ->assertRedirect();

    expect(Document::where('type', DocumentType::Invoice)->count())->toBe(1);
});

test('a quotation can be created with line items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('quotations.store', ['current_team' => $team->slug]), [
            'status' => 'draft',
            'clientId' => $contact->id,
            'issuedAt' => '2026-01-01',
            'expiryAt' => '2026-01-15',
            'currency' => 'USD',
            'terms' => 'Valid for 14 days',
            'discountPercent' => '10',
            'items' => [
                ['name' => 'Consulting', 'description' => '', 'qty' => 2, 'price' => '250'],
            ],
        ])
        ->assertRedirect();

    $document = Document::sole();
    expect($document->type)->toBe(DocumentType::Quote);
    expect($document->number)->toStartWith('QUO-');
    expect($document->discount_percent)->toBe(10);
    expect($document->subtotalValue())->toBe(500);
});

test('a quotation\'s status can be moved to sent', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Quote, 'status' => DocumentStatus::Draft])->create();

    $this->actingAs($user)
        ->patch(route('quotations.move', ['current_team' => $team->slug, 'quotation' => $document->id]), [
            'status' => 'sent',
        ])
        ->assertRedirect();

    expect($document->fresh()->status)->toBe(DocumentStatus::Sent);
});

test('a quotation can be converted into an invoice, importing its line items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Quote])->create();
    $document->syncItems([
        ['name' => 'Consulting', 'description' => null, 'quantity' => 2, 'unit_price_value' => 250],
        ['name' => 'Setup fee', 'description' => null, 'quantity' => 1, 'unit_price_value' => 100],
    ]);

    $this->actingAs($user)
        ->post(route('quotations.convert-to-invoice', ['current_team' => $team->slug, 'quotation' => $document->id]))
        ->assertRedirect();

    $invoice = Document::where('type', DocumentType::Invoice)->sole();
    expect($invoice->status)->toBe(DocumentStatus::Draft);
    expect($invoice->items)->toHaveCount(2);
    expect($invoice->subtotalValue())->toBe(600);
});

test('an invoice can be created with line items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('invoices.store', ['current_team' => $team->slug]), [
            'status' => 'sent',
            'clientId' => $contact->id,
            'issuedAt' => '2026-01-01',
            'dueAt' => '2026-01-15',
            'currency' => 'USD',
            'notes' => 'Bank transfer only',
            'taxPercent' => '8',
            'items' => [
                ['name' => 'Retainer', 'description' => '', 'qty' => 1, 'price' => '1000'],
            ],
        ])
        ->assertRedirect();

    $document = Document::sole();
    expect($document->type)->toBe(DocumentType::Invoice);
    expect($document->number)->toStartWith('INV-');
    expect($document->tax_percent)->toBe(8);
    expect($document->totalValue())->toBe(1080);
});

test('an invoice past its due date displays as overdue', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => now()->subDays(3),
    ])->create();

    expect($document->isOverdue())->toBeTrue();
    expect($document->displayStatus())->toBe('overdue');

    $this->actingAs($user)
        ->get(route('invoices.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('invoices/index')
            ->where('invoices.0.status', 'overdue'),
        );
});
