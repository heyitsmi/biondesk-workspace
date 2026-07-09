<?php

use App\Models\ProfileAsset;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot view profile library pages', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $profile = ProfileAsset::factory()->for($team)->create();

    $this->get(route('profiles.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));

    $this->get(route('profiles.edit', ['current_team' => $team->slug, 'profile' => $profile->id]))
        ->assertRedirect(route('login'));
});

test('the profile library index lists the team\'s profile assets', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    ProfileAsset::factory()->for($team)->count(3)->create();

    $this->actingAs($user)
        ->get(route('profiles.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('profiles/index')
            ->has('profiles', 3),
        );
});

test('a profile asset can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('profiles.store', ['current_team' => $team->slug]), [
            'title' => 'Case Study: FinTech App',
            'category' => 'case',
            'short_description' => 'A mobile banking redesign.',
            'body' => 'Full write-up of the engagement.',
        ])
        ->assertRedirect(route('profiles.index', ['current_team' => $team->slug]));

    $profile = ProfileAsset::sole();
    expect($profile->team_id)->toBe($team->id);
    expect($profile->title)->toBe('Case Study: FinTech App');
    expect($profile->category->value)->toBe('case');
});

test('a profile asset can be created with a featured image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('profiles.store', ['current_team' => $team->slug]), [
            'title' => 'Brand Assets & Logos',
            'category' => 'asset',
            'image' => UploadedFile::fake()->image('logo.png'),
        ])
        ->assertRedirect(route('profiles.index', ['current_team' => $team->slug]));

    $profile = ProfileAsset::sole();
    expect($profile->imageUrl())->not->toBeNull();
});

test('a profile asset can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $profile = ProfileAsset::factory()->for($team)->create(['title' => 'Old Title']);

    $this->actingAs($user)
        ->put(route('profiles.update', ['current_team' => $team->slug, 'profile' => $profile->id]), [
            'title' => 'New Title',
            'category' => 'team',
            'short_description' => 'Updated bio.',
            'body' => 'Updated body text.',
        ])
        ->assertRedirect(route('profiles.index', ['current_team' => $team->slug]));

    expect($profile->fresh()->title)->toBe('New Title');
    expect($profile->fresh()->category->value)->toBe('team');
});

test('a profile asset can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $profile = ProfileAsset::factory()->for($team)->create();

    $this->actingAs($user)
        ->delete(route('profiles.destroy', ['current_team' => $team->slug, 'profile' => $profile->id]))
        ->assertRedirect(route('profiles.index', ['current_team' => $team->slug]));

    expect(ProfileAsset::find($profile->id))->toBeNull();
});

test('a profile asset can be duplicated, including its image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $profile = ProfileAsset::factory()->for($team)->create(['title' => 'Original']);
    $profile->addMedia(UploadedFile::fake()->image('logo.png'))->toMediaCollection('image');

    $this->actingAs($user)
        ->post(route('profiles.duplicate', ['current_team' => $team->slug, 'profile' => $profile->id]))
        ->assertRedirect(route('profiles.index', ['current_team' => $team->slug]));

    expect(ProfileAsset::count())->toBe(2);
    $copy = ProfileAsset::where('id', '!=', $profile->id)->sole();
    expect($copy->title)->toBe('Original (Copy)');
    expect($copy->imageUrl())->not->toBeNull();
});

test('a team cannot view, update, delete, or duplicate another team\'s profile asset', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignProfile = ProfileAsset::factory()->for($otherTeam)->create();

    $this->actingAs($user)
        ->get(route('profiles.edit', ['current_team' => $team->slug, 'profile' => $foreignProfile->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->put(route('profiles.update', ['current_team' => $team->slug, 'profile' => $foreignProfile->id]), [
            'title' => 'Hacked',
            'category' => 'company',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('profiles.destroy', ['current_team' => $team->slug, 'profile' => $foreignProfile->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->post(route('profiles.duplicate', ['current_team' => $team->slug, 'profile' => $foreignProfile->id]))
        ->assertNotFound();

    expect($foreignProfile->fresh()->title)->not->toBe('Hacked');
});
