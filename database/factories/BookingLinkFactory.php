<?php

namespace Database\Factories;

use App\Models\BookingLink;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BookingLink>
 */
class BookingLinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->randomElement(['Discovery Call', 'Strategy Session', 'Project Consultation']);

        return [
            'team_id' => Team::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'description' => fake()->sentence(),
            'is_active' => true,
            'duration_minutes' => 30,
            'buffer_before_minutes' => 0,
            'buffer_after_minutes' => 0,
            'timezone' => 'Asia/Jakarta',
            'availability' => BookingLink::defaultAvailability(),
            'min_notice_minutes' => 120,
            'max_days_ahead' => 14,
            'location' => 'Google Meet',
        ];
    }
}
