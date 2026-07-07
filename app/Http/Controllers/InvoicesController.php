<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoicesController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('invoices/index', $stubWorkspaceData->invoices($request->user()->currentTeam));
    }
}
