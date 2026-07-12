<?php

namespace Database\Factories;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(DocumentType::cases());

        return [
            'team_id' => Team::factory(),
            'type' => $type,
            'contact_id' => Contact::factory(),
            'number' => $type->numberPrefix().'-'.fake()->unique()->numerify('####'),
            'title' => fake()->words(3, true),
            'status' => fake()->randomElement(DocumentStatus::cases()),
            'issued_at' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
            'valid_until' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'due_at' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'currency' => 'USD',
            'discount_percent' => fake()->randomElement([0, 0, 0, 5, 10]),
            'tax_percent' => fake()->randomElement([0, 0, 8, 10]),
            'content' => fake()->optional()->paragraphs(3, true),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Keep the "number" prefix in sync when a test overrides "type" via
     * ->state([...]), since definition() can't see state overrides.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (Document $document) {
            if (! str_starts_with($document->number, "{$document->type->numberPrefix()}-")) {
                $document->number = $document->type->numberPrefix().'-'.fake()->unique()->numerify('####');
            }
        });
    }
}
