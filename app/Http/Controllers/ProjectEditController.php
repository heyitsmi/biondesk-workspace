<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectEditController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        string $current_team,
        StubWorkspaceData $stubWorkspaceData,
        int $project,
    ): Response {
        $page = $stubWorkspaceData->projectEditContext($request->user()->currentTeam, $project);

        abort_if($page === null, 404);

        return Inertia::render('projects/edit', $page);
    }
}
