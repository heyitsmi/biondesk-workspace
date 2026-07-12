<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Http\Requests\StoreQuotationRequest;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;

class QuotationStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreQuotationRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        $data['type'] = DocumentType::Quote;
        $data['number'] = Document::nextNumber($team, DocumentType::Quote);

        $document = $team->documents()->create($data);
        $document->syncItems($items);

        return to_route('quotations.show', ['current_team' => $team->slug, 'quotation' => $document->id]);
    }
}
