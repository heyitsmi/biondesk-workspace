<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BionAiConversationStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $conversation = $team->bionAiConversations()->make();
        $conversation->user_id = $request->user()->id;
        $conversation->save();

        return to_route('bion-ai.show', ['current_team' => $team->slug, 'conversation' => $conversation->id]);
    }
}
