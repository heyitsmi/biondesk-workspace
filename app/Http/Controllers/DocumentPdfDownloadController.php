<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentPdfDownloadController extends Controller
{
    /**
     * Handle the incoming request. Streams the cached PDF straight from
     * disk — no generation happens here, only in the queued job.
     */
    public function __invoke(Request $request, Document $document): BinaryFileResponse
    {
        $media = $document->getFirstMedia('pdf');

        abort_if($media === null || $media->getCustomProperty('content_hash') !== $document->contentHash(), 404);

        return response()->download($media->getPath(), $media->file_name);
    }
}
