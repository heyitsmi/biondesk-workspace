<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Http\Requests\StorePaymentRequest;
use Illuminate\Http\RedirectResponse;

class PaymentStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StorePaymentRequest $request, string $current_team, int $invoice): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Invoice)->findOrFail($invoice);
        $document->payments()->create($request->validated());

        return to_route('invoices.show', ['current_team' => $team->slug, 'invoice' => $document->id]);
    }
}
