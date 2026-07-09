<?php

namespace Database\Factories;

use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
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
            'title' => fake()->sentence(4),
            'status' => fake()->randomElement(TaskStatus::cases()),
            'description' => fake()->optional()->paragraph(),
            'tags' => fake()->optional()->randomElements(['Research', 'Design', 'Dev', 'QA'], fake()->numberBetween(0, 2)),
        ];
    }
}
