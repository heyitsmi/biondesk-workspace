<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecurringInvoiceShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $template): Response
    {
        $team = $request->user()->currentTeam;
        $recurringInvoiceTemplate = $team->recurringInvoiceTemplates()
            ->with(['items', 'generatedInvoices.contact'])
            ->find($template);

        abort_if($recurringInvoiceTemplate === null, 404);

        return Inertia::render('invoices/recurring/show', [
            'template' => $recurringInvoiceTemplate->toDetailArray(),
        ]);
    }
}
