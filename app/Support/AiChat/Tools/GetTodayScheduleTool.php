<?php

namespace App\Support\AiChat\Tools;

use App\Models\Event;
use App\Models\Team;
use App\Support\Calendar\CalendarAggregator;

class GetTodayScheduleTool implements Tool
{
    public function name(): string
    {
        return 'get_today_schedule';
    }

    public function description(): string
    {
        return "Get everything on the team's calendar for today: real events and aggregated deadlines (invoice due, quote expiry, project deadline, opportunity close).";
    }

    public function parameters(): array
    {
        return ['type' => 'object', 'properties' => new \stdClass, 'required' => []];
    }

    public function execute(Team $team, array $args): array
    {
        $from = now()->startOfDay();
        $to = now()->endOfDay();

        $events = $team->events()
            ->where(fn ($query) => $query->whereBetween('starts_at', [$from, $to])->orWhereNotNull('recurrence'))
            ->get()
            ->map(fn (Event $event) => [
                'title' => $event->title,
                'startsAt' => $event->starts_at->format('Y-m-d H:i'),
                'allDay' => $event->all_day,
                'recurring' => $event->isRecurring(),
            ])
            ->values()
            ->all();

        $deadlines = collect((new CalendarAggregator)->build($team, $from, $to))
            ->map(fn (array $item) => [
                'title' => $item['title'],
                'kind' => $item['extendedProps']['kind'],
                'date' => $item['start'],
            ])
            ->values()
            ->all();

        return ['events' => $events, 'deadlines' => $deadlines];
    }
}
