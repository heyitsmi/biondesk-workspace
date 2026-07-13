<?php

namespace App\Support\AiChat;

use App\Enums\BionAiMessageRole;
use App\Support\AiChat\Tools\ToolSchema;
use Illuminate\Support\Facades\Http;

class AnthropicChatClient implements AiChatClient
{
    public function __construct(
        protected ?string $apiKey,
        protected string $model,
    ) {}

    public function send(string $systemPrompt, array $messages, array $tools): AiChatResult
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            throw new AiChatException('Anthropic API key is not configured.');
        }

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', array_filter([
            'model' => $this->model,
            'max_tokens' => 4096,
            'system' => $systemPrompt,
            'messages' => $this->toAnthropicMessages($messages),
            'tools' => $tools === [] ? null : array_map(fn (ToolSchema $tool) => [
                'name' => $tool->name,
                'description' => $tool->description,
                'input_schema' => $tool->parameters,
            ], $tools),
        ], fn ($value) => $value !== null));

        if ($response->failed()) {
            throw new AiChatException("AI provider request failed: {$response->status()} - {$response->body()}");
        }

        /** @var list<array<string, mixed>> $blocks */
        $blocks = (array) $response->json('content', []);
        $textBlock = collect($blocks)->firstWhere('type', 'text');

        $toolCalls = array_map(
            fn (array $block) => new AiChatToolCall($block['id'], $block['name'], $block['input'] ?? []),
            array_values(array_filter($blocks, fn (array $block) => $block['type'] === 'tool_use')),
        );

        return new AiChatResult(
            content: $textBlock['text'] ?? null,
            toolCalls: $toolCalls,
            inputTokens: (int) $response->json('usage.input_tokens', 0),
            outputTokens: (int) $response->json('usage.output_tokens', 0),
            finishReason: match ($response->json('stop_reason')) {
                'tool_use' => 'tool_calls',
                'max_tokens' => 'length',
                'end_turn', 'stop_sequence' => 'stop',
                default => 'other',
            },
        );
    }

    /**
     * Translate internal conversation history into Anthropic's message
     * shape. Anthropic expects tool results as `tool_result` content blocks
     * inside a single `user` message, not a separate `role: tool` message —
     * consecutive tool-role entries (from one assistant turn that called
     * more than one tool) are buffered and flushed together.
     *
     * @param  list<AiChatMessage>  $messages
     * @return list<array<string, mixed>>
     */
    private function toAnthropicMessages(array $messages): array
    {
        $result = [];
        /** @var list<array<string, mixed>> $toolResultBuffer */
        $toolResultBuffer = [];

        foreach ($messages as $message) {
            if ($message->role === BionAiMessageRole::Tool) {
                $toolResultBuffer[] = [
                    'type' => 'tool_result',
                    'tool_use_id' => $message->toolCallId,
                    'content' => $message->content,
                ];

                continue;
            }

            if ($toolResultBuffer !== []) {
                $result[] = ['role' => 'user', 'content' => $toolResultBuffer];
                $toolResultBuffer = [];
            }

            if ($message->role === BionAiMessageRole::Assistant && $message->toolCalls !== []) {
                $result[] = [
                    'role' => 'assistant',
                    'content' => [
                        ...($message->content !== null ? [['type' => 'text', 'text' => $message->content]] : []),
                        ...array_map(fn (AiChatToolCall $toolCall) => [
                            'type' => 'tool_use',
                            'id' => $toolCall->id,
                            'name' => $toolCall->name,
                            'input' => (object) $toolCall->arguments,
                        ], $message->toolCalls),
                    ],
                ];

                continue;
            }

            $result[] = [
                'role' => $message->role === BionAiMessageRole::User ? 'user' : 'assistant',
                'content' => $message->content,
            ];
        }

        if ($toolResultBuffer !== []) {
            $result[] = ['role' => 'user', 'content' => $toolResultBuffer];
        }

        return $result;
    }
}
