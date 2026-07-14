<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BionAiConversationDestroyController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $conversation): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->bionAiConversations()->where('user_id', $request->user()->id)->findOrFail($conversation);
        $model->delete();

        return to_route('bion-ai.index', ['current_team' => $team->slug]);
    }
}
