<?php

use App\Models\BionAiUsageLog;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('super admins can view the paginated AI usage logs list', function () {
    $admin = User::factory()->superAdmin()->create();
    BionAiUsageLog::factory()->count(2)->create();

    $this->actingAs($admin)
        ->get('/ops/ai-usage-logs')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ops/ai-usage-logs/index')
            ->has('logs.data', 2)
            ->has('summary.totalCostFormatted')
            ->has('summary.totalTokens'),
        );
});

test('cost is formatted from micros to a readable dollar amount', function () {
    $admin = User::factory()->superAdmin()->create();
    BionAiUsageLog::factory()->create([
        'input_tokens' => 500,
        'output_tokens' => 20,
        'estimated_cost_micros' => 87,
    ]);

    $this->actingAs($admin)
        ->get('/ops/ai-usage-logs')
        ->assertInertia(fn (Assert $page) => $page
            ->where('logs.data.0.costFormatted', '$0.0001'),
        );
});
