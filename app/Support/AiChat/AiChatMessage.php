<?php

namespace App\Support\AiChat;

use App\Enums\BionAiMessageRole;

/**
 * One turn of conversation history sent to (or received from) an AI provider,
 * decoupled from the BionAiMessage Eloquent model so this layer has no ORM
 * dependency.
 */
final readonly class AiChatMessage
{
    /**
     * @param  list<AiChatToolCall>  $toolCalls  Only present on assistant-role messages that called a tool.
     */
    public function __construct(
        public BionAiMessageRole $role,
        public ?string $content,
        public array $toolCalls = [],
        public ?string $toolName = null,
        public ?string $toolCallId = null,
    ) {}
}
