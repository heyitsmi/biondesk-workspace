<?php

namespace App\Support\AiChat\Tools;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\Team;

class GetProjectStatusSummaryTool implements Tool
{
    public function name(): string
    {
        return 'get_project_status_summary';
    }

    public function description(): string
    {
        return "Get a summary of the team's projects: counts by status, plus a list of projects that have been waiting on the client for 3 or more days.";
    }

    public function parameters(): array
    {
        return ['type' => 'object', 'properties' => new \stdClass, 'required' => []];
    }

    public function execute(Team $team, array $args): array
    {
        $counts = collect(ProjectStatus::cases())
            ->mapWithKeys(fn (ProjectStatus $status) => [
                $status->value => $team->projects()->where('status', $status)->count(),
            ]);

        $staleProjects = $team->projects()
            ->where('status', ProjectStatus::WaitingOnClient)
            ->where('updated_at', '<=', now()->subDays(3))
            ->with('opportunity.contact')
            ->get()
            ->map(fn (Project $project) => [
                'title' => $project->title,
                'client' => $project->clientName(),
                'daysWaiting' => (int) $project->updated_at->diffInDays(now()),
            ])
            ->values()
            ->all();

        return ['countsByStatus' => $counts->all(), 'staleWaitingOnClient' => $staleProjects];
    }
}
