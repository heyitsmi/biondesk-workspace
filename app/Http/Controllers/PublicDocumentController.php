<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Support\Biondesk\StubWorkspaceData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicDocumentController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        Team $team,
        StubWorkspaceData $stubWorkspaceData,
        string $document,
    ): Response {
        $page = $stubWorkspaceData->publicDocumentContext($team, $document);

        abort_if($page === null, 404);

        return Inertia::render('public/document', $page);
    }
}
