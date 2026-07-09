<?php

namespace Database\Factories;

use App\Enums\OpportunityPriority;
use App\Enums\OpportunityStage;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Opportunity>
 */
class OpportunityFactory extends Factory
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
            'contact_id' => Contact::factory(),
            'title' => fake()->words(3, true),
            'stage' => fake()->randomElement(OpportunityStage::cases()),
            'source' => fake()->randomElement(['Upwork', 'Fiverr', 'Referral', 'LinkedIn', 'Direct']),
            'amount_value' => fake()->numberBetween(500, 20000),
            'priority' => fake()->randomElement(OpportunityPriority::cases()),
            'close_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'description' => fake()->optional()->paragraph(),
        ];
    }
}
