<?php

use App\Enums\BionAiMessageRole;
use App\Jobs\RunBionAiChatTurnJob;
use App\Models\BionAiConversation;
use App\Models\BionAiUsageLog;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('a plain-text reply persists the assistant message, logs usage once, and sets the title', function () {
    config(['ai.provider' => 'openai', 'services.openai.api_key' => 'test-key']);

    Http::fake([
        'api.openai.com/*' => Http::response([
            'choices' => [
                ['message' => ['content' => 'Sure, here is your answer.'], 'finish_reason' => 'stop'],
            ],
            'usage' => ['prompt_tokens' => 40, 'completion_tokens' => 12],
        ]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id, 'title' => null]);
    $conversation->messages()->create(['role' => BionAiMessageRole::User, 'content' => 'What is the capital of France?']);

    app()->call([new RunBionAiChatTurnJob($conversation->id), 'handle']);

    $final = $conversation->messages()->orderByDesc('id')->first();
    expect($final->role)->toBe(BionAiMessageRole::Assistant);
    expect($final->content)->toBe('Sure, here is your answer.');
    expect($final->tool_calls)->toBeNull();

    expect(BionAiUsageLog::where('conversation_id', $conversation->id)->count())->toBe(1);
    $log = BionAiUsageLog::where('conversation_id', $conversation->id)->firstOrFail();
    expect($log->input_tokens)->toBe(40);
    expect($log->output_tokens)->toBe(12);

    expect($conversation->fresh()->title)->toBe('What is the capital of France?');
});

test('a tool-calling turn executes the real tool, persists its output, and logs usage per round-trip', function () {
    config(['ai.provider' => 'openai', 'services.openai.api_key' => 'test-key']);

    Http::fake([
        'api.openai.com/*' => Http::sequence()
            ->push([
                'choices' => [[
                    'message' => [
                        'content' => null,
                        'tool_calls' => [[
                            'id' => 'call_1',
                            'type' => 'function',
                            'function' => ['name' => 'get_overdue_invoices', 'arguments' => '{}'],
                        ]],
                    ],
                    'finish_reason' => 'tool_calls',
                ]],
                'usage' => ['prompt_tokens' => 50, 'completion_tokens' => 15],
            ])
            ->push([
                'choices' => [
                    ['message' => ['content' => 'You have no overdue invoices.'], 'finish_reason' => 'stop'],
                ],
                'usage' => ['prompt_tokens' => 70, 'completion_tokens' => 8],
            ]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);
    $conversation->messages()->create(['role' => BionAiMessageRole::User, 'content' => 'Any overdue invoices?']);

    app()->call([new RunBionAiChatTurnJob($conversation->id), 'handle']);

    $toolMessage = $conversation->messages()->where('role', BionAiMessageRole::Tool)->firstOrFail();
    expect($toolMessage->tool_name)->toBe('get_overdue_invoices');
    expect($toolMessage->tool_call_id)->toBe('call_1');
    expect(json_decode((string) $toolMessage->content, true))->toHaveKey('invoices');

    $final = $conversation->messages()->orderByDesc('id')->first();
    expect($final->role)->toBe(BionAiMessageRole::Assistant);
    expect($final->content)->toBe('You have no overdue invoices.');

    expect(BionAiUsageLog::where('conversation_id', $conversation->id)->count())->toBe(2);
});

test('the loop stops after the max tool rounds and persists a fallback message', function () {
    config(['ai.provider' => 'openai', 'services.openai.api_key' => 'test-key']);

    Http::fake([
        'api.openai.com/*' => Http::response([
            'choices' => [[
                'message' => [
                    'content' => null,
                    'tool_calls' => [[
                        'id' => 'call_loop',
                        'type' => 'function',
                        'function' => ['name' => 'get_overdue_invoices', 'arguments' => '{}'],
                    ]],
                ],
                'finish_reason' => 'tool_calls',
            ]],
            'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 5],
        ]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);
    $conversation->messages()->create(['role' => BionAiMessageRole::User, 'content' => 'Keep looping']);

    app()->call([new RunBionAiChatTurnJob($conversation->id), 'handle']);

    $final = $conversation->messages()->orderByDesc('id')->first();
    expect($final->role)->toBe(BionAiMessageRole::Assistant);
    expect($final->tool_calls)->toBeNull();
    expect($final->content)->toContain("wasn't able to finish");

    expect(BionAiUsageLog::where('conversation_id', $conversation->id)->count())->toBe(4);
});

test('running the job twice with no new user message is a no-op the second time', function () {
    config(['ai.provider' => 'openai', 'services.openai.api_key' => 'test-key']);

    Http::fake([
        'api.openai.com/*' => Http::response([
            'choices' => [
                ['message' => ['content' => 'Done.'], 'finish_reason' => 'stop'],
            ],
            'usage' => ['prompt_tokens' => 5, 'completion_tokens' => 2],
        ]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);
    $conversation->messages()->create(['role' => BionAiMessageRole::User, 'content' => 'Hello']);

    app()->call([new RunBionAiChatTurnJob($conversation->id), 'handle']);
    app()->call([new RunBionAiChatTurnJob($conversation->id), 'handle']);

    Http::assertSentCount(1);
});

test('a provider failure is turned into a friendly assistant message, not an unhandled exception', function () {
    config(['ai.provider' => 'openai', 'services.openai.api_key' => 'test-key']);

    Http::fake([
        'api.openai.com/*' => Http::response([], 500),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);
    $conversation->messages()->create(['role' => BionAiMessageRole::User, 'content' => 'Hello']);

    app()->call([new RunBionAiChatTurnJob($conversation->id), 'handle']);

    $final = $conversation->messages()->orderByDesc('id')->first();
    expect($final->role)->toBe(BionAiMessageRole::Assistant);
    expect($final->content)->toContain('something went wrong');
});

test('anthropic: multiple tool calls in one turn are batched into a single user message with tool_result blocks', function () {
    config(['ai.provider' => 'anthropic', 'services.anthropic.api_key' => 'test-key']);

    Http::fake([
        'api.anthropic.com/*' => Http::sequence()
            ->push([
                'content' => [
                    ['type' => 'tool_use', 'id' => 'toolu_1', 'name' => 'get_overdue_invoices', 'input' => []],
                    ['type' => 'tool_use', 'id' => 'toolu_2', 'name' => 'get_pipeline_summary', 'input' => []],
                ],
                'stop_reason' => 'tool_use',
                'usage' => ['input_tokens' => 80, 'output_tokens' => 30],
            ])
            ->push([
                'content' => [['type' => 'text', 'text' => 'Here is your summary.']],
                'stop_reason' => 'end_turn',
                'usage' => ['input_tokens' => 90, 'output_tokens' => 10],
            ]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);
    $conversation->messages()->create(['role' => BionAiMessageRole::User, 'content' => 'Give me an overview']);

    app()->call([new RunBionAiChatTurnJob($conversation->id), 'handle']);

    $toolMessages = $conversation->messages()->where('role', BionAiMessageRole::Tool)->get();
    expect($toolMessages)->toHaveCount(2);

    Http::assertSent(function ($request) {
        $body = $request->data();
        $lastMessage = end($body['messages']);

        return $lastMessage['role'] === 'user'
            && is_array($lastMessage['content'])
            && count($lastMessage['content']) === 2
            && $lastMessage['content'][0]['type'] === 'tool_result';
    });

    $final = $conversation->messages()->orderByDesc('id')->first();
    expect($final->role)->toBe(BionAiMessageRole::Assistant);
    expect($final->content)->toBe('Here is your summary.');
});
