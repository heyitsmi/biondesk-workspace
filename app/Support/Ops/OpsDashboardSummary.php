<?php

namespace App\Support\Ops;

use App\Models\BionAiUsageLog;
use App\Models\Team;
use App\Models\User;

class OpsDashboardSummary
{
    /**
     * Get the full array shape used to render the ops dashboard page.
     *
     * @return array<string, mixed>
     */
    public function build(): array
    {
        return [
            'stats' => $this->stats(),
            'recentSignups' => $this->recentSignups(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function stats(): array
    {
        $totalUsers = User::count();
        $totalTeams = Team::count();
        $signupsThisWeek = User::where('created_at', '>=', now()->subDays(7))->count();

        $costThisMonth = (int) BionAiUsageLog::where('created_at', '>=', now()->startOfMonth())
            ->sum('estimated_cost_micros');
        $costAllTime = (int) BionAiUsageLog::sum('estimated_cost_micros');

        return [
            [
                'label' => 'Total Users',
                'value' => (string) $totalUsers,
                'change' => $signupsThisWeek === 1 ? '1 new this week' : "{$signupsThisWeek} new this week",
                'tone' => 'muted',
            ],
            [
                'label' => 'Total Teams',
                'value' => (string) $totalTeams,
                'change' => '',
                'tone' => 'muted',
            ],
            [
                'label' => 'AI Cost (This Month)',
                'value' => BionAiUsageLog::formatCost($costThisMonth),
                'change' => 'All-time: '.BionAiUsageLog::formatCost($costAllTime),
                'tone' => 'muted',
            ],
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentSignups(): array
    {
        $users = array_values(User::query()->latest()->take(8)->get()->all());

        return array_map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'joinedAt' => $user->created_at?->diffForHumans(),
        ], $users);
    }
}
