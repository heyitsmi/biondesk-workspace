<?php

namespace App\Http\Controllers;

use App\Support\Ai\AiGenerationException;
use App\Support\RequestLogs\RequestLogAiBreakdownService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestLogAiBreakdownController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        string $current_team,
        int $project,
        int $requestLog,
        RequestLogAiBreakdownService $breakdownService,
    ): JsonResponse {
        $team = $request->user()->currentTeam;
        $projectModel = $team->projects()
            ->with(['tasks', 'requestLogs.messages.user', 'requestLogs.messages.contact'])
            ->findOrFail($project);
        $requestLogModel = $projectModel->requestLogs()->findOrFail($requestLog);

        try {
            return response()->json([
                'breakdown' => $breakdownService->analyze($projectModel, $requestLogModel, $request->user()),
            ]);
        } catch (AiGenerationException $exception) {
            return response()->json(['error' => $exception->getMessage()], 422);
        }
    }
}
