<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $quotation): Response
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Quote)->with(['contact', 'project', 'items'])->find($quotation);

        abort_if($document === null, 404);

        return Inertia::render('quotations/show', [
            'quotation' => $document->toQuotationDetailArray(),
        ]);
    }
}
