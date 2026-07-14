<?php

namespace App\Console\Commands;

use App\Models\BionAiUsageLog;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\Team;
use App\Models\User;
use App\Services\OpenAIService;
use App\Support\AiChat\AiCostEstimator;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateBlogContent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate SEO/GEO/AEO optimized blog content and thumbnail using OpenAI.';

    /**
     * Execute the console command.
     */
    public function handle(OpenAIService $openAIService, AiCostEstimator $costEstimator): int
    {
        $this->info('Starting blog generation process...');

        $category = BlogCategory::inRandomOrder()->first();
        if (! $category) {
            $this->error('No blog categories found. Please seed the categories first.');

            return self::FAILURE;
        }

        $author = User::with('currentTeam')->first();
        if (! $author) {
            $this->error('No users found. Please create a user first.');

            return self::FAILURE;
        }

        $team = $author->currentTeam ?? $author->teams()->first();
        if (! $team) {
            $this->error('No team found for the blog author. Please make sure the user belongs to a team.');

            return self::FAILURE;
        }

        $this->info("Generating article for category: {$category->name}...");

        try {
            $articleData = $openAIService->generateArticle($category->name);
            $this->logAiUsage($team, $author, $openAIService->lastArticleUsage(), $costEstimator);

            $this->info('Article generated successfully.');
            $this->info('Generating thumbnail image using gpt-image-1...');

            $imagePath = $openAIService->generateImage($articleData['image_prompt'] ?? "Editorial photography of a professional {$category->name} concept, modern workspace, natural lighting, high resolution.");
            $this->logAiUsage($team, $author, $openAIService->lastImageUsage(), $costEstimator);

            $this->info('Image generated successfully. Downloading and saving...');

            $slug = Str::slug($articleData['title']);
            // Ensure unique slug
            $originalSlug = $slug;
            $counter = 1;
            while (Blog::where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$counter;
                $counter++;
            }

            $blog = Blog::create([
                'user_id' => $author->id,
                'category_id' => $category->id,
                'title' => $articleData['title'],
                'slug' => $slug,
                'description' => $articleData['description'],
                'content' => $articleData['content'],
                'meta_title' => $articleData['meta_title'],
                'meta_description' => $articleData['meta_description'],
                'is_published' => true,
            ]);

            $blog->addMedia($imagePath)
                ->usingFileName(Str::slug($blog->title).'.webp')
                ->toMediaCollection('thumbnail');

            // Clean up the temp file
            @unlink($imagePath);

            $this->info("Blog '{$blog->title}' generated and published successfully!");

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error: '.$e->getMessage());

            return self::FAILURE;
        }
    }

    /**
     * @param  array{provider: string, model: string, input_tokens: int, output_tokens: int}|null  $usage
     */
    private function logAiUsage(Team $team, User $user, ?array $usage, AiCostEstimator $costEstimator): void
    {
        if (! $usage) {
            return;
        }

        BionAiUsageLog::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'conversation_id' => null,
            'provider' => $usage['provider'],
            'model' => $usage['model'],
            'input_tokens' => $usage['input_tokens'],
            'output_tokens' => $usage['output_tokens'],
            'estimated_cost_micros' => $costEstimator->estimateMicros(
                $usage['provider'],
                $usage['model'],
                $usage['input_tokens'],
                $usage['output_tokens'],
            ),
        ]);
    }
}
