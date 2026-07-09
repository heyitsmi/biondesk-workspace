<?php

namespace App\Support\Ai;

class AiTextGeneratorFactory
{
    /**
     * Build the configured AI text generator, based on `config('ai.provider')`.
     */
    public function make(): AiTextGenerator
    {
        return match (config('ai.provider')) {
            'anthropic' => new AnthropicTextGenerator(
                config('services.anthropic.api_key'),
                config('services.anthropic.model'),
            ),
            'deepseek' => new DeepSeekTextGenerator(
                config('services.deepseek.api_key'),
                config('services.deepseek.model'),
            ),
            default => new OpenAiTextGenerator(
                config('services.openai.api_key'),
                config('services.openai.model'),
            ),
        };
    }
}
