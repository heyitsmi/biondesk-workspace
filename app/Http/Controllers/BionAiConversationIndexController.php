<?php

namespace App\Http\Controllers;

use App\Enums\BionAiMessageRole;
use App\Models\BionAiConversation;
use App\Models\BionAiMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BionAiConversationIndexController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, ?int $conversation = null): Response
    {
        $team = $request->user()->currentTeam;

        $conversations = $team->bionAiConversations()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (BionAiConversation $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'updatedAt' => $item->updated_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        $active = $conversation !== null
            ? $team->bionAiConversations()->where('user_id', $request->user()->id)->findOrFail($conversation)
            : null;

        return Inertia::render('bion-ai/index', [
            'conversations' => $conversations,
            'activeConversationId' => $active?->id,
            'messages' => $active === null ? [] : $active->messages()
                ->orderBy('created_at')
                ->orderBy('id')
                ->get()
                ->reject(fn (BionAiMessage $message) => $message->role === BionAiMessageRole::Tool)
                ->map(fn (BionAiMessage $message) => $message->toChatArray())
                ->values()
                ->all(),
        ]);
    }
}
