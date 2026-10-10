<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\BookingLink;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = now()->addDays(2)->setTime(10, 0);

        return [
            'booking_link_id' => BookingLink::factory(),
            'team_id' => fn (array $attributes): mixed => BookingLink::query()
                ->find($attributes['booking_link_id'])
                ?->team_id,
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->safeEmail(),
            'company' => fake()->optional()->company(),
            'notes' => fake()->optional()->sentence(),
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMinutes(30),
            'timezone' => 'Asia/Jakarta',
            'status' => BookingStatus::Scheduled,
        ];
    }
}
