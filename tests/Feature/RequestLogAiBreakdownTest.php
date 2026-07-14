<?php

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogStatus;
use App\Enums\TaskStatus;
use App\Models\BionAiUsageLog;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Http;

function aiBreakdownProject(Team $team): Project
{
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    return Project::factory()->for($team)->for($opportunity)->create();
}

function fakeOpenAiBreakdown(array $breakdown): void
{
    config([
        'services.openai.api_key' => 'test-key',
        'services.openai.embedding_api_key' => 'test-key',
        'services.openai.model' => 'gpt-4o-mini',
        'services.openai.embedding_model' => 'text-embedding-3-small',
        'services.openai.embedding_dimensions' => 3,
    ]);

    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode($breakdown),
                    ],
                    'finish_reason' => 'stop',
                ],
            ],
            'usage' => [
                'prompt_tokens' => 1200,
                'completion_tokens' => 300,
            ],
        ]),
        'https://api.openai.com/v1/embeddings' => Http::response([
            'data' => [
                [
                    'embedding' => [1.0, 0.0, 0.0],
                    'index' => 0,
                ],
            ],
            'model' => 'text-embedding-3-small',
            'usage' => [
                'prompt_tokens' => 12,
                'total_tokens' => 12,
            ],
        ]),
    ]);
}

function validBreakdown(array $overrides = []): array
{
    return [
        'classification' => 'new',
        'confidence' => 0.86,
        'summary' => 'Client wants a concise follow-up task.',
        'related_task_ids' => [],
        'duplicate_task_ids' => [],
        'proposed_tasks' => [
            [
                'title' => 'Review hero copy revision',
                'description' => 'Review and apply the requested hero copy revision.',
                'status' => 'todo',
                'tags' => ['Copy'],
                'source_reason' => 'Directly requested in the client thread.',
            ],
        ],
        'warnings' => [],
        ...$overrides,
    ];
}

test('ai breakdown endpoint rejects foreign team project request', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignProject = aiBreakdownProject($otherTeam);
    $foreignRequest = RequestLog::factory()->for($foreignProject)->create();

    $this->actingAs($user)
        ->postJson(route('projects.request-logs.ai-breakdown', [
            'current_team' => $team->slug,
            'project' => $foreignProject->id,
            'requestLog' => $foreignRequest->id,
        ]))
        ->assertNotFound();
});

test('fake duplicate ai response returns no proposed tasks and logs usage', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = aiBreakdownProject($team);
    $existingTask = Task::factory()->for($project)->create([
        'title' => 'Fix hero copy',
        'status' => TaskStatus::Todo,
    ]);
    $requestLog = RequestLog::factory()->for($project)->create([
        'text' => 'Please fix the hero copy.',
        'classification' => RequestLogClassification::New,
        'status' => RequestLogStatus::Submitted,
    ]);

    fakeOpenAiBreakdown(validBreakdown([
        'classification' => 'duplicate',
        'confidence' => 0.94,
        'summary' => 'This matches an existing hero copy task.',
        'duplicate_task_ids' => [$existingTask->id],
        'proposed_tasks' => [
            [
                'title' => 'Fix hero copy',
                'description' => 'Duplicate work.',
                'status' => 'todo',
                'tags' => ['Copy'],
                'source_reason' => 'The model should not keep this after normalization.',
            ],
        ],
    ]));

    $this->actingAs($user)
        ->postJson(route('projects.request-logs.ai-breakdown', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $requestLog->id,
        ]))
        ->assertOk()
        ->assertJsonPath('breakdown.classification', 'duplicate')
        ->assertJsonPath('breakdown.duplicate_task_ids.0', $existingTask->id)
        ->assertJsonPath('breakdown.proposed_tasks', []);

    $usageLog = BionAiUsageLog::query()
        ->where('model', 'gpt-4o-mini')
        ->sole();

    expect($usageLog->team_id)->toBe($team->id);
    expect($usageLog->user_id)->toBe($user->id);
    expect($usageLog->provider)->toBe('openai');
    expect($usageLog->input_tokens)->toBe(1200);
    expect($usageLog->output_tokens)->toBe(300);
});

test('fake related ai response returns only missing proposed tasks', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = aiBreakdownProject($team);
    $existingTask = Task::factory()->for($project)->create([
        'title' => 'Build campaign map card',
    ]);
    $requestLog = RequestLog::factory()->for($project)->create([
        'text' => 'Can we add map card rotation too?',
    ]);

    fakeOpenAiBreakdown(validBreakdown([
        'classification' => 'related',
        'related_task_ids' => [$existingTask->id],
        'proposed_tasks' => [
            [
                'title' => 'Add map rotation control',
                'description' => 'Add a control that rotates the campaign map without changing the card state.',
                'status' => 'todo',
                'tags' => ['Map', 'UI'],
                'source_reason' => 'Existing map card task does not cover rotation.',
            ],
        ],
    ]));

    $this->actingAs($user)
        ->postJson(route('projects.request-logs.ai-breakdown', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $requestLog->id,
        ]))
        ->assertOk()
        ->assertJsonPath('breakdown.classification', 'related')
        ->assertJsonPath('breakdown.related_task_ids.0', $existingTask->id)
        ->assertJsonPath('breakdown.proposed_tasks.0.title', 'Add map rotation control')
        ->assertJsonPath('breakdown.semantic_matches.0.id', $existingTask->id);
});

test('invalid ai schema is handled as an error without creating tasks', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = aiBreakdownProject($team);
    $requestLog = RequestLog::factory()->for($project)->create();

    fakeOpenAiBreakdown(['classification' => 'new']);

    $this->actingAs($user)
        ->postJson(route('projects.request-logs.ai-breakdown', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $requestLog->id,
        ]))
        ->assertUnprocessable()
        ->assertJsonStructure(['error']);

    expect(Task::count())->toBe(0);
});

test('selected task creation creates only selected tasks and preserves request relation activity', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = aiBreakdownProject($team);
    $requestLog = RequestLog::factory()->for($project)->create();

    $this->actingAs($user)
        ->post(route('projects.request-logs.ai-tasks.store', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $requestLog->id,
        ]), [
            'tasks' => [
                [
                    'title' => 'Add approval status badge',
                    'description' => 'Show approval status in the portal card.',
                    'status' => 'todo',
                    'tags' => ['Portal', 'UI'],
                    'source_reason' => 'Selected from AI preview.',
                ],
            ],
        ])
        ->assertRedirect()
        ->assertInertiaFlash('toast', [
            'type' => 'success',
            'message' => '1 task created from AI breakdown.',
        ]);

    $task = Task::sole();

    expect($task->request_log_id)->toBe($requestLog->id);
    expect($task->title)->toBe('Add approval status badge');
    expect($task->tags)->toBe(['Portal', 'UI']);
    expect($project->activitiesAsSubject()->where('description', 'AI breakdown tasks created from request log')->exists())->toBeTrue();
});

test('selected task creation is idempotent for repeated submissions', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = aiBreakdownProject($team);
    $requestLog = RequestLog::factory()->for($project)->create();
    $payload = [
        'tasks' => [
            [
                'title' => 'Prevent duplicate AI task creation',
                'description' => 'Disable duplicate task creation when the AI action is clicked repeatedly.',
                'status' => 'todo',
                'tags' => ['AI', 'Tasks'],
                'source_reason' => 'Repeated clicks should not create duplicate work.',
            ],
        ],
    ];
    $route = route('projects.request-logs.ai-tasks.store', [
        'current_team' => $team->slug,
        'project' => $project->id,
        'requestLog' => $requestLog->id,
    ]);

    $this->actingAs($user)->post($route, $payload)->assertRedirect();

    $this->actingAs($user)
        ->post($route, $payload)
        ->assertRedirect()
        ->assertInertiaFlash('toast', [
            'type' => 'success',
            'message' => 'Selected AI tasks were already created.',
        ]);

    expect(Task::query()
        ->where('request_log_id', $requestLog->id)
        ->where('title', 'Prevent duplicate AI task creation')
        ->count()
    )->toBe(1);
});
