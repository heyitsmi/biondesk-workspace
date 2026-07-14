<?php

namespace App\Http\Controllers;

use App\Models\BionAiUsageLog;
use Inertia\Inertia;
use Inertia\Response;

class OpsAiUsageLogIndexController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        $logs = BionAiUsageLog::query()
            ->with(['team:id,name', 'user:id,name'])
            ->latest('created_at')
            ->paginate(25)
            ->through(fn (BionAiUsageLog $log) => [
                'id' => $log->id,
                'teamName' => $log->team?->name,
                'userName' => $log->user?->name,
                'provider' => $log->provider,
                'model' => $log->model,
                'inputTokens' => $log->input_tokens,
                'outputTokens' => $log->output_tokens,
                'costFormatted' => BionAiUsageLog::formatCost($log->estimated_cost_micros),
                'createdAt' => $log->created_at?->format('M j, Y H:i'),
            ])
            ->withQueryString();

        $totalCostMicros = (int) BionAiUsageLog::sum('estimated_cost_micros');
        $totalTokens = (int) BionAiUsageLog::sum('input_tokens') + (int) BionAiUsageLog::sum('output_tokens');

        return Inertia::render('ops/ai-usage-logs/index', [
            'logs' => $logs,
            'summary' => [
                'totalCostFormatted' => BionAiUsageLog::formatCost($totalCostMicros),
                'totalTokens' => $totalTokens,
            ],
        ]);
    }
}
