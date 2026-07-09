<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationsController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $quotations = $team->documents()
            ->where('type', DocumentType::Quote)
            ->with(['contact', 'project', 'items'])
            ->get();

        return Inertia::render('quotations/index', [
            'quotations' => $quotations->map(fn (Document $document) => $document->toQuotationListItem())->all(),
        ]);
    }
}
