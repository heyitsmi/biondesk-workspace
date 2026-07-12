<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateDocumentPdfJob;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentPdfGenerateController extends Controller
{
    /**
     * Handle the incoming request. Returns immediately if a cached PDF
     * already matches the document's current content; otherwise dispatches
     * a queued job to generate one (PDF rendering never runs synchronously
     * in the request cycle).
     */
    public function __invoke(Request $request, Document $document): JsonResponse
    {
        if ($document->hasCurrentCachedPdf()) {
            return response()->json(['status' => 'ready']);
        }

        GenerateDocumentPdfJob::dispatch($document->id);

        return response()->json(['status' => 'queued']);
    }
}
