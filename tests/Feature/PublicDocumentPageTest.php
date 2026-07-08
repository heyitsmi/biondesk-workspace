<?php

use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

test('public document page renders an invoice by number', function () {
    $team = Team::factory()->create(['name' => 'Biondesk Studio']);

    $response = $this->get(route('public-document', ['team' => $team->slug, 'document' => 'inv-2023-042']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/document')
        ->where('document.kind', 'invoice')
        ->where('document.number', 'INV-2023-042')
        ->where('document.primaryActionLabel', 'Pay Now')
        ->has('document.lineItems', 2),
    );
});

test('public document page renders a quotation by number', function () {
    $team = Team::factory()->create();

    $response = $this->get(route('public-document', ['team' => $team->slug, 'document' => 'quo-2023-014']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/document')
        ->where('document.kind', 'quotation')
        ->where('document.number', 'QUO-2023-014')
        ->where('document.primaryActionLabel', 'Accept Quotation'),
    );
});

test('public document page renders a proposal by number', function () {
    $team = Team::factory()->create();

    $response = $this->get(route('public-document', ['team' => $team->slug, 'document' => 'p-2026-004']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/document')
        ->where('document.kind', 'proposal')
        ->where('document.number', 'P-2026-004')
        ->where('document.primaryActionLabel', 'Accept Proposal'),
    );
});

test('public document page returns not found for unknown document or team', function () {
    $team = Team::factory()->create();

    $this->get(route('public-document', ['team' => $team->slug, 'document' => 'missing-doc']))
        ->assertNotFound();

    $this->get('/d/missing-team/inv-2023-042')
        ->assertNotFound();
});
