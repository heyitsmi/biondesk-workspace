<?php

namespace Database\Factories;

use App\Enums\EventColor;
use App\Models\Event;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('-1 week', '+2 weeks');

        return [
            'team_id' => Team::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'starts_at' => $startsAt,
            'ends_at' => (clone $startsAt)->modify('+1 hour'),
            'all_day' => false,
            'location' => fake()->optional()->city(),
            'color' => fake()->randomElement(EventColor::cases()),
            'recurrence' => null,
        ];
    }
}
