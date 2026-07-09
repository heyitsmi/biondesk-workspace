<?php

namespace App\Support\Dashboard;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\OpportunityStage;
use App\Enums\ProjectStatus;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Opportunity;
use App\Models\Payment;
use App\Models\ProfileAsset;
use App\Models\Project;
use App\Models\Team;
use Spatie\Activitylog\Enums\ActivityEvent;
use Spatie\Activitylog\Models\Activity;

class DashboardSummary
{
    /**
     * Get the full array shape used to render the dashboard page.
     *
     * @return array<string, mixed>
     */
    public function build(Team $team): array
    {
        return [
            'stats' => $this->stats($team),
            'priorityActions' => $this->priorityActions($team),
            'recentOpportunities' => $this->recentOpportunities($team),
            'activityFeed' => $this->activityFeed($team),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function stats(Team $team): array
    {
        $openOpportunitiesQuery = $team->opportunities()
            ->whereNotIn('stage', [OpportunityStage::Won->value, OpportunityStage::Lost->value]);

        $pipelineValue = (int) (clone $openOpportunitiesQuery)->sum('amount_value');
        $openOpportunityCount = (clone $openOpportunitiesQuery)->count();

        $openInvoices = $team->documents()
            ->where('type', DocumentType::Invoice->value)
            ->whereNotIn('status', [DocumentStatus::Draft->value, DocumentStatus::Rejected->value])
            ->with('payments')
            ->get();

        $toBeCollected = $openInvoices->sum(fn (Document $invoice) => $invoice->amountDueValue());
        $overdueCount = $openInvoices->filter(fn (Document $invoice) => $invoice->isOverdue())->count();

        $activeProjectsCount = $team->projects()
            ->whereNotIn('status', [ProjectStatus::Completed->value, ProjectStatus::Cancelled->value])
            ->count();
        $waitingOnClientCount = $team->projects()
            ->where('status', ProjectStatus::WaitingOnClient->value)
            ->count();

        $closedDeals = $team->opportunities()
            ->whereIn('stage', [OpportunityStage::Won->value, OpportunityStage::Lost->value])
            ->latest('updated_at')
            ->take(12)
            ->pluck('stage');
        $wonCount = $closedDeals->filter(fn (OpportunityStage $stage) => $stage === OpportunityStage::Won)->count();
        $winRate = $closedDeals->isEmpty() ? 0 : (int) round($wonCount / $closedDeals->count() * 100);

        return [
            [
                'label' => 'Pipeline Value',
                'value' => Document::money($pipelineValue),
                'change' => $openOpportunityCount === 1 ? '1 open opportunity' : "{$openOpportunityCount} open opportunities",
                'tone' => 'muted',
            ],
            [
                'label' => 'To Be Collected',
                'value' => Document::money($toBeCollected),
                'change' => $overdueCount === 0 ? 'All invoices up to date' : ($overdueCount === 1 ? '1 invoice overdue' : "{$overdueCount} invoices overdue"),
                'tone' => $overdueCount > 0 ? 'danger' : 'muted',
            ],
            [
                'label' => 'Active Projects',
                'value' => (string) $activeProjectsCount,
                'change' => $waitingOnClientCount === 1 ? '1 waiting on client' : "{$waitingOnClientCount} waiting on client",
                'tone' => 'muted',
            ],
            [
                'label' => 'Win Rate',
                'value' => "{$winRate}%",
                'change' => $closedDeals->isEmpty() ? 'No closed deals yet' : 'Based on last '.$closedDeals->count().' deals',
                'tone' => 'muted',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function priorityActions(Team $team): array
    {
        $candidates = collect();

        $overdueInvoices = $team->documents()
            ->where('type', DocumentType::Invoice->value)
            ->whereIn('status', [DocumentStatus::Sent->value, DocumentStatus::Viewed->value])
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->with(['payments', 'contact'])
            ->get();

        foreach ($overdueInvoices as $invoice) {
            $daysOverdue = (int) $invoice->due_at->diffInDays(now());

            $candidates->push([
                'title' => "Invoice {$invoice->number} is {$daysOverdue} days overdue",
                'company' => $invoice->clientName(),
                'amount' => Document::money($invoice->amountDueValue()),
                'actionLabel' => 'Send Reminder',
                'tone' => 'danger',
                'severity' => 1000 + $daysOverdue,
            ]);
        }

        $staleProjects = $team->projects()
            ->where('status', ProjectStatus::WaitingOnClient->value)
            ->where('updated_at', '<=', now()->subDays(3))
            ->with('opportunity.contact')
            ->get();

        foreach ($staleProjects as $project) {
            $daysStale = (int) $project->updated_at->diffInDays(now());

            $candidates->push([
                'title' => "{$project->title} waiting on client for {$daysStale} days",
                'company' => $project->clientName(),
                'amount' => $project->formattedBudget(),
                'actionLabel' => 'Nudge Client',
                'tone' => 'accent',
                'severity' => $daysStale,
            ]);
        }

        $staleOpportunities = $team->opportunities()
            ->whereNotIn('stage', [OpportunityStage::Won->value, OpportunityStage::Lost->value])
            ->where('updated_at', '<=', now()->subDays(5))
            ->with('contact')
            ->get();

        foreach ($staleOpportunities as $opportunity) {
            $daysStale = (int) $opportunity->updated_at->diffInDays(now());

            $candidates->push([
                'title' => "{$opportunity->title} lead has had no activity for {$daysStale} days",
                'company' => $opportunity->contact->company ?: $opportunity->contact->fullName(),
                'amount' => $opportunity->formattedAmount(),
                'actionLabel' => 'Follow Up',
                'tone' => 'accent',
                'severity' => $daysStale,
            ]);
        }

        return $candidates
            ->sortByDesc('severity')
            ->take(5)
            ->values()
            ->map(fn (array $action, int $index) => [
                'id' => $index + 1,
                'title' => $action['title'],
                'company' => $action['company'],
                'amount' => $action['amount'],
                'actionLabel' => $action['actionLabel'],
                'tone' => $action['tone'],
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentOpportunities(Team $team): array
    {
        return $team->opportunities()
            ->with('contact')
            ->latest('updated_at')
            ->take(4)
            ->get()
            ->map(fn (Opportunity $opportunity) => [
                'id' => $opportunity->id,
                'title' => $opportunity->title,
                'client' => $opportunity->contact->company ?: $opportunity->contact->fullName(),
                'amount' => $opportunity->formattedAmount(),
                'stageLabel' => $opportunity->stage->label(),
                'tone' => $opportunity->stage->tone(),
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function activityFeed(Team $team): array
    {
        $contactIds = $team->contacts()->pluck('id');
        $opportunityIds = $team->opportunities()->pluck('id');
        $projectIds = $team->projects()->pluck('id');
        $documentIds = $team->documents()->pluck('id');
        $profileAssetIds = $team->profileAssets()->pluck('id');
        $paymentIds = Payment::whereIn('document_id', $documentIds)->pluck('id');

        $activities = Activity::query()
            ->where(function ($query) use ($contactIds, $opportunityIds, $projectIds, $documentIds, $profileAssetIds, $paymentIds) {
                $query->where(fn ($q) => $q->where('subject_type', Contact::class)->whereIn('subject_id', $contactIds))
                    ->orWhere(fn ($q) => $q->where('subject_type', Opportunity::class)->whereIn('subject_id', $opportunityIds))
                    ->orWhere(fn ($q) => $q->where('subject_type', Project::class)->whereIn('subject_id', $projectIds))
                    ->orWhere(fn ($q) => $q->where('subject_type', Document::class)->whereIn('subject_id', $documentIds))
                    ->orWhere(fn ($q) => $q->where('subject_type', ProfileAsset::class)->whereIn('subject_id', $profileAssetIds))
                    ->orWhere(fn ($q) => $q->where('subject_type', Payment::class)->whereIn('subject_id', $paymentIds));
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->take(6)
            ->get();

        return $activities
            ->map(fn (Activity $activity) => [
                'title' => $activity->description,
                'when' => $activity->created_at?->diffForHumans() ?? '',
                'tone' => $this->activityTone($activity),
            ])
            ->all();
    }

    private function activityTone(Activity $activity): string
    {
        $customTone = $activity->getProperty('tone');

        if (is_string($customTone) && $customTone !== '') {
            return $customTone;
        }

        if ($activity->subject_type === Payment::class) {
            return 'success';
        }

        if ($activity->subject_type === Opportunity::class && $activity->event === ActivityEvent::Updated->value) {
            $newStage = data_get($activity->attribute_changes, 'attributes.stage');

            if ($newStage === OpportunityStage::Won->value) {
                return 'success';
            }

            if ($newStage === OpportunityStage::Lost->value) {
                return 'danger';
            }
        }

        return match ($activity->event) {
            ActivityEvent::Created->value => 'muted',
            ActivityEvent::Updated->value => 'accent',
            ActivityEvent::Deleted->value => 'danger',
            default => 'muted',
        };
    }
}
