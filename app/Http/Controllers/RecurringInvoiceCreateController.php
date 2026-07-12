<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecurringInvoiceCreateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('invoices/recurring/create', [
            'defaultStartsAt' => now()->toDateString(),
            'clients' => Contact::optionsFor($team),
            'projects' => Project::optionsFor($team),
        ]);
    }
}
