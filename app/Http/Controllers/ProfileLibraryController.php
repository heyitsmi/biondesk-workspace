<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProfileAssetRequest;
use App\Http\Requests\UpdateProfileAssetRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileLibraryController extends Controller
{
    /**
     * Show the profile library index page.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('profiles/index', [
            'profiles' => $team->profileAssets()->latest()->get()->map->toProfileArray()->all(),
        ]);
    }

    /**
     * Show the new-profile page.
     */
    public function create(): Response
    {
        return Inertia::render('profiles/create', [
            'defaults' => [
                'title' => '',
                'category' => '',
                'shortDescription' => '',
                'body' => '',
            ],
        ]);
    }

    /**
     * Store a newly created profile asset.
     */
    public function store(StoreProfileAssetRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $profile = $team->profileAssets()->create($request->safe()->except('image'));

        if ($request->hasFile('image')) {
            $profile->addMediaFromRequest('image')->toMediaCollection('image');
        }

        return to_route('profiles.index', ['current_team' => $team->slug]);
    }

    /**
     * Show the edit-profile page.
     */
    public function edit(Request $request, string $current_team, int $profile): Response
    {
        $team = $request->user()->currentTeam;
        $model = $team->profileAssets()->findOrFail($profile);

        return Inertia::render('profiles/edit', [
            'profile' => $model->toProfileArray(),
        ]);
    }

    /**
     * Update the given profile asset.
     */
    public function update(UpdateProfileAssetRequest $request, string $current_team, int $profile): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->profileAssets()->findOrFail($profile);

        $model->update($request->safe()->except('image'));

        if ($request->hasFile('image')) {
            $model->addMediaFromRequest('image')->toMediaCollection('image');
        }

        return to_route('profiles.index', ['current_team' => $team->slug]);
    }

    /**
     * Delete the given profile asset.
     */
    public function destroy(Request $request, string $current_team, int $profile): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->profileAssets()->findOrFail($profile);
        $model->delete();

        return to_route('profiles.index', ['current_team' => $team->slug]);
    }

    /**
     * Duplicate the given profile asset, including its featured image.
     */
    public function duplicate(Request $request, string $current_team, int $profile): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->profileAssets()->findOrFail($profile);

        $copy = $team->profileAssets()->create([
            'category' => $model->category,
            'title' => "{$model->title} (Copy)",
            'short_description' => $model->short_description,
            'body' => $model->body,
        ]);

        $model->getFirstMedia('image')?->copy($copy, 'image');

        return to_route('profiles.index', ['current_team' => $team->slug]);
    }
}
