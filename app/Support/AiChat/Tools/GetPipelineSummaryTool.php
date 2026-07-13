<?php

namespace App\Support\AiChat\Tools;

use App\Enums\OpportunityStage;
use App\Models\Document;
use App\Models\Team;

class GetPipelineSummaryTool implements Tool
{
    public function name(): string
    {
        return 'get_pipeline_summary';
    }

    public function description(): string
    {
        return "Get a summary of the team's sales pipeline: open opportunity count and total value, broken down by stage.";
    }

    public function parameters(): array
    {
        return ['type' => 'object', 'properties' => new \stdClass, 'required' => []];
    }

    public function execute(Team $team, array $args): array
    {
        $byStage = collect(OpportunityStage::cases())
            ->mapWithKeys(function (OpportunityStage $stage) use ($team) {
                $opportunities = $team->opportunities()->where('stage', $stage)->get();

                return [
                    $stage->value => [
                        'count' => $opportunities->count(),
                        'value' => Document::money((int) $opportunities->sum('amount_value')),
                    ],
                ];
            });

        return ['byStage' => $byStage->all()];
    }
}
