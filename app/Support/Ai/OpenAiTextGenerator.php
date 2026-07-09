<?php

namespace App\Support\Ai;

use Illuminate\Support\Facades\Http;

class OpenAiTextGenerator implements AiTextGenerator
{
    public function __construct(
        protected ?string $apiKey,
        protected string $model,
        protected string $baseUrl = 'https://api.openai.com/v1',
        protected string $providerLabel = 'OpenAI',
    ) {}

    public function generate(string $systemPrompt, string $userPrompt): string
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            throw new AiGenerationException("{$this->providerLabel} API key is not configured.");
        }

        $response = Http::withToken($this->apiKey)
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);

        if ($response->failed()) {
            throw new AiGenerationException("AI provider request failed: {$response->status()}");
        }

        $content = $response->json('choices.0.message.content');

        if (! is_string($content) || $content === '') {
            throw new AiGenerationException('AI provider returned an empty response.');
        }

        return $content;
    }
}
