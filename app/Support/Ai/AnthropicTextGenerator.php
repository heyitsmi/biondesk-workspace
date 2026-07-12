<?php

namespace App\Support\Ai;

use Illuminate\Support\Facades\Http;

class AnthropicTextGenerator implements AiTextGenerator
{
    public function __construct(
        protected ?string $apiKey,
        protected string $model,
    ) {}

    public function generate(string $systemPrompt, string $userPrompt): string
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            throw new AiGenerationException('Anthropic API key is not configured.');
        }

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => $this->model,
            'max_tokens' => 1024,
            'system' => $systemPrompt,
            'messages' => [
                ['role' => 'user', 'content' => $userPrompt],
            ],
        ]);

        if ($response->failed()) {
            throw new AiGenerationException("AI provider request failed: {$response->status()}");
        }

        $content = $response->json('content.0.text');

        if (! is_string($content) || $content === '') {
            throw new AiGenerationException('AI provider returned an empty response.');
        }

        return $content;
    }
}
