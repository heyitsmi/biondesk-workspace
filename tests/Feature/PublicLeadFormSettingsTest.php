<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot view the lead form settings page', function () {
    $this->get(route('lead-form.edit'))->assertRedirect(route('login'));
});

test('the lead form settings page shows the current team settings', function () {
    $user = User::factory()->create();
    $team = Team::find($user->current_team_id);
    $team->update(['lead_form_title' => 'Work with Acme']);
    $user->refresh();

    $this->actingAs($user)
        ->get(route('lead-form.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/lead-form')
            ->where('settings.title', 'Work with Acme')
            ->has('formUrl'),
        );
});

test('a team owner can update the enable toggle', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->put(route('lead-form.update'), ['enabled' => false])
        ->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->lead_form_enabled)->toBeFalse();
});

test('a team owner can update the appearance settings', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'title' => 'Work with Acme',
        'welcome_message' => 'Tell us about your project.',
        'background_theme' => 'light',
    ])->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->lead_form_title)->toBe('Work with Acme');
    expect($team->lead_form_welcome_message)->toBe('Tell us about your project.');
    expect($team->lead_form_background_theme->value)->toBe('light');
});

test('a team owner can update the fields and services settings', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'services' => ['Branding', 'Consulting'],
        'ask_budget' => false,
        'allow_attachments' => true,
    ])->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->lead_form_services)->toBe(['Branding', 'Consulting']);
    expect($team->lead_form_ask_budget)->toBeFalse();
    expect($team->lead_form_allow_attachments)->toBeTrue();
});

test('a team owner can upload a lead form banner', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'banner' => UploadedFile::fake()->image('logo.png'),
    ])->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->leadFormBannerUrl())->not->toBeNull();
});

test('a team member without update permission cannot update lead form settings', function () {
    $owner = User::factory()->create();
    $team = Team::find($owner->current_team_id);

    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);
    $member->refresh();

    $this->actingAs($member)
        ->put(route('lead-form.update'), ['title' => 'Hacked'])
        ->assertForbidden();

    expect($team->fresh()->lead_form_title)->not->toBe('Hacked');
});
