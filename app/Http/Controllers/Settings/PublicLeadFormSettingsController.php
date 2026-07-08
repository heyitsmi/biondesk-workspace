<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicLeadFormSettingsController extends Controller
{
    /**
     * Show the public lead form settings page.
     */
    public function edit(Request $request, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('settings/lead-form', [
            'settings' => $stubWorkspaceData->publicLeadFormSettings($request->user()->currentTeam),
        ]);
    }
}
