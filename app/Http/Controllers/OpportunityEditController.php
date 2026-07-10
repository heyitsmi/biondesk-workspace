<?php

namespace App\Http\Controllers;

use App\Enums\OpportunityStage;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunityEditController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        string $current_team,
        int $opportunity,
    ): Response {
        $team = $request->user()->currentTeam;
        $model = $team->opportunities()->findOrFail($opportunity);

        return Inertia::render('opportunities/edit', [
            'stages' => collect(OpportunityStage::cases())
                ->map(fn (OpportunityStage $stage) => [
                    'key' => $stage->value,
                    'label' => $stage->label(),
                    'tone' => $stage->tone(),
                ])
                ->all(),
            'contacts' => Contact::optionsFor($team),
            'quickAddedContact' => $request->session()->get('quickAddedContact'),
            'opportunity' => [
                'id' => $model->id,
                'title' => $model->title,
                'contactId' => $model->contact_id,
                'amountValue' => (string) $model->amount_value,
                'stage' => $model->stage->value,
                'closeDate' => $model->close_date?->toDateString() ?? '',
                'priority' => $model->priority->value,
                'description' => $model->description ?? '',
            ],
        ]);
    }
}
