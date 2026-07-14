<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Freelance Tips',
                'meta_title' => 'Tips & Tricks for Freelancers | Biondesk',
                'meta_description' => 'Actionable advice, guides, and tips to help you succeed as a freelancer.',
            ],
            [
                'name' => 'Agency Growth',
                'meta_title' => 'Scaling Your Agency | Biondesk',
                'meta_description' => 'Strategies, tactics, and insights to help you grow and scale your creative or digital agency.',
            ],
            [
                'name' => 'Project Management',
                'meta_title' => 'Project Management Best Practices | Biondesk',
                'meta_description' => 'Learn how to manage projects efficiently, hit deadlines, and keep your clients happy.',
            ],
            [
                'name' => 'Invoicing & Payments',
                'meta_title' => 'Invoicing & Payment Guides | Biondesk',
                'meta_description' => 'Everything you need to know about getting paid on time, invoicing best practices, and managing cash flow.',
            ],
            [
                'name' => 'Proposals & Pitching',
                'meta_title' => 'Winning Proposals & Pitching | Biondesk',
                'meta_description' => 'Master the art of pitching clients and writing proposals that convert leads into paying customers.',
            ],
            [
                'name' => 'Client Relationships',
                'meta_title' => 'Managing Client Relationships | Biondesk',
                'meta_description' => 'Build long-lasting, profitable relationships with your clients through better communication and service.',
            ],
        ];

        foreach ($categories as $category) {
            BlogCategory::firstOrCreate(
                ['name' => $category['name']],
                [
                    'slug' => Str::slug($category['name']),
                    'meta_title' => $category['meta_title'],
                    'meta_description' => $category['meta_description'],
                ]
            );
        }
    }
}
