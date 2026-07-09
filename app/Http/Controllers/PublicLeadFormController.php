<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicLeadFormController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Team $team): Response
    {
        return Inertia::render('public/lead-form', [
            'team' => [
                'name' => $team->name,
                'slug' => $team->slug,
            ],
            'settings' => $team->leadFormSettings(),
            'turnstileSiteKey' => config('services.turnstile.site_key'),
        ]);
    }
}
