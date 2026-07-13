<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\RecurringInvoiceTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoicesController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $invoices = $team->documents()
            ->where('type', DocumentType::Invoice)
            ->with(['contact', 'project', 'items'])
            ->get();

        $recurringTemplates = $team->recurringInvoiceTemplates()
            ->with(['contact', 'items'])
            ->get();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices->map(fn (Document $document) => $document->toInvoiceListItem())->all(),
            'recurringTemplates' => $recurringTemplates->map(fn (RecurringInvoiceTemplate $template) => $template->toListItem())->all(),
        ]);
    }
}
