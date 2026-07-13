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
    public function __invoke(Request $request, string $team): Response
    {
        $teamModel = Team::findByLeadFormSlug($team);

        return Inertia::render('public/lead-form', [
            'team' => [
                'name' => $teamModel->name,
                'slug' => $teamModel->slug,
                'leadFormSlug' => $teamModel->leadFormPublicSlug(),
            ],
            'settings' => $teamModel->leadFormSettings(),
            'turnstileSiteKey' => config('services.turnstile.site_key'),
        ]);
    }
}
