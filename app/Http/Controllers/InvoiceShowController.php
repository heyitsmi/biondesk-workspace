<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $invoice): Response
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Invoice)->with(['contact', 'project', 'items'])->find($invoice);

        abort_if($document === null, 404);

        return Inertia::render('invoices/show', [
            'invoice' => $document->toInvoiceDetailArray(),
        ]);
    }
}
