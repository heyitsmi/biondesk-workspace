<?php

namespace App\Http\Controllers;

use App\Http\Requests\MoveProjectRequest;
use Illuminate\Http\RedirectResponse;

class ProjectMoveController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MoveProjectRequest $request, string $current_team, int $project): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->projects()->findOrFail($project);
        $model->update($request->validated());

        return back();
    }
}
