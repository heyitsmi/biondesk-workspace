<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
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
            'method' => fake()->randomElement(['Bank Transfer', 'Credit Card', 'Cash', 'Check']),
            'amount_value' => fake()->numberBetween(100, 5000),
            'paid_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
