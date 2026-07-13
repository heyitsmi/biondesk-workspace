<?php

namespace App\Support\Calendar;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\EventColor;
use App\Enums\OpportunityStage;
use App\Enums\ProjectStatus;
use App\Models\Document;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\Team;
use Carbon\CarbonInterface;

class CalendarAggregator
{
    /**
     * Get read-only calendar entries for dates the app already tracks
     * elsewhere (invoice due dates, quote expiry, project deadlines,
     * opportunity expected close dates), within the given date range.
     *
     * Once a record's status moves to a closed state (paid/rejected,
     * accepted, completed/cancelled, won/lost) it stops appearing here on
     * the next load — this mirrors how DashboardSummary's stats/priority
     * actions already drop closed records, rather than keeping a "stale"
     * entry visible.
     *
     * @return array<int, array<string, mixed>>
     */
    public function build(Team $team, CarbonInterface $from, CarbonInterface $to): array
    {
        return [
            ...$this->invoiceDueDates($team, $from, $to),
            ...$this->quoteExpiries($team, $from, $to),
            ...$this->projectDeadlines($team, $from, $to),
            ...$this->opportunityCloseDates($team, $from, $to),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function invoiceDueDates(Team $team, CarbonInterface $from, CarbonInterface $to): array
    {
        return $team->documents()
            ->where('type', DocumentType::Invoice)
            ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
            ->whereNotNull('due_at')
            ->whereBetween('due_at', [$from, $to])
            ->get()
            ->map(fn (Document $invoice) => $this->entry(
                kind: 'invoice',
                id: $invoice->id,
                title: "Invoice {$invoice->number} due",
                date: $invoice->due_at,
                color: EventColor::Danger,
            ))
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function quoteExpiries(Team $team, CarbonInterface $from, CarbonInterface $to): array
    {
        return $team->documents()
            ->where('type', DocumentType::Quote)
            ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
            ->whereNotNull('valid_until')
            ->whereBetween('valid_until', [$from, $to])
            ->get()
            ->map(fn (Document $quote) => $this->entry(
                kind: 'quote',
                id: $quote->id,
                title: "Quote {$quote->number} expires",
                date: $quote->valid_until,
                color: EventColor::Accent,
            ))
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function projectDeadlines(Team $team, CarbonInterface $from, CarbonInterface $to): array
    {
        return $team->projects()
            ->whereNotIn('status', [ProjectStatus::Completed, ProjectStatus::Cancelled])
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [$from, $to])
            ->get()
            ->map(fn (Project $project) => $this->entry(
                kind: 'project',
                id: $project->id,
                title: "{$project->title} due",
                date: $project->due_date,
                color: EventColor::Info,
            ))
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function opportunityCloseDates(Team $team, CarbonInterface $from, CarbonInterface $to): array
    {
        return $team->opportunities()
            ->whereNotIn('stage', [OpportunityStage::Won, OpportunityStage::Lost])
            ->whereNotNull('close_date')
            ->whereBetween('close_date', [$from, $to])
            ->get()
            ->map(fn (Opportunity $opportunity) => $this->entry(
                kind: 'opportunity',
                id: $opportunity->id,
                title: "{$opportunity->title} — expected close",
                date: $opportunity->close_date,
                color: EventColor::Success,
            ))
            ->all();
    }

    /**
     * Get the common array shape used for every aggregated calendar entry.
     *
     * @return array<string, mixed>
     */
    private function entry(string $kind, int $id, string $title, CarbonInterface $date, EventColor $color): array
    {
        return [
            'id' => "{$kind}-{$id}",
            'title' => $title,
            'start' => $date->format('Y-m-d'),
            'allDay' => true,
            'editable' => false,
            'backgroundColor' => $color->hex(),
            'borderColor' => $color->hex(),
            'extendedProps' => [
                'kind' => $kind,
                'recordId' => $id,
            ],
        ];
    }
}
