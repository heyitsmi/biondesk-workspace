<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceCreateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('invoices/create', [
            'nextNumber' => Document::nextNumber($team, DocumentType::Invoice),
            'defaultIssuedAt' => now()->toDateString(),
            'defaultDueAt' => now()->addDays(14)->toDateString(),
            'clients' => Contact::optionsFor($team),
            'projects' => Project::optionsFor($team),
        ]);
    }
}
