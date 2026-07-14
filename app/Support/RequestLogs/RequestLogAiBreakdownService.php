<?php

namespace App\Support\RequestLogs;

use App\Enums\RequestLogClassification;
use App\Enums\TaskStatus;
use App\Models\BionAiUsageLog;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\RequestLogMessage;
use App\Models\Task;
use App\Models\User;
use App\Support\Ai\AiGenerationException;
use App\Support\AiChat\AiCostEstimator;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class RequestLogAiBreakdownService
{
    public function __construct(
        private readonly AiCostEstimator $costEstimator,
        private readonly RequestLogSemanticMatcher $semanticMatcher,
    ) {}

    /**
     * Generate a structured task breakdown preview for a request log.
     *
     * @return array{
     *     classification: string,
     *     confidence: float,
     *     summary: string,
     *     related_task_ids: list<int>,
     *     duplicate_task_ids: list<int>,
     *     proposed_tasks: list<array{title: string, description: string, status: string, tags: list<string>, source_reason: string}>,
     *     warnings: list<string>,
     *     semantic_matches: list<array{id: int, title: string, status: string, description: string, tags: list<string>, similarity: float}>
     * }
     */
    public function analyze(Project $project, RequestLog $requestLog, User $user): array
    {
        $model = config('services.openai.model', 'gpt-4o-mini');
        $apiKey = config('services.openai.api_key');

        if ($apiKey === null || $apiKey === '') {
            throw new AiGenerationException('OpenAI API key is not configured.');
        }

        $requestLog->loadMissing(['messages.user', 'messages.contact', 'media']);
        $project->loadMissing('tasks');
        $semanticMatches = $this->semanticMatches($project, $requestLog, $user);

        $response = Http::withToken($apiKey)
            ->timeout(90)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $this->systemPrompt()],
                    ['role' => 'user', 'content' => json_encode($this->contextFor($project, $requestLog, $semanticMatches), JSON_PRETTY_PRINT)],
                ],
                'response_format' => [
                    'type' => 'json_schema',
                    'json_schema' => [
                        'name' => 'request_log_task_breakdown',
                        'strict' => true,
                        'schema' => $this->schema(),
                    ],
                ],
                'temperature' => 0.1,
                'max_tokens' => 2200,
            ]);

        if ($response->failed()) {
            throw new AiGenerationException("AI provider request failed: {$response->status()}");
        }

        $this->logUsage($project, $user, $response, $model);

        $content = $response->json('choices.0.message.content');

        if (! is_string($content) || $content === '') {
            throw new AiGenerationException('AI provider returned an empty response.');
        }

        return [
            ...$this->normalize($content, $project),
            'semantic_matches' => $semanticMatches,
        ];
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
            You break down client request logs into project tasks for Biondesk.
            Compare the request against existing tasks before suggesting anything.

            Classification rules:
            - duplicate: use when the request is semantically equivalent to existing tasks. Do not propose tasks.
            - related: use when the request extends existing tasks. Propose only missing work.
            - contradiction: use when the request conflicts with existing tasks or earlier thread context. Prefer warnings over tasks.
            - new: use only when the work is not already represented by existing tasks.

            Hard rules:
            - Never suggest a proposed task that is semantically equivalent to an existing task.
            - Proposed tasks must be concrete, scoped, and directly traceable to this request.
            - Max 8 proposed tasks.
            - Use task status "todo" unless the request clearly belongs in backlog.
            - Return only data that fits the supplied JSON schema.
            PROMPT;
    }

    /**
     * @param  list<array{id: int, title: string, status: string, description: string, tags: list<string>, similarity: float}>  $semanticMatches
     * @return array<string, mixed>
     */
    private function contextFor(Project $project, RequestLog $requestLog, array $semanticMatches): array
    {
        $candidateTasks = $semanticMatches === []
            ? $project->tasks->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status->value,
                'description' => $task->description,
                'tags' => $task->tags ?? [],
            ])->values()->all()
            : $semanticMatches;

        return [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
            ],
            'request_log' => [
                'id' => $requestLog->id,
                'uuid' => $requestLog->uuid,
                'text' => $requestLog->text,
                'classification' => $requestLog->classification->value,
                'status' => $requestLog->status->value,
                'notes' => $requestLog->notes,
                'attachment_filenames' => $requestLog->getMedia('attachments')->pluck('file_name')->values()->all(),
                'messages' => $requestLog->messages->map(fn (RequestLogMessage $message) => [
                    'author_type' => $message->author_type->value,
                    'author' => $message->authorLabel(),
                    'body' => $message->body,
                    'attachment_filenames' => $message->getMedia('attachments')->pluck('file_name')->values()->all(),
                ])->values()->all(),
            ],
            'existing_tasks_source' => $semanticMatches === [] ? 'all_project_tasks_fallback' : 'semantic_embedding_top_matches',
            'existing_tasks' => $candidateTasks,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function schema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => [
                'classification',
                'confidence',
                'summary',
                'related_task_ids',
                'duplicate_task_ids',
                'proposed_tasks',
                'warnings',
            ],
            'properties' => [
                'classification' => [
                    'type' => 'string',
                    'enum' => array_map(fn (RequestLogClassification $classification) => $classification->value, RequestLogClassification::cases()),
                ],
                'confidence' => ['type' => 'number', 'minimum' => 0, 'maximum' => 1],
                'summary' => ['type' => 'string'],
                'related_task_ids' => [
                    'type' => 'array',
                    'items' => ['type' => 'integer'],
                ],
                'duplicate_task_ids' => [
                    'type' => 'array',
                    'items' => ['type' => 'integer'],
                ],
                'proposed_tasks' => [
                    'type' => 'array',
                    'maxItems' => 8,
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'required' => ['title', 'description', 'status', 'tags', 'source_reason'],
                        'properties' => [
                            'title' => ['type' => 'string'],
                            'description' => ['type' => 'string'],
                            'status' => [
                                'type' => 'string',
                                'enum' => array_map(fn (TaskStatus $status) => $status->value, TaskStatus::cases()),
                            ],
                            'tags' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                            ],
                            'source_reason' => ['type' => 'string'],
                        ],
                    ],
                ],
                'warnings' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
            ],
        ];
    }

    /**
     * @return array{
     *     classification: string,
     *     confidence: float,
     *     summary: string,
     *     related_task_ids: list<int>,
     *     duplicate_task_ids: list<int>,
     *     proposed_tasks: list<array{title: string, description: string, status: string, tags: list<string>, source_reason: string}>,
     *     warnings: list<string>
     * }
     */
    private function normalize(string $content, Project $project): array
    {
        $decoded = json_decode($content, true);

        if (! is_array($decoded)) {
            throw new AiGenerationException('AI provider returned invalid JSON.');
        }

        foreach (['classification', 'confidence', 'summary', 'related_task_ids', 'duplicate_task_ids', 'proposed_tasks', 'warnings'] as $key) {
            if (! array_key_exists($key, $decoded)) {
                throw new AiGenerationException('AI provider response did not match the expected schema.');
            }
        }

        $validTaskIds = $project->tasks->pluck('id')->map(fn (int $id) => $id)->all();
        $classification = RequestLogClassification::tryFrom((string) $decoded['classification']);

        if ($classification === null || ! is_numeric($decoded['confidence']) || ! is_string($decoded['summary'])) {
            throw new AiGenerationException('AI provider response did not match the expected schema.');
        }

        $proposedTasks = collect($decoded['proposed_tasks'])
            ->filter(fn (mixed $task) => is_array($task))
            ->take(8)
            ->map(function (array $task): array {
                $status = TaskStatus::tryFrom((string) ($task['status'] ?? '')) ?? TaskStatus::Todo;

                return [
                    'title' => Str::limit(trim((string) ($task['title'] ?? '')), 120, ''),
                    'description' => trim((string) ($task['description'] ?? '')),
                    'status' => $status->value,
                    'tags' => collect($task['tags'] ?? [])
                        ->filter(fn (mixed $tag) => is_string($tag) && trim($tag) !== '')
                        ->map(fn (string $tag) => Str::limit(trim($tag), 30, ''))
                        ->take(6)
                        ->values()
                        ->all(),
                    'source_reason' => trim((string) ($task['source_reason'] ?? '')),
                ];
            })
            ->filter(fn (array $task) => $task['title'] !== '')
            ->values()
            ->all();

        if (in_array($classification, [RequestLogClassification::Duplicate, RequestLogClassification::Contradiction], true)) {
            $proposedTasks = [];
        }

        return [
            'classification' => $classification->value,
            'confidence' => max(0, min(1, (float) $decoded['confidence'])),
            'summary' => trim($decoded['summary']),
            'related_task_ids' => $this->validIds($decoded['related_task_ids'], $validTaskIds),
            'duplicate_task_ids' => $this->validIds($decoded['duplicate_task_ids'], $validTaskIds),
            'proposed_tasks' => $proposedTasks,
            'warnings' => collect($decoded['warnings'])
                ->filter(fn (mixed $warning) => is_string($warning) && trim($warning) !== '')
                ->map(fn (string $warning) => trim($warning))
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  list<int>  $validTaskIds
     * @return list<int>
     */
    private function validIds(mixed $ids, array $validTaskIds): array
    {
        if (! is_array($ids)) {
            return [];
        }

        return collect($ids)
            ->filter(fn (mixed $id) => is_int($id) || ctype_digit((string) $id))
            ->map(fn (mixed $id) => (int) $id)
            ->filter(fn (int $id) => in_array($id, $validTaskIds, true))
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: int, title: string, status: string, description: string, tags: list<string>, similarity: float}>
     */
    private function semanticMatches(Project $project, RequestLog $requestLog, User $user): array
    {
        try {
            return $this->semanticMatcher->taskMatches($project, $requestLog, $user);
        } catch (AiGenerationException) {
            return [];
        }
    }

    private function logUsage(Project $project, User $user, Response $response, string $model): void
    {
        $inputTokens = (int) $response->json('usage.prompt_tokens', 0);
        $outputTokens = (int) $response->json('usage.completion_tokens', 0);

        BionAiUsageLog::create([
            'team_id' => $project->team_id,
            'user_id' => $user->id,
            'provider' => 'openai',
            'model' => $model,
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
            'estimated_cost_micros' => $this->costEstimator->estimateMicros('openai', $model, $inputTokens, $outputTokens),
        ]);
    }
}
