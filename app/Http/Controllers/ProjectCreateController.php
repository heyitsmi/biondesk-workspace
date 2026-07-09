<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectCreateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $prefillOpportunityId = $request->integer('opportunity_id') ?: null;
        $prefillOpportunity = $prefillOpportunityId
            ? $team->opportunities()->find($prefillOpportunityId)
            : null;

        return Inertia::render('projects/create', [
            'stages' => collect(ProjectStatus::cases())
                ->map(fn (ProjectStatus $status) => [
                    'key' => $status->value,
                    'label' => $status->label(),
                    'tone' => $status->tone(),
                ])
                ->all(),
            'opportunities' => Opportunity::availableForProject($team),
            'defaults' => [
                'opportunityId' => $prefillOpportunity?->id ?: '',
                'title' => $prefillOpportunity->title ?? '',
                'status' => ProjectStatus::NotStarted->value,
                'startDate' => '',
                'dueDate' => '',
                'description' => '',
                'budgetValue' => '',
            ],
        ]);
    }
}
