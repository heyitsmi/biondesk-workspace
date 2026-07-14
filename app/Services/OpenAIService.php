<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected string $apiKey;

    /**
     * @var array{provider: string, model: string, input_tokens: int, output_tokens: int}|null
     */
    private ?array $lastArticleUsage = null;

    /**
     * @var array{provider: string, model: string, input_tokens: int, output_tokens: int}|null
     */
    private ?array $lastImageUsage = null;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
    }

    /**
     * The model is instructed to always include every key, but the response
     * is unvalidated LLM-generated JSON, so `image_prompt` is typed optional
     * to keep the caller's defensive fallback honest.
     *
     * @return array{title: string, meta_title: string, meta_description: string, description: string, content: string, image_prompt?: string}
     */
    public function generateArticle(string $categoryName): array
    {
        $prompt = "You are an expert SEO content strategist and a professional human content writer for a B2B SaaS named Biondesk. Biondesk is a comprehensive workspace for freelancers and small agencies (managing leads, projects, tasks, proposals, invoices, and payments).

Please write a highly optimized, long-form blog post for the category: '{$categoryName}'.

CRITICAL REQUIREMENTS:
- Word Count: The article MUST be at least 1,500 words (aim for 1,800-2,200 words). Short articles are unacceptable.
- Human-like Tone: Write like a seasoned industry professional with real-world experience. Avoid AI clichés like 'In conclusion', 'In today's fast-paced world', 'It's important to note', 'game-changer', 'leverage', or robotic transitions. Use natural, direct, conversational language.
- Depth & Value: Go beyond surface-level advice. Include specific, actionable tactics, real-world scenarios, nuanced insights, and practical examples. The reader should finish the article feeling they've learned something they couldn't get from a generic listicle.
- Structure: Use a compelling opening that hooks the reader immediately (no slow build-ups). Break content into logical sections with descriptive H2 and H3 headings. Use bulleted/numbered lists, short paragraphs, and occasional blockquotes for key insights.
- SEO: Naturally integrate semantically related keywords. Use proper HTML tags (h2, h3, p, ul, li, ol, strong, blockquote). Write a compelling meta title (max 60 chars) and meta description (max 155 chars).
- GEO & AEO: Start with a concise, direct answer to the most common reader question on this topic (featured snippet format). Use factual, authoritative language.

The output MUST be a valid JSON object with EXACTLY these keys (raw JSON only, no markdown code blocks):
{
    \"title\": \"The SEO-optimized title\",
    \"meta_title\": \"Meta title for SEO\",
    \"meta_description\": \"Meta description (max 160 chars)\",
    \"description\": \"A short 1-2 sentence excerpt\",
    \"content\": \"The full blog article in semantic HTML format (without the <h1> title, just use <h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.)\",
    \"image_prompt\": \"A highly specific and unique DALL-E image prompt tailored to the exact topic and key insight of this article. It MUST describe the scene in vivid, concrete detail — including the subject, setting, mood, colors, and style. Style should be photorealistic editorial photography or clean modern illustration. Do NOT use generic descriptions like 'SaaS dashboard' or 'flat vector illustration'. Example: 'A focused freelancer reviewing a professional invoice on a laptop at a minimalist wooden desk, warm morning light, shallow depth of field, editorial photography style'.\"
}";

        $model = config('services.openai.model', 'gpt-4o');
        $response = Http::withToken($this->apiKey)
            ->timeout(120)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a professional content writer. Output strictly valid JSON only. Never truncate. Write full, complete long-form articles.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.8,
                'max_tokens' => 6000,
            ]);

        if ($response->failed()) {
            throw new \Exception('OpenAI API Error: '.$response->body());
        }

        $this->lastArticleUsage = $this->usageFromResponse($response, $model);

        return json_decode($response->json('choices.0.message.content'), true);
    }

    /**
     * Generate an image using gpt-image-1 and return the path to a temporary file.
     */
    public function generateImage(string $prompt): string
    {
        $model = 'gpt-image-1';
        $response = Http::withToken($this->apiKey)
            ->timeout(120)
            ->post('https://api.openai.com/v1/images/generations', [
                'model' => $model,
                'prompt' => $prompt,
                'n' => 1,
                'size' => '1536x1024',
                'quality' => 'medium',
            ]);

        if ($response->failed()) {
            Log::error('gpt-image-1 API Error: '.$response->body());
            throw new \RuntimeException('Image generation failed: '.$response->json('error.message', 'Unknown error'));
        }

        $b64 = $response->json('data.0.b64_json');

        if (! $b64) {
            Log::error('gpt-image-1 empty response: '.$response->body());
            throw new \RuntimeException('Image generation returned empty data.');
        }

        $this->lastImageUsage = $this->usageFromResponse($response, $model);

        // Decode and write to a temp file so MediaLibrary can ingest it.
        $tmpPath = tempnam(sys_get_temp_dir(), 'blog_img_').'.webp';
        file_put_contents($tmpPath, base64_decode($b64));

        return $tmpPath;
    }

    /**
     * Get token usage for the last generated article.
     *
     * @return array{provider: string, model: string, input_tokens: int, output_tokens: int}|null
     */
    public function lastArticleUsage(): ?array
    {
        return $this->lastArticleUsage;
    }

    /**
     * Get token usage for the last generated image.
     *
     * @return array{provider: string, model: string, input_tokens: int, output_tokens: int}|null
     */
    public function lastImageUsage(): ?array
    {
        return $this->lastImageUsage;
    }

    /**
     * @return array{provider: string, model: string, input_tokens: int, output_tokens: int}
     */
    private function usageFromResponse(Response $response, string $model): array
    {
        /** @var array<string, mixed> $usage */
        $usage = $response->json('usage', []);
        $inputTokens = (int) ($usage['prompt_tokens'] ?? $usage['input_tokens'] ?? 0);
        $outputTokens = (int) ($usage['completion_tokens'] ?? $usage['output_tokens'] ?? 0);
        $totalTokens = (int) ($usage['total_tokens'] ?? 0);

        if ($outputTokens === 0 && $totalTokens > $inputTokens) {
            $outputTokens = $totalTokens - $inputTokens;
        }

        return [
            'provider' => 'openai',
            'model' => $model,
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
        ];
    }
}
