<?php

namespace Database\Factories;

use App\Enums\ReminderJobType;
use App\Models\Document;
use App\Models\ReminderJob;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReminderJob>
 */
class ReminderJobFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'document_id' => Document::factory(),
            'type' => fake()->randomElement(ReminderJobType::cases()),
            'scheduled_at' => fake()->dateTimeBetween('-5 days', '+5 days'),
            'sent_at' => null,
            'dismissed_at' => null,
        ];
    }
}
