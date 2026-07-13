<?php

namespace Database\Factories;

use App\Enums\BionAiMessageRole;
use App\Models\BionAiConversation;
use App\Models\BionAiMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BionAiMessage>
 */
class BionAiMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => BionAiConversation::factory(),
            'role' => BionAiMessageRole::User,
            'content' => fake()->sentence(),
            'tool_calls' => null,
            'tool_name' => null,
            'tool_call_id' => null,
        ];
    }
}
