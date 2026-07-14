<?php

namespace Database\Factories;

use App\Enums\RequestLogMessageAuthorType;
use App\Models\RequestLog;
use App\Models\RequestLogMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RequestLogMessage>
 */
class RequestLogMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'request_log_id' => RequestLog::factory(),
            'author_type' => fake()->randomElement(RequestLogMessageAuthorType::cases()),
            'body' => fake()->paragraph(),
        ];
    }
}
