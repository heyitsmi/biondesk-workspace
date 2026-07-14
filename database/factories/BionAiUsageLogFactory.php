<?php

namespace Database\Factories;

use App\Models\BionAiUsageLog;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BionAiUsageLog>
 */
class BionAiUsageLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $inputTokens = fake()->numberBetween(200, 2000);
        $outputTokens = fake()->numberBetween(10, 500);

        return [
            'team_id' => Team::factory(),
            'user_id' => User::factory(),
            'conversation_id' => null,
            'provider' => 'openai',
            'model' => 'gpt-4o-mini',
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
            'estimated_cost_micros' => (int) round($inputTokens * 0.15 + $outputTokens * 0.6),
        ];
    }
}
