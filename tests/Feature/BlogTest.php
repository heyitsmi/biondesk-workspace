<?php

use App\Models\BionAiUsageLog;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('blog index page loads', function () {
    $response = $this->get('/blog');
    $response->assertStatus(200);
});

test('blog show page loads for published blog', function () {
    $user = User::factory()->create();
    $category = BlogCategory::create(['name' => 'Tech', 'slug' => 'tech']);
    $blog = Blog::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Test Blog',
        'slug' => 'test-blog',
        'is_published' => true,
    ]);

    $response = $this->get('/blog/test-blog');
    $response->assertStatus(200);
});

test('blog show page returns 404 for draft blog', function () {
    $user = User::factory()->create();
    $category = BlogCategory::create(['name' => 'Tech', 'slug' => 'tech']);
    $blog = Blog::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Draft Blog',
        'slug' => 'draft-blog',
        'is_published' => false,
    ]);

    $response = $this->get('/blog/draft-blog');
    $response->assertStatus(404);
});

test('blog generator logs AI usage for article content and thumbnail generation', function () {
    config([
        'services.openai.api_key' => 'test-key',
        'services.openai.model' => 'gpt-4o-mini',
    ]);

    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [[
                'message' => [
                    'content' => json_encode([
                        'title' => 'A Better Client Workflow',
                        'meta_title' => 'A Better Client Workflow',
                        'meta_description' => 'A practical guide to client workflow.',
                        'description' => 'A short practical guide to client workflow.',
                        'content' => '<h2>Start with clarity</h2><p>Useful article content.</p>',
                        'image_prompt' => 'A focused freelancer organizing client work on a laptop.',
                    ]),
                ],
            ]],
            'usage' => ['prompt_tokens' => 120, 'completion_tokens' => 80],
        ]),
        'api.openai.com/v1/images/generations' => Http::response([
            'data' => [
                ['b64_json' => base64_encode('fake image bytes')],
            ],
            'usage' => ['input_tokens' => 45, 'output_tokens' => 15],
        ]),
    ]);

    $user = User::factory()->create();
    BlogCategory::create(['name' => 'Client Workflow', 'slug' => 'client-workflow']);

    $this->artisan('blog:generate')->assertSuccessful();

    expect(Blog::query()->count())->toBe(1);
    expect(BionAiUsageLog::query()->count())->toBe(2);

    $logs = BionAiUsageLog::query()->orderBy('id')->get();

    expect($logs[0])
        ->team_id->toBe($user->current_team_id)
        ->user_id->toBe($user->id)
        ->provider->toBe('openai')
        ->model->toBe('gpt-4o-mini')
        ->input_tokens->toBe(120)
        ->output_tokens->toBe(80);

    expect($logs[1])
        ->team_id->toBe($user->current_team_id)
        ->user_id->toBe($user->id)
        ->provider->toBe('openai')
        ->model->toBe('gpt-image-1')
        ->input_tokens->toBe(45)
        ->output_tokens->toBe(15);
});
