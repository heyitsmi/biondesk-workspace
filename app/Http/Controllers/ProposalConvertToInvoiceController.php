<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProposalConvertToInvoiceController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $proposal): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Proposal)->findOrFail($proposal);
        $invoice = $document->duplicateAs(DocumentType::Invoice);

        return to_route('invoices.show', ['current_team' => $team->slug, 'invoice' => $invoice->id]);
    }
}
