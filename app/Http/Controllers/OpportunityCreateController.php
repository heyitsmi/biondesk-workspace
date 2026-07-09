<?php

namespace App\Http\Controllers;

use App\Enums\OpportunityPriority;
use App\Enums\OpportunityStage;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunityCreateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('opportunities/create', [
            'stages' => collect(OpportunityStage::cases())
                ->map(fn (OpportunityStage $stage) => [
                    'key' => $stage->value,
                    'label' => $stage->label(),
                    'tone' => $stage->tone(),
                ])
                ->all(),
            'contacts' => Contact::optionsFor($team),
            'defaults' => [
                'title' => '',
                'contactId' => '',
                'amountValue' => '',
                'stage' => OpportunityStage::Inbox->value,
                'closeDate' => '',
                'priority' => OpportunityPriority::Medium->value,
                'description' => '',
            ],
        ]);
    }
}
