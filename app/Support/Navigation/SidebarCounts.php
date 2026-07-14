<?php

namespace App\Support\Navigation;

use App\Enums\DocumentType;
use App\Models\ReminderJob;
use App\Models\Team;
use Illuminate\Database\Eloquent\Builder;

class SidebarCounts
{
    /**
     * Get the counts used by the authenticated app sidebar.
     *
     * @return array{
     *     opportunities: int,
     *     projects: int,
     *     proposals: int,
     *     quotations: int,
     *     invoices: int,
     *     contacts: int,
     *     reminders: int,
     *     automations: int,
     *     profileLibrary: int
     * }
     */
    public function forTeam(Team $team): array
    {
        $documentCounts = $team->documents()
            ->selectRaw('type, COUNT(*) as aggregate')
            ->groupBy('type')
            ->pluck('aggregate', 'type');

        return [
            'opportunities' => $team->opportunities()->count(),
            'projects' => $team->projects()->count(),
            'proposals' => (int) ($documentCounts[DocumentType::Proposal->value] ?? 0),
            'quotations' => (int) ($documentCounts[DocumentType::Quote->value] ?? 0),
            'invoices' => (int) ($documentCounts[DocumentType::Invoice->value] ?? 0),
            'contacts' => $team->contacts()->count(),
            'reminders' => ReminderJob::query()
                ->whereHas('document', fn (Builder $query) => $query->whereBelongsTo($team))
                ->count(),
            'automations' => $team->workflowAutomations()->count(),
            'profileLibrary' => $team->profileAssets()->count(),
        ];
    }
}
