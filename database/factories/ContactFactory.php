<?php

namespace Database\Factories;

use App\Enums\ContactStatus;
use App\Enums\ContactType;
use App\Models\Contact;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Contact>
 */
class ContactFactory extends Factory
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
            'type' => fake()->randomElement(ContactType::cases()),
            'status' => fake()->randomElement(ContactStatus::cases()),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'company' => fake()->company(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'role' => fake()->jobTitle(),
            'location' => fake()->city().', '.fake()->country(),
            'website' => fake()->url(),
            'notes' => fake()->optional()->paragraph(),
            'billing_address' => fake()->optional()->address(),
        ];
    }
}
