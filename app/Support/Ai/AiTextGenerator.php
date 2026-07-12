<?php

namespace App\Support\Ai;

interface AiTextGenerator
{
    /**
     * Generate text from a system prompt (instructions) and a user prompt (the brief).
     *
     * @throws AiGenerationException when the provider is unconfigured or the request fails.
     */
    public function generate(string $systemPrompt, string $userPrompt): string;
}
