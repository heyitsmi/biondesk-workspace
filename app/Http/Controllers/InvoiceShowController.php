<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        string $current_team,
        StubWorkspaceData $stubWorkspaceData,
        int $invoice,
    ): Response {
        $page = $stubWorkspaceData->invoiceDetail($request->user()->currentTeam, $invoice);

        abort_if($page === null, 404);

        return Inertia::render('invoices/show', $page);
    }
}
