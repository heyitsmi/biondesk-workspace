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
        'lead_form_slug' => 'lead_form_slug',
        'title' => 'lead_form_title',
        'welcome_message' => 'lead_form_welcome_message',
        'background_theme' => 'lead_form_background_theme',
        'background_color' => 'lead_form_background_color',
        'services' => 'lead_form_services',
        'social_links' => 'lead_form_social_links',
        'show_booking_link' => 'lead_form_show_booking_link',
        'booking_link_id' => 'lead_form_booking_link_id',
        'meta_title' => 'lead_form_meta_title',
        'meta_description' => 'lead_form_meta_description',
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
            'formUrl' => route('public-lead-form', ['team' => $team->leadFormPublicSlug()]),
            'settings' => $team->leadFormSettings(),
            'bookingLinks' => $team->bookingLinks()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(function ($bookingLink) use ($team): array {
                    $bookingLink->setRelation('team', $team);

                    return [
                        'id' => $bookingLink->id,
                        'name' => $bookingLink->name,
                        'slug' => $bookingLink->slug,
                        'publicUrl' => $bookingLink->publicPath(),
                    ];
                })
                ->values(),
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
            $team->addMedia($request->file('banner'))->toMediaCollection('lead-form-banner');
        }

        if ($request->hasFile('background_image')) {
            $team->addMedia($request->file('background_image'))->toMediaCollection('lead-form-background');
        }

        if ($request->hasFile('cover_banner')) {
            $team->addMedia($request->file('cover_banner'))->toMediaCollection('lead-form-cover');
        }

        if ($request->hasFile('og_image')) {
            $team->addMedia($request->file('og_image'))->toMediaCollection('lead-form-og-image');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Lead form settings updated.')]);

        return to_route('lead-form.edit');
    }
}
