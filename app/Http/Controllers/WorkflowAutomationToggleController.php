<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowAutomationToggleController extends Controller
{
    /**
     * Toggle a workflow automation active state.
     */
    public function __invoke(Request $request, string $current_team, int $automation): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $automationModel = $team->workflowAutomations()->findOrFail($automation);

        $automationModel->update(['is_active' => ! $automationModel->is_active]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $automationModel->is_active ? __('Automation enabled.') : __('Automation paused.'),
        ]);

        return back();
    }
}
