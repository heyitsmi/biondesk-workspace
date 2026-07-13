<?php

namespace App\Http\Controllers;

use App\Http\Requests\MoveRecurringInvoiceTemplateRequest;
use Illuminate\Http\RedirectResponse;

class RecurringInvoiceMoveController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MoveRecurringInvoiceTemplateRequest $request, string $current_team, int $template): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $recurringInvoiceTemplate = $team->recurringInvoiceTemplates()->findOrFail($template);

        $isActive = (bool) $request->validated('is_active');

        if ($isActive && ! $recurringInvoiceTemplate->is_active) {
            $recurringInvoiceTemplate->reactivate();
        } else {
            $recurringInvoiceTemplate->update(['is_active' => $isActive]);
        }

        return back();
    }
}
