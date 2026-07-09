<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicDocumentController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Document $document): Response
    {
        $document->load(['team', 'contact', 'items']);

        return Inertia::render('public/document', [
            'document' => $document->toPublicArray(),
        ]);
    }
}
