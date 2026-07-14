<?php

namespace App\Jobs;

use App\Enums\BionAiMessageRole;
use App\Models\BionAiConversation;
use App\Models\BionAiMessage;
use App\Models\BionAiUsageLog;
use App\Support\AiChat\AiChatClientFactory;
use App\Support\AiChat\AiChatException;
use App\Support\AiChat\AiChatMessage;
use App\Support\AiChat\AiChatResult;
use App\Support\AiChat\AiChatToolCall;
use App\Support\AiChat\AiCostEstimator;
use App\Support\AiChat\Tools\ToolRegistry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunBionAiChatTurnJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const MAX_TOOL_ROUNDS = 4;

    public function __construct(public int $conversationId) {}

    /**
     * Execute one BionAI chat turn: send the conversation history (plus
     * available tools) to the configured AI provider, execute any requested
     * tools, and loop until the model answers with plain text or the round
     * cap is hit.
     */
    public function handle(AiChatClientFactory $factory): void
    {
        $conversation = BionAiConversation::findOrFail($this->conversationId);

        $lastMessage = $conversation->messages()->orderByDesc('id')->first();

        if ($lastMessage?->role === BionAiMessageRole::Assistant && $lastMessage->tool_calls === null) {
            return;
        }

        $client = $factory->make();
        $registry = ToolRegistry::default();

        for ($round = 0; $round < self::MAX_TOOL_ROUNDS; $round++) {
            $history = $this->historyFor($conversation);

            try {
                $result = $client->send($this->systemPrompt(), $history, $registry->schemas());
            } catch (AiChatException $exception) {
                $conversation->messages()->create([
                    'role' => BionAiMessageRole::Assistant,
                    'content' => "Sorry, something went wrong talking to the AI provider: {$exception->getMessage()}",
                ]);

                return;
            }

            $this->logUsage($conversation, $result);

            if (! $result->requestedToolCalls()) {
                $conversation->messages()->create([
                    'role' => BionAiMessageRole::Assistant,
                    'content' => $result->content,
                ]);

                $this->maybeSetTitle($conversation);

                return;
            }

            $conversation->messages()->create([
                'role' => BionAiMessageRole::Assistant,
                'content' => $result->content,
                'tool_calls' => array_map(fn (AiChatToolCall $toolCall) => [
                    'id' => $toolCall->id,
                    'name' => $toolCall->name,
                    'arguments' => $toolCall->arguments,
                ], $result->toolCalls),
            ]);

            foreach ($result->toolCalls as $toolCall) {
                $output = $registry->call($toolCall->name, $toolCall->arguments, $conversation->team);

                $conversation->messages()->create([
                    'role' => BionAiMessageRole::Tool,
                    'content' => json_encode($output),
                    'tool_name' => $toolCall->name,
                    'tool_call_id' => $toolCall->id,
                ]);
            }
        }

        $conversation->messages()->create([
            'role' => BionAiMessageRole::Assistant,
            'content' => "I wasn't able to finish that request after several tool calls. Could you rephrase or narrow it down?",
        ]);
    }

    /**
     * @return list<AiChatMessage>
     */
    private function historyFor(BionAiConversation $conversation): array
    {
        $messages = array_values($conversation->messages()->orderBy('created_at')->orderBy('id')->get()->all());

        return array_map(fn (BionAiMessage $message) => new AiChatMessage(
            role: $message->role,
            content: $message->content,
            toolCalls: array_map(
                fn (array $toolCall) => new AiChatToolCall($toolCall['id'], $toolCall['name'], $toolCall['arguments']),
                $message->tool_calls ?? [],
            ),
            toolName: $message->tool_name,
            toolCallId: $message->tool_call_id,
        ), $messages);
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
            You are BionAI, a general-purpose assistant embedded in Biondesk, a
            freelancer/agency workspace (CRM, projects, invoices, calendar). You can
            answer any question. When the user asks about their own work — tasks,
            invoices, projects, opportunities, or schedule — use the available tools
            to look up real data instead of guessing.
            PROMPT;
    }

    private function logUsage(BionAiConversation $conversation, AiChatResult $result): void
    {
        $provider = config('ai.provider') ?: 'openai';
        $model = config("services.{$provider}.model");

        BionAiUsageLog::create([
            'team_id' => $conversation->team_id,
            'user_id' => $conversation->user_id,
            'conversation_id' => $conversation->id,
            'provider' => $provider,
            'model' => $model,
            'input_tokens' => $result->inputTokens,
            'output_tokens' => $result->outputTokens,
            'estimated_cost_micros' => app(AiCostEstimator::class)->estimateMicros(
                $provider,
                $model,
                $result->inputTokens,
                $result->outputTokens,
            ),
        ]);
    }

    private function maybeSetTitle(BionAiConversation $conversation): void
    {
        if ($conversation->title !== null) {
            return;
        }

        $firstUserMessage = $conversation->messages()
            ->where('role', BionAiMessageRole::User)
            ->orderBy('created_at')
            ->orderBy('id')
            ->value('content');

        if (is_string($firstUserMessage) && $firstUserMessage !== '') {
            $conversation->update(['title' => $conversation->deriveTitleFrom($firstUserMessage)]);
        }
    }
}
