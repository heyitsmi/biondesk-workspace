<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\RecurringInvoiceTemplate;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringInvoiceTemplate>
 */
class RecurringInvoiceTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d');

        return [
            'team_id' => Team::factory(),
            'contact_id' => Contact::factory(),
            'title' => fake()->words(3, true),
            'currency' => 'USD',
            'tax_percent' => fake()->randomElement([0, 0, 8, 10]),
            'notes' => fake()->optional()->sentence(),
            'interval_months' => fake()->randomElement([1, 1, 1, 3, 6, 12]),
            'due_days' => 14,
            'starts_at' => $startsAt,
            'ends_at' => null,
            'next_run_at' => $startsAt,
            'last_generated_at' => null,
            'occurrences_generated' => 0,
            'auto_send' => true,
            'is_active' => true,
        ];
    }
}
