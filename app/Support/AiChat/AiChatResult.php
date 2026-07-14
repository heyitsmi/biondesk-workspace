<?php

namespace App\Support\AiChat;

/**
 * The normalized result of one provider round-trip.
 */
final readonly class AiChatResult
{
    /**
     * @param  list<AiChatToolCall>  $toolCalls  Empty when the model answered with plain text instead of calling a tool.
     * @param  'stop'|'tool_calls'|'length'|'other'  $finishReason
     */
    public function __construct(
        public ?string $content,
        public array $toolCalls,
        public int $inputTokens,
        public int $outputTokens,
        public string $finishReason,
    ) {}

    /**
     * Determine whether the model wants one or more tools called before it can answer.
     */
    public function requestedToolCalls(): bool
    {
        return $this->toolCalls !== [];
    }
}
