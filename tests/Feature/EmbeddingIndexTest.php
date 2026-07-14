<?php

use App\Enums\TaskStatus;
use App\Jobs\RefreshEmbeddingIndexEntry;
use App\Models\BionAiUsageLog;
use App\Models\Contact;
use App\Models\EmbeddingIndexEntry;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\Task;
use App\Models\User;
use App\Support\Embeddings\EmbeddingIndexService;
use App\Support\Embeddings\EmbeddingTextBuilder;
use App\Support\RequestLogs\RequestLogSemanticMatcher;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

function configureEmbeddingTest(): void
{
    config([
        'services.openai.embedding_api_key' => 'test-key',
        'services.openai.embedding_model' => 'text-embedding-3-small',
        'services.openai.embedding_dimensions' => 3,
    ]);
}

function embeddingProject(User $user): Project
{
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    return Project::factory()->for($team)->for($opportunity)->create();
}

test('embedding index refresh stores task embedding and logs usage', function () {
    configureEmbeddingTest();

    Http::fake([
        'https://api.openai.com/v1/embeddings' => Http::response([
            'data' => [
                ['embedding' => [0.0, 1.0, 0.0], 'index' => 0],
            ],
            'model' => 'text-embedding-3-small',
            'usage' => ['prompt_tokens' => 9, 'total_tokens' => 9],
        ]),
    ]);

    $user = User::factory()->create();
    $project = embeddingProject($user);
    $task = Task::factory()->for($project)->create([
        'title' => 'Fix checkout hero copy',
        'status' => TaskStatus::Todo,
    ]);

    app(EmbeddingIndexService::class)->refreshTask($task, $user);

    $entry = EmbeddingIndexEntry::sole();

    expect($entry->team_id)->toBe($project->team_id);
    expect($entry->project_id)->toBe($project->id);
    expect($entry->embeddable_type)->toBe(Task::class);
    expect($entry->embeddable_id)->toBe($task->id);
    expect($entry->embedding_model)->toBe('text-embedding-3-small');
    expect($entry->embedding_dimensions)->toBe(3);
    expect($entry->embedding)->toEqual([0.0, 1.0, 0.0]);
    expect($entry->embedded_at)->not->toBeNull();

    $usageLog = BionAiUsageLog::sole();
    expect($usageLog->team_id)->toBe($project->team_id);
    expect($usageLog->user_id)->toBe($user->id);
    expect($usageLog->model)->toBe('text-embedding-3-small');
    expect($usageLog->input_tokens)->toBe(9);
    expect($usageLog->output_tokens)->toBe(0);
});

test('semantic matcher orders project task candidates and excludes foreign project tasks', function () {
    configureEmbeddingTest();

    Http::fake([
        'https://api.openai.com/v1/embeddings' => Http::response([
            'data' => [
                ['embedding' => [1.0, 0.0, 0.0], 'index' => 0],
            ],
            'model' => 'text-embedding-3-small',
            'usage' => ['prompt_tokens' => 11, 'total_tokens' => 11],
        ]),
    ]);

    $user = User::factory()->create();
    $project = embeddingProject($user);
    $matchingTask = Task::factory()->for($project)->create([
        'title' => 'Add map rotation control',
        'description' => 'Let clients rotate the map view from the campaign card.',
        'status' => TaskStatus::Todo,
    ]);
    $distantTask = Task::factory()->for($project)->create([
        'title' => 'Rewrite invoice footer copy',
        'status' => TaskStatus::Todo,
    ]);
    $foreignProject = embeddingProject($user);
    $foreignTask = Task::factory()->for($foreignProject)->create([
        'title' => 'Add map rotation control',
    ]);
    $requestLog = RequestLog::factory()->for($project)->create([
        'text' => 'Can we rotate the campaign map?',
    ]);

    $builder = app(EmbeddingTextBuilder::class);

    foreach ([
        [$matchingTask, [1.0, 0.0, 0.0]],
        [$distantTask, [0.0, 1.0, 0.0]],
        [$foreignTask, [1.0, 0.0, 0.0]],
    ] as [$task, $embedding]) {
        $text = $builder->forTask($task);

        EmbeddingIndexEntry::create([
            'team_id' => $task->project->team_id,
            'project_id' => $task->project_id,
            'embeddable_type' => Task::class,
            'embeddable_id' => $task->id,
            'embedding_model' => 'text-embedding-3-small',
            'embedding_dimensions' => 3,
            'content_hash' => hash('sha256', $text),
            'embedded_text' => $text,
            'embedding' => $embedding,
            'metadata' => $builder->taskMetadata($task),
            'embedded_at' => now(),
        ]);
    }

    $matches = app(RequestLogSemanticMatcher::class)->taskMatches($project, $requestLog, $user);

    expect($matches)->toHaveCount(2);
    expect($matches[0]['id'])->toBe($matchingTask->id);
    expect($matches[0]['similarity'])->toBeGreaterThan($matches[1]['similarity']);
    expect(collect($matches)->pluck('id')->all())->not->toContain($foreignTask->id);
});

test('embedding index backfill command queues scoped task refresh jobs', function () {
    Queue::fake();

    $user = User::factory()->create();
    $project = embeddingProject($user);
    $task = Task::factory()->for($project)->create();
    $foreignProject = embeddingProject($user);
    Task::factory()->for($foreignProject)->create();

    $this->artisan('embedding-index:backfill', [
        '--project' => $project->id,
    ])->assertSuccessful();

    Queue::assertPushed(
        RefreshEmbeddingIndexEntry::class,
        fn (RefreshEmbeddingIndexEntry $job) => $job->embeddableType === Task::class
            && $job->embeddableId === $task->id,
    );
    Queue::assertPushed(RefreshEmbeddingIndexEntry::class, 1);
});
