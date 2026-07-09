<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class DocumentPrintController extends Controller
{
    /**
     * Handle the incoming request. Renders a plain, action-free HTML page
     * for Browsershot to load and print to PDF.
     */
    public function __invoke(Request $request, Document $document): View
    {
        $document->load(['team', 'contact', 'items']);

        return view('documents.print', ['doc' => $document->toPublicArray()]);
    }
}
