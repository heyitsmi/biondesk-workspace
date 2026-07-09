<?php

namespace App\Http\Controllers;

use App\Enums\OpportunityStage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunitiesController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $opportunities = $team->opportunities()->with(['contact', 'project'])->latest()->get();

        $openCount = $opportunities->whereNotIn('stage', [OpportunityStage::Won, OpportunityStage::Lost])->count();
        $wonCount = $opportunities->where('stage', OpportunityStage::Won)->count();
        $decidedCount = $opportunities->whereIn('stage', [OpportunityStage::Won, OpportunityStage::Lost])->count();

        return Inertia::render('opportunities/index', [
            'defaultView' => 'board',
            'summary' => [
                'openCount' => (string) $openCount,
                'winRate' => $decidedCount > 0 ? round($wonCount / $decidedCount * 100).'%' : '—',
                'averageValue' => $opportunities->count() > 0
                    ? '$'.number_format($opportunities->avg('amount_value') / 1000, 1).'k'
                    : '$0',
            ],
            'stages' => collect(OpportunityStage::cases())
                ->map(fn (OpportunityStage $stage) => [
                    'key' => $stage->value,
                    'label' => $stage->label(),
                    'tone' => $stage->tone(),
                ])
                ->all(),
            'opportunities' => $opportunities->map->toListItem()->all(),
        ]);
    }
}
