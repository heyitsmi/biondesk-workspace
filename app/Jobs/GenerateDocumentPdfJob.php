<?php

namespace App\Jobs;

use App\Models\Document;
use App\Support\Pdf\DocumentPdfRenderer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateDocumentPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $documentId) {}

    /**
     * Execute the job: render the document to PDF and cache it via the media
     * library, unless a cached PDF already matches the document's current
     * content hash (nothing changed since it was last generated).
     */
    public function handle(DocumentPdfRenderer $renderer): void
    {
        $document = Document::with(['team', 'contact', 'items'])->findOrFail($this->documentId);

        if ($document->hasCurrentCachedPdf()) {
            return;
        }

        $url = route('documents.print', ['document' => $document->public_token]);
        $pdfContents = $renderer->render($url);

        $document->addMediaFromString($pdfContents)
            ->usingFileName("{$document->number}.pdf")
            ->withCustomProperties(['content_hash' => $document->contentHash()])
            ->toMediaCollection('pdf');
    }
}
