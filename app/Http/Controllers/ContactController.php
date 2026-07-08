<?php

namespace App\Http\Controllers;

use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Show the scaffolded contacts index page.
     */
    public function index(Request $request, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('contacts/index', $stubWorkspaceData->contacts($request->user()->currentTeam));
    }

    /**
     * Show the scaffolded new-contact page.
     */
    public function create(Request $request, StubWorkspaceData $stubWorkspaceData): Response
    {
        return Inertia::render('contacts/create', $stubWorkspaceData->contactCreateContext($request->user()->currentTeam));
    }

    /**
     * Show the scaffolded contact detail page.
     */
    public function show(
        Request $request,
        string $current_team,
        StubWorkspaceData $stubWorkspaceData,
        int $contact,
    ): Response {
        $page = $stubWorkspaceData->contactDetail($request->user()->currentTeam, $contact);

        abort_if($page === null, 404);

        return Inertia::render('contacts/show', $page);
    }

    /**
     * Show the scaffolded edit-contact page.
     */
    public function edit(
        Request $request,
        string $current_team,
        StubWorkspaceData $stubWorkspaceData,
        int $contact,
    ): Response {
        $page = $stubWorkspaceData->contactEditContext($request->user()->currentTeam, $contact);

        abort_if($page === null, 404);

        return Inertia::render('contacts/edit', $page);
    }
}
