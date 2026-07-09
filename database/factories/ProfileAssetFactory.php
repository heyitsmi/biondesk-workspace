<?php

namespace Database\Factories;

use App\Enums\ProfileAssetCategory;
use App\Models\ProfileAsset;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProfileAsset>
 */
class ProfileAssetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'category' => fake()->randomElement(ProfileAssetCategory::cases()),
            'title' => fake()->sentence(4),
            'short_description' => fake()->sentence(12),
            'body' => fake()->paragraphs(2, true),
        ];
    }
}
