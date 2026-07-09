<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectDestroyController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $project): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->projects()->findOrFail($project);
        $model->delete();

        return to_route('projects.index', ['current_team' => $team->slug]);
    }
}
