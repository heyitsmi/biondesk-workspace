<?php

use App\Enums\DocumentType;
use App\Jobs\GenerateDocumentPdfJob;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Team;
use App\Support\Pdf\DocumentPdfRenderer;
use Illuminate\Support\Facades\Queue;

test('generating a pdf dispatches a queued job when no cached pdf exists', function () {
    Queue::fake();

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();

    $this->postJson(route('documents.pdf.generate', ['document' => $document->public_token]))
        ->assertOk()
        ->assertJson(['status' => 'queued']);

    Queue::assertPushed(GenerateDocumentPdfJob::class, fn ($job) => $job->documentId === $document->id);
});

test('generating a pdf does not dispatch a job when a cached pdf already matches', function () {
    Queue::fake();

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();
    $document->syncItems([['name' => 'Item', 'description' => null, 'quantity' => 1, 'unit_price_value' => 100]]);

    $document->addMediaFromString('%PDF-fake%')
        ->usingFileName("{$document->number}.pdf")
        ->withCustomProperties(['content_hash' => $document->contentHash()])
        ->toMediaCollection('pdf');

    $this->postJson(route('documents.pdf.generate', ['document' => $document->public_token]))
        ->assertOk()
        ->assertJson(['status' => 'ready']);

    Queue::assertNotPushed(GenerateDocumentPdfJob::class);
});

test('the pdf status endpoint reports pending then ready', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();

    $this->getJson(route('documents.pdf.status', ['document' => $document->public_token]))
        ->assertOk()
        ->assertJson(['status' => 'pending']);

    $document->addMediaFromString('%PDF-fake%')
        ->usingFileName("{$document->number}.pdf")
        ->withCustomProperties(['content_hash' => $document->contentHash()])
        ->toMediaCollection('pdf');

    $this->getJson(route('documents.pdf.status', ['document' => $document->public_token]))
        ->assertOk()
        ->assertJson(['status' => 'ready']);
});

test('the job renders and caches a pdf, and does not regenerate on a second run', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();
    $document->syncItems([['name' => 'Item', 'description' => null, 'quantity' => 1, 'unit_price_value' => 100]]);

    $renderer = Mockery::mock(DocumentPdfRenderer::class);
    $renderer->shouldReceive('render')->once()->andReturn('%PDF-fake-bytes%');
    $this->app->instance(DocumentPdfRenderer::class, $renderer);

    app()->call([new GenerateDocumentPdfJob($document->id), 'handle']);

    expect($document->fresh()->hasCurrentCachedPdf())->toBeTrue();

    // Second run with an unchanged document must not call the renderer again
    // (the mock's ->once() expectation would fail the test if it did).
    app()->call([new GenerateDocumentPdfJob($document->id), 'handle']);
});

test('the job regenerates the pdf after the document content changes', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();
    $document->syncItems([['name' => 'Item', 'description' => null, 'quantity' => 1, 'unit_price_value' => 100]]);

    $renderer = Mockery::mock(DocumentPdfRenderer::class);
    $renderer->shouldReceive('render')->twice()->andReturn('%PDF-v1%', '%PDF-v2%');
    $this->app->instance(DocumentPdfRenderer::class, $renderer);

    app()->call([new GenerateDocumentPdfJob($document->id), 'handle']);
    $firstHash = $document->fresh()->getFirstMedia('pdf')->getCustomProperty('content_hash');

    $document->update(['title' => 'A brand new title']);

    app()->call([new GenerateDocumentPdfJob($document->id), 'handle']);
    $secondHash = $document->fresh()->getFirstMedia('pdf')->getCustomProperty('content_hash');

    expect($secondHash)->not->toBe($firstHash);
});

test('the download endpoint returns 404 until a matching cached pdf exists', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();

    $this->get(route('documents.pdf.download', ['document' => $document->public_token]))
        ->assertNotFound();

    $document->addMediaFromString('%PDF-fake%')
        ->usingFileName("{$document->number}.pdf")
        ->withCustomProperties(['content_hash' => $document->contentHash()])
        ->toMediaCollection('pdf');

    $this->get(route('documents.pdf.download', ['document' => $document->public_token]))
        ->assertOk();
});

test('the download endpoint returns 404 for a stale cached pdf', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $document = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();

    $document->addMediaFromString('%PDF-fake%')
        ->usingFileName("{$document->number}.pdf")
        ->withCustomProperties(['content_hash' => 'stale-hash-does-not-match'])
        ->toMediaCollection('pdf');

    $this->get(route('documents.pdf.download', ['document' => $document->public_token]))
        ->assertNotFound();
});
