<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkflowAutomationRequest;
use App\Http\Requests\UpdateWorkflowAutomationRequest;
use App\Models\WorkflowAutomationRun;
use App\Support\WorkflowAutomations\WorkflowAutomationTemplates;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkflowAutomationController extends Controller
{
    /**
     * Display the workflow automations page.
     */
    public function index(Request $request, WorkflowAutomationTemplates $templates): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('automations/index', [
            'automations' => $team->workflowAutomations()
                ->latest()
                ->get()
                ->map->toListArray()
                ->all(),
            'templates' => $templates->all(),
            'recentRuns' => WorkflowAutomationRun::query()
                ->whereBelongsTo($team)
                ->with('automation')
                ->latest('ran_at')
                ->take(10)
                ->get()
                ->map->toListArray()
                ->all(),
        ]);
    }

    /**
     * Show the form for creating a workflow automation.
     */
    public function create(Request $request, WorkflowAutomationTemplates $templates): Response
    {
        return Inertia::render('automations/create-edit', [
            'mode' => 'create',
            'automation' => null,
            'templates' => $templates->all(),
        ]);
    }

    /**
     * Store a workflow automation.
     */
    public function store(StoreWorkflowAutomationRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $team->workflowAutomations()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Automation created.')]);

        return to_route('automations.index', ['current_team' => $team->slug]);
    }

    /**
     * Show the form for editing a workflow automation.
     */
    public function edit(Request $request, WorkflowAutomationTemplates $templates, string $current_team, int $automation): Response
    {
        $team = $request->user()->currentTeam;
        $automationModel = $team->workflowAutomations()->findOrFail($automation);

        return Inertia::render('automations/create-edit', [
            'mode' => 'edit',
            'automation' => $automationModel->toListArray(),
            'templates' => $templates->all(),
        ]);
    }

    /**
     * Update a workflow automation.
     */
    public function update(UpdateWorkflowAutomationRequest $request, string $current_team, int $automation): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $automationModel = $team->workflowAutomations()->findOrFail($automation);

        $automationModel->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Automation updated.')]);

        return to_route('automations.index', ['current_team' => $team->slug]);
    }

    /**
     * Delete a workflow automation.
     */
    public function destroy(Request $request, string $current_team, int $automation): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $team->workflowAutomations()->findOrFail($automation)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Automation deleted.')]);

        return back();
    }
}
