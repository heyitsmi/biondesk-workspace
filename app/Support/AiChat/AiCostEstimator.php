<?php

namespace App\Support\AiChat;

class AiCostEstimator
{
    /**
     * Estimate the USD cost (in micros, i.e. millionths of a dollar) of a
     * provider round-trip, based on the hardcoded per-model rates in
     * config/ai_pricing.php. Micros rather than cents because a single chat
     * turn typically costs a small fraction of a cent, which would round to
     * 0 in an integer cents column.
     */
    public function estimateMicros(string $provider, string $model, int $inputTokens, int $outputTokens): int
    {
        /** @var array{input: float, output: float} $rates */
        $rates = config("ai_pricing.{$provider}.{$model}")
            ?? config("ai_pricing.{$provider}.default")
            ?? ['input' => 0.0, 'output' => 0.0];

        $dollars = ($inputTokens / 1_000_000 * $rates['input']) + ($outputTokens / 1_000_000 * $rates['output']);

        return (int) round($dollars * 1_000_000);
    }
}
