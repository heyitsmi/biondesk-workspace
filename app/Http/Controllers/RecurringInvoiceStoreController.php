<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecurringInvoiceTemplateRequest;
use Illuminate\Http\RedirectResponse;

class RecurringInvoiceStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreRecurringInvoiceTemplateRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        $data['next_run_at'] = $data['starts_at'];
        $data['occurrences_generated'] = 0;

        $template = $team->recurringInvoiceTemplates()->create($data);
        $template->syncItems($items);

        return to_route('invoices.recurring.show', ['current_team' => $team->slug, 'template' => $template->id]);
    }
}
