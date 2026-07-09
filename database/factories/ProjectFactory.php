<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
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
            'opportunity_id' => Opportunity::factory(),
            'title' => fake()->words(3, true),
            'status' => fake()->randomElement(ProjectStatus::cases()),
            'sort_order' => fake()->randomFloat(2, 0, 1000),
            'start_date' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
            'due_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'description' => fake()->optional()->paragraph(),
            'budget_value' => fake()->numberBetween(0, 20000),
        ];
    }
}
