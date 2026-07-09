<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Http\Requests\StoreInvoiceRequest;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;

class InvoiceStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreInvoiceRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        $data['type'] = DocumentType::Invoice;
        $data['number'] = Document::nextNumber($team, DocumentType::Invoice);

        $document = $team->documents()->create($data);
        $document->syncItems($items);

        return to_route('invoices.show', ['current_team' => $team->slug, 'invoice' => $document->id]);
    }
}
