<?php

namespace App\Http\Controllers;

use App\Enums\BionAiMessageRole;
use App\Models\BionAiMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BionAiMessageStatusController extends Controller
{
    /**
     * Handle the incoming request. Polled by the frontend after posting a
     * message, to find out when the queued chat turn has finished.
     */
    public function __invoke(Request $request, string $current_team, int $conversation): JsonResponse
    {
        $team = $request->user()->currentTeam;
        $convo = $team->bionAiConversations()->where('user_id', $request->user()->id)->findOrFail($conversation);

        $last = $convo->messages()->orderByDesc('id')->first();
        $ready = $last !== null && $last->role === BionAiMessageRole::Assistant && $last->tool_calls === null;

        return response()->json([
            'status' => $ready ? 'ready' : 'pending',
            'messages' => $ready ? $convo->messages()
                ->orderBy('created_at')
                ->orderBy('id')
                ->get()
                ->reject(fn (BionAiMessage $message) => $message->role === BionAiMessageRole::Tool)
                ->map(fn (BionAiMessage $message) => $message->toChatArray())
                ->values()
                ->all() : null,
        ]);
    }
}
