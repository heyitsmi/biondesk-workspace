<?php

namespace App\Support\Embeddings;

use App\Models\BionAiUsageLog;
use App\Models\Team;
use App\Models\User;
use App\Support\Ai\AiGenerationException;
use App\Support\AiChat\AiCostEstimator;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class OpenAIEmbeddingService
{
    /**
     * Create a new class instance.
     */
    public function __construct(private readonly AiCostEstimator $costEstimator) {}

    /**
     * @return array{embedding: list<float>, model: string, dimensions: int, input_tokens: int}
     */
    public function embed(string $input, Team $team, ?User $user = null): array
    {
        $apiKey = (string) config('services.openai.embedding_api_key', '');
        $model = (string) config('services.openai.embedding_model', 'text-embedding-3-small');
        $dimensions = (int) config('services.openai.embedding_dimensions', 1536);

        if ($apiKey === '') {
            throw new AiGenerationException('OpenAI embedding API key is not configured.');
        }

        $payload = [
            'model' => $model,
            'input' => $input,
            'encoding_format' => 'float',
        ];

        if ($dimensions > 0) {
            $payload['dimensions'] = $dimensions;
        }

        $response = Http::withToken($apiKey)
            ->timeout(60)
            ->post('https://api.openai.com/v1/embeddings', $payload);

        if ($response->failed()) {
            throw new AiGenerationException("Embedding provider request failed: {$response->status()}");
        }

        $embedding = $response->json('data.0.embedding');

        if (! is_array($embedding) || $embedding === []) {
            throw new AiGenerationException('Embedding provider returned an empty embedding.');
        }

        $vector = collect($embedding)
            ->filter(fn (mixed $value) => is_int($value) || is_float($value))
            ->map(fn (int|float $value) => (float) $value)
            ->values()
            ->all();

        if ($vector === []) {
            throw new AiGenerationException('Embedding provider returned an invalid embedding.');
        }

        $inputTokens = $this->inputTokens($response);

        BionAiUsageLog::create([
            'team_id' => $team->id,
            'user_id' => $user?->id,
            'provider' => 'openai',
            'model' => $model,
            'input_tokens' => $inputTokens,
            'output_tokens' => 0,
            'estimated_cost_micros' => $this->costEstimator->estimateMicros('openai', $model, $inputTokens, 0),
        ]);

        return [
            'embedding' => $vector,
            'model' => $model,
            'dimensions' => count($vector),
            'input_tokens' => $inputTokens,
        ];
    }

    private function inputTokens(Response $response): int
    {
        return (int) ($response->json('usage.prompt_tokens') ?? $response->json('usage.total_tokens') ?? 0);
    }
}
