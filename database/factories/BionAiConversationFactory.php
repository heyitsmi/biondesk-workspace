<?php

namespace Database\Factories;

use App\Models\BionAiConversation;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BionAiConversation>
 */
class BionAiConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'user_id' => User::factory(),
            'title' => fake()->optional()->sentence(4),
        ];
    }
}
