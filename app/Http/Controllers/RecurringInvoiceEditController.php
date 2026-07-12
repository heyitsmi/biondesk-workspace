<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecurringInvoiceEditController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $template): Response
    {
        $team = $request->user()->currentTeam;
        $recurringInvoiceTemplate = $team->recurringInvoiceTemplates()->with('items')->find($template);

        abort_if($recurringInvoiceTemplate === null, 404);

        return Inertia::render('invoices/recurring/edit', [
            'clients' => Contact::optionsFor($team),
            'projects' => Project::optionsFor($team),
            'template' => $recurringInvoiceTemplate->toDetailArray(),
        ]);
    }
}
