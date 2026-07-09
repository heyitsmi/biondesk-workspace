<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Http\Requests\StoreProjectRequest;
use Illuminate\Http\RedirectResponse;

class ProjectStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreProjectRequest $request, string $current_team): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $data = $request->validated();
        $data['status'] ??= ProjectStatus::NotStarted->value;
        $data['sort_order'] = ($team->projects()->max('sort_order') ?? 0) + 1000;

        $project = $team->projects()->create($data);

        return to_route('projects.show', ['current_team' => $team->slug, 'project' => $project->id]);
    }
}
