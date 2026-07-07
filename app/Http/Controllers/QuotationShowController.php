<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        string $current_team,
        StubWorkspaceData $stubWorkspaceData,
        int $quotation,
    ): Response {
        $page = $stubWorkspaceData->quotationDetail($request->user()->currentTeam, $quotation);

        abort_if($page === null, 404);

        return Inertia::render('quotations/show', $page);
    }
}
