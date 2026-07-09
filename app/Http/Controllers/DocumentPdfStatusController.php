<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentPdfStatusController extends Controller
{
    /**
     * Handle the incoming request. Polled by the frontend after dispatching
     * generation, to find out when the queued job has finished.
     */
    public function __invoke(Request $request, Document $document): JsonResponse
    {
        return response()->json([
            'status' => $document->hasCurrentCachedPdf() ? 'ready' : 'pending',
        ]);
    }
}
