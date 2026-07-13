<?php

namespace App\Http\Controllers;

use App\Support\Ops\OpsDashboardSummary;
use Inertia\Inertia;
use Inertia\Response;

class OpsDashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(OpsDashboardSummary $summary): Response
    {
        return Inertia::render('ops/dashboard', $summary->build());
    }
}
