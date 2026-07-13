<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateBionAiConversationRequest;
use Illuminate\Http\RedirectResponse;

class BionAiConversationRenameController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateBionAiConversationRequest $request, string $current_team, int $conversation): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->bionAiConversations()->where('user_id', $request->user()->id)->findOrFail($conversation);
        $model->update($request->validated());

        return back();
    }
}
