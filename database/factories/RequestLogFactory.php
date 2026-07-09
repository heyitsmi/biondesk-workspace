<?php

namespace Database\Factories;

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use App\Models\Project;
use App\Models\RequestLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RequestLog>
 */
class RequestLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'text' => fake()->sentence(10),
            'source' => fake()->randomElement(RequestLogSource::cases()),
            'classification' => fake()->randomElement(RequestLogClassification::cases()),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
