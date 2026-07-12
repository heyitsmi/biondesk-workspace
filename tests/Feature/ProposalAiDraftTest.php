<?php

use App\Models\ProfileAsset;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('a proposal draft can be generated via the configured AI provider', function () {
    config(['ai.provider' => 'openai', 'services.openai.api_key' => 'test-key']);

    Http::fake([
        'api.openai.com/*' => Http::response([
            'choices' => [
                ['message' => ['content' => "Title: Homepage Redesign\n\nWe understand your goals and propose a phased redesign."]],
            ],
        ]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('proposals.ai-draft', ['current_team' => $team->slug]), [
            'brief' => 'We need a homepage redesign for our SaaS product.',
        ])
        ->assertOk()
        ->assertJson([
            'title' => 'Homepage Redesign',
            'content' => 'We understand your goals and propose a phased redesign.',
        ]);

    Http::assertSent(fn ($request) => $request->url() === 'https://api.openai.com/v1/chat/completions');
});

test('a proposal draft request without a brief returns an error payload', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('proposals.ai-draft', ['current_team' => $team->slug]), ['brief' => ''])
        ->assertOk()
        ->assertJson(['error' => 'A brief is required.']);
});

test('a proposal draft request returns an error payload when the provider key is missing', function () {
    config(['ai.provider' => 'openai', 'services.openai.api_key' => null]);

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('proposals.ai-draft', ['current_team' => $team->slug]), [
            'brief' => 'We need a homepage redesign.',
        ])
        ->assertOk()
        ->assertJson(['error' => 'OpenAI API key is not configured.']);
});

test('the profile library is included as context when generating a draft', function () {
    config(['ai.provider' => 'openai', 'services.openai.api_key' => 'test-key']);

    Http::fake([
        'api.openai.com/*' => Http::response([
            'choices' => [
                ['message' => ['content' => "Title: Homepage Redesign\n\nDraft content."]],
            ],
        ]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;
    ProfileAsset::factory()->for($team)->create([
        'title' => 'FinTech App Case Study',
        'category' => 'case',
        'short_description' => 'Reduced onboarding drop-off by 34%.',
    ]);

    $this->actingAs($user)
        ->post(route('proposals.ai-draft', ['current_team' => $team->slug]), [
            'brief' => 'We need a homepage redesign for our SaaS product.',
        ])
        ->assertOk();

    Http::assertSent(function ($request) {
        $systemMessage = collect($request->data()['messages'])->firstWhere('role', 'system');

        return str_contains($systemMessage['content'], 'FinTech App Case Study')
            && str_contains($systemMessage['content'], 'Reduced onboarding drop-off by 34%.');
    });
});

test('the anthropic provider can be selected via config', function () {
    config(['ai.provider' => 'anthropic', 'services.anthropic.api_key' => 'test-key']);

    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [
                ['text' => "Title: Mobile App MVP\n\nHere is our proposed approach for your MVP."],
            ],
        ]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('proposals.ai-draft', ['current_team' => $team->slug]), [
            'brief' => 'We need an MVP for our mobile app.',
        ])
        ->assertOk()
        ->assertJson([
            'title' => 'Mobile App MVP',
            'content' => 'Here is our proposed approach for your MVP.',
        ]);

    Http::assertSent(fn ($request) => $request->url() === 'https://api.anthropic.com/v1/messages');
});
