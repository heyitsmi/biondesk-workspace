<?php

use App\Enums\DocumentType;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

test('public document page renders an invoice by token', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio']);
    $contact = Contact::factory()->for($team)->create();
    $invoice = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();
    $invoice->syncItems([
        ['name' => 'Retainer', 'description' => null, 'quantity' => 1, 'unit_price_value' => 1000],
        ['name' => 'Setup fee', 'description' => null, 'quantity' => 1, 'unit_price_value' => 200],
    ]);

    $response = $this->get(route('public-document', ['document' => $invoice->public_token]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/document')
        ->where('document.kind', 'invoice')
        ->where('document.number', $invoice->number)
        ->where('document.primaryActionLabel', 'Pay Now')
        ->has('document.lineItems', 2),
    );
});

test('public document page renders a quotation by token', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $quotation = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Quote])->create();

    $response = $this->get(route('public-document', ['document' => $quotation->public_token]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/document')
        ->where('document.kind', 'quotation')
        ->where('document.number', $quotation->number)
        ->where('document.primaryActionLabel', 'Accept Quote'),
    );
});

test('public document page renders a proposal by token', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $proposal = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal])->create();

    $response = $this->get(route('public-document', ['document' => $proposal->public_token]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/document')
        ->where('document.kind', 'proposal')
        ->where('document.number', $proposal->number)
        ->where('document.primaryActionLabel', 'Accept Proposal'),
    );
});

test('public document page returns not found for an unknown token', function () {
    $this->get(route('public-document', ['document' => 'not-a-real-token']))
        ->assertNotFound();
});

test('every document is assigned a public token as soon as it is created', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal])->create();

    expect($document->public_token)->not->toBeNull();
    expect($document->public_token)->toHaveLength(32);
});
