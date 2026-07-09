<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Http\RedirectResponse;

class ProjectUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdateProjectRequest $request, string $current_team, int $project): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->projects()->findOrFail($project);
        $model->update($request->validated());

        return to_route('projects.show', ['current_team' => $team->slug, 'project' => $model->id]);
    }
}
