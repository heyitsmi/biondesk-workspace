<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateRecurringInvoiceTemplateRequest;
use Illuminate\Http\RedirectResponse;

class RecurringInvoiceUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateRecurringInvoiceTemplateRequest $request, string $current_team, int $template): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $recurringInvoiceTemplate = $team->recurringInvoiceTemplates()->findOrFail($template);

        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        $recurringInvoiceTemplate->update($data);
        $recurringInvoiceTemplate->syncItems($items);

        return to_route('invoices.recurring.show', ['current_team' => $team->slug, 'template' => $recurringInvoiceTemplate->id]);
    }
}
