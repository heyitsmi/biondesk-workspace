<?php

use App\Enums\TeamRole;
use App\Models\BionAiConversation;
use App\Models\BionAiMessage;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a conversation can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('bion-ai.conversations.store', ['current_team' => $team->slug]))
        ->assertRedirect();

    $conversation = BionAiConversation::where('team_id', $team->id)->firstOrFail();
    expect($conversation->user_id)->toBe($user->id);
    expect($conversation->title)->toBeNull();
});

test('a conversation can be renamed', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->patch(route('bion-ai.conversations.update', ['current_team' => $team->slug, 'conversation' => $conversation->id]), [
            'title' => 'Renamed conversation',
        ])
        ->assertRedirect();

    expect($conversation->fresh()->title)->toBe('Renamed conversation');
});

test('deleting a conversation cascades its messages', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);
    BionAiMessage::factory()->for($conversation, 'conversation')->count(3)->create();

    $this->actingAs($user)
        ->delete(route('bion-ai.conversations.destroy', ['current_team' => $team->slug, 'conversation' => $conversation->id]))
        ->assertRedirect();

    expect(BionAiConversation::find($conversation->id))->toBeNull();
    expect(BionAiMessage::where('conversation_id', $conversation->id)->count())->toBe(0);
});

test('a user cannot view, rename, or destroy another user\'s conversation within the same team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $otherUser = User::factory()->create();
    $team->members()->attach($otherUser, ['role' => TeamRole::Member->value]);

    $conversation = BionAiConversation::factory()->for($team)->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->get(route('bion-ai.show', ['current_team' => $team->slug, 'conversation' => $conversation->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->patch(route('bion-ai.conversations.update', ['current_team' => $team->slug, 'conversation' => $conversation->id]), [
            'title' => 'Hijacked',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('bion-ai.conversations.destroy', ['current_team' => $team->slug, 'conversation' => $conversation->id]))
        ->assertNotFound();

    expect($conversation->fresh()->title)->not->toBe('Hijacked');
});

test('the index page lists the current user\'s conversations for the current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    BionAiConversation::factory()->for($team)->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('bion-ai.index', ['current_team' => $team->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('bion-ai/index')
            ->has('conversations', 1)
            ->where('activeConversationId', null)
            ->has('messages', 0),
        );
});
