<?php

use App\Enums\BionAiMessageRole;
use App\Enums\TeamRole;
use App\Jobs\RunBionAiChatTurnJob;
use App\Models\BionAiConversation;
use App\Models\BionAiMessage;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

test('posting a message creates a user message and dispatches the chat turn job', function () {
    Queue::fake();

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->postJson(route('bion-ai.messages.store', ['current_team' => $team->slug, 'conversation' => $conversation->id]), [
            'content' => 'What tasks are overdue?',
        ])
        ->assertOk()
        ->assertJson(['status' => 'queued']);

    $message = BionAiMessage::where('conversation_id', $conversation->id)->firstOrFail();
    expect($message->role)->toBe(BionAiMessageRole::User);
    expect($message->content)->toBe('What tasks are overdue?');

    Queue::assertPushed(RunBionAiChatTurnJob::class, fn ($job) => $job->conversationId === $conversation->id);
});

test('the status endpoint reports pending then ready', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);
    $conversation->messages()->create(['role' => BionAiMessageRole::User, 'content' => 'Hello']);

    $this->actingAs($user)
        ->getJson(route('bion-ai.messages.status', ['current_team' => $team->slug, 'conversation' => $conversation->id]))
        ->assertOk()
        ->assertJson(['status' => 'pending']);

    $conversation->messages()->create(['role' => BionAiMessageRole::Assistant, 'content' => 'Hi there!']);

    $this->actingAs($user)
        ->getJson(route('bion-ai.messages.status', ['current_team' => $team->slug, 'conversation' => $conversation->id]))
        ->assertOk()
        ->assertJson(['status' => 'ready']);
});

test('a user cannot post to or poll another user\'s conversation', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $otherUser = User::factory()->create();
    $team->members()->attach($otherUser, ['role' => TeamRole::Member->value]);

    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->postJson(route('bion-ai.messages.store', ['current_team' => $team->slug, 'conversation' => $conversation->id]), [
            'content' => 'Hello',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->getJson(route('bion-ai.messages.status', ['current_team' => $team->slug, 'conversation' => $conversation->id]))
        ->assertNotFound();
});
