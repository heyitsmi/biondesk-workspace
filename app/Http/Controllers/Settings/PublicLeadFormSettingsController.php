<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateLeadFormSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PublicLeadFormSettingsController extends Controller
{
    /**
     * Map validated request keys to their underlying team column.
     *
     * @var array<string, string>
     */
    private const FIELD_MAP = [
        'enabled' => 'lead_form_enabled',
        'title' => 'lead_form_title',
        'welcome_message' => 'lead_form_welcome_message',
        'background_theme' => 'lead_form_background_theme',
        'services' => 'lead_form_services',
        'ask_budget' => 'lead_form_ask_budget',
        'allow_attachments' => 'lead_form_allow_attachments',
    ];

    /**
     * Show the public lead form settings page.
     */
    public function edit(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('settings/lead-form', [
            'formUrl' => route('public-lead-form', ['team' => $team->slug]),
            'settings' => $team->leadFormSettings(),
        ]);
    }

    /**
     * Update the public lead form settings.
     */
    public function update(UpdateLeadFormSettingsRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('update', $team);

        $data = $request->validated();
        $updates = [];

        foreach (self::FIELD_MAP as $key => $column) {
            if (array_key_exists($key, $data)) {
                $updates[$column] = $data[$key];
            }
        }

        if ($updates !== []) {
            $team->update($updates);
        }

        if ($request->hasFile('banner')) {
            $team->addMediaFromRequest('banner')->toMediaCollection('lead-form-banner');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Lead form settings updated.')]);

        return to_route('lead-form.edit');
    }
}
