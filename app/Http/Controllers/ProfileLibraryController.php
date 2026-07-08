<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileLibraryController extends Controller
{
    /**
     * Show the scaffolded profile library index page.
     */
    public function index(Request $request, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('profiles/index', $stubWorkspaceData->profiles($request->user()->currentTeam));
    }

    /**
     * Show the scaffolded new-profile page.
     */
    public function create(Request $request, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('profiles/create', $stubWorkspaceData->profileCreateContext($request->user()->currentTeam));
    }

    /**
     * Show the scaffolded edit-profile page.
     */
    public function edit(
        Request $request,
        string $current_team,
        StubWorkspaceData $stubWorkspaceData,
        int $profile,
    ): Response {
        $page = $stubWorkspaceData->profileEditContext($request->user()->currentTeam, $profile);

        abort_if($page === null, 404);

        return Inertia::render('profiles/edit', $page);
    }
}
