<?php

namespace Database\Factories;

use App\Models\RecurringInvoiceTemplate;
use App\Models\RecurringInvoiceTemplateItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringInvoiceTemplateItem>
 */
class RecurringInvoiceTemplateItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'recurring_invoice_template_id' => RecurringInvoiceTemplate::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'quantity' => fake()->numberBetween(1, 5),
            'unit_price_value' => fake()->numberBetween(50, 5000),
            'sort_order' => 0,
        ];
    }
}
