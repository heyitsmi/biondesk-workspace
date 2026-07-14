<?php

namespace App\Support\AiChat\Tools;

use App\Models\Team;
use App\Support\Calendar\CalendarAggregator;

class GetUpcomingDeadlinesTool implements Tool
{
    public function name(): string
    {
        return 'get_upcoming_deadlines';
    }

    public function description(): string
    {
        return 'Get upcoming deadlines the app already tracks: invoice due dates, quote expiries, project deadlines, and opportunity expected close dates, within a date range.';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'days_ahead' => [
                    'type' => 'integer',
                    'description' => 'How many days ahead to look, default 14, max 90.',
                ],
            ],
            'required' => [],
        ];
    }

    public function execute(Team $team, array $args): array
    {
        $daysAhead = (int) ($args['days_ahead'] ?? 14);
        $daysAhead = max(1, min(90, $daysAhead));

        $deadlines = collect((new CalendarAggregator)->build($team, now(), now()->addDays($daysAhead)))
            ->map(fn (array $item) => [
                'title' => $item['title'],
                'kind' => $item['extendedProps']['kind'],
                'date' => $item['start'],
            ])
            ->values()
            ->all();

        return ['deadlines' => $deadlines];
    }
}
