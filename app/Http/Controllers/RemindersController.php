<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RemindersController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('reminders/index', $stubWorkspaceData->reminders($request->user()->currentTeam));
    }
}
