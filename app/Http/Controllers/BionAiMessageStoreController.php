<?php

namespace App\Http\Controllers;

use App\Enums\BionAiMessageRole;
use App\Http\Requests\StoreBionAiMessageRequest;
use App\Jobs\RunBionAiChatTurnJob;
use Illuminate\Http\JsonResponse;

class BionAiMessageStoreController extends Controller
{
    /**
     * Handle the incoming request. Appends the user's message and dispatches
     * a queued job to run the chat turn — tool-calling loops can take
     * multiple provider round-trips, so this never runs synchronously.
     */
    public function __invoke(StoreBionAiMessageRequest $request, string $current_team, int $conversation): JsonResponse
    {
        $team = $request->user()->currentTeam;
        $convo = $team->bionAiConversations()->where('user_id', $request->user()->id)->findOrFail($conversation);

        $convo->messages()->create([
            'role' => BionAiMessageRole::User,
            'content' => $request->validated('content'),
        ]);
        $convo->touch();

        RunBionAiChatTurnJob::dispatch($convo->id);

        return response()->json(['status' => 'queued']);
    }
}
