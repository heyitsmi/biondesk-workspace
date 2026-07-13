<?php

namespace App\Support\AiChat;

/**
 * A single tool invocation requested by the model in one turn.
 */
final readonly class AiChatToolCall
{
    /**
     * @param  array<string, mixed>  $arguments
     */
    public function __construct(
        public string $id,
        public string $name,
        public array $arguments,
    ) {}
}
