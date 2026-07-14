<?php

namespace App\Support\AiChat;

class AiChatClientFactory
{
    /**
     * Build the configured AI chat client, based on `config('ai.provider')`.
     */
    public function make(): AiChatClient
    {
        return match (config('ai.provider')) {
            'anthropic' => new AnthropicChatClient(
                config('services.anthropic.api_key'),
                config('services.anthropic.model'),
            ),
            'deepseek' => new DeepSeekChatClient(
                config('services.deepseek.api_key'),
                config('services.deepseek.model'),
            ),
            default => new OpenAiChatClient(
                config('services.openai.api_key'),
                config('services.openai.model'),
            ),
        };
    }
}
