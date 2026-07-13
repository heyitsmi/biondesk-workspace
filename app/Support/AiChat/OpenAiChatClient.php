<?php

namespace App\Support\AiChat;

use App\Enums\BionAiMessageRole;
use App\Support\AiChat\Tools\ToolSchema;
use Illuminate\Support\Facades\Http;

class OpenAiChatClient implements AiChatClient
{
    public function __construct(
        protected ?string $apiKey,
        protected string $model,
        protected string $baseUrl = 'https://api.openai.com/v1',
        protected string $providerLabel = 'OpenAI',
    ) {}

    public function send(string $systemPrompt, array $messages, array $tools): AiChatResult
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            throw new AiChatException("{$this->providerLabel} API key is not configured.");
        }

        $response = Http::withToken($this->apiKey)
            ->post("{$this->baseUrl}/chat/completions", array_filter([
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ...$this->toOpenAiMessages($messages),
                ],
                'tools' => $tools === [] ? null : array_map(fn (ToolSchema $tool) => [
                    'type' => 'function',
                    'function' => [
                        'name' => $tool->name,
                        'description' => $tool->description,
                        'parameters' => $tool->parameters,
                    ],
                ], $tools),
            ], fn ($value) => $value !== null));

        if ($response->failed()) {
            throw new AiChatException("AI provider request failed: {$response->status()}");
        }

        /** @var array<string, mixed> $message */
        $message = (array) $response->json('choices.0.message', []);

        /** @var list<array<string, mixed>> $rawToolCalls */
        $rawToolCalls = (array) ($message['tool_calls'] ?? []);

        $toolCalls = array_map(fn (array $toolCall) => new AiChatToolCall(
            id: $toolCall['id'],
            name: $toolCall['function']['name'],
            arguments: json_decode($toolCall['function']['arguments'] ?? '{}', true) ?? [],
        ), $rawToolCalls);

        return new AiChatResult(
            content: $message['content'] ?? null,
            toolCalls: $toolCalls,
            inputTokens: (int) $response->json('usage.prompt_tokens', 0),
            outputTokens: (int) $response->json('usage.completion_tokens', 0),
            finishReason: match ($response->json('choices.0.finish_reason')) {
                'tool_calls' => 'tool_calls',
                'length' => 'length',
                'stop' => 'stop',
                default => 'other',
            },
        );
    }

    /**
     * @param  list<AiChatMessage>  $messages
     * @return list<array<string, mixed>>
     */
    private function toOpenAiMessages(array $messages): array
    {
        return array_map(function (AiChatMessage $message) {
            if ($message->role === BionAiMessageRole::Tool) {
                return [
                    'role' => 'tool',
                    'tool_call_id' => $message->toolCallId,
                    'content' => $message->content,
                ];
            }

            if ($message->role === BionAiMessageRole::Assistant && $message->toolCalls !== []) {
                return [
                    'role' => 'assistant',
                    'content' => $message->content,
                    'tool_calls' => array_map(fn (AiChatToolCall $toolCall) => [
                        'id' => $toolCall->id,
                        'type' => 'function',
                        'function' => [
                            'name' => $toolCall->name,
                            'arguments' => json_encode($toolCall->arguments),
                        ],
                    ], $message->toolCalls),
                ];
            }

            return [
                'role' => $message->role->value,
                'content' => $message->content,
            ];
        }, $messages);
    }
}
