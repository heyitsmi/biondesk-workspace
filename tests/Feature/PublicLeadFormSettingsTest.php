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

test('saving appearance without picking new files does not fail file validation', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->putJson(route('lead-form.update'), [
        'title' => 'Work with Acme',
        'welcome_message' => 'Tell us about your project.',
        'background_theme' => 'light',
        'banner' => null,
        'background_image' => null,
        'cover_banner' => null,
    ])->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->lead_form_title)->toBe('Work with Acme');
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

test('a team owner can set a custom lead form link', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->put(route('lead-form.update'), ['lead_form_slug' => 'hilmi-studio'])
        ->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->lead_form_slug)->toBe('hilmi-studio');
    expect($team->leadFormPublicSlug())->toBe('hilmi-studio');

    $this->actingAs($user)
        ->get(route('lead-form.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('formUrl', route('public-lead-form', ['team' => 'hilmi-studio']))
            ->where('settings.customSlug', 'hilmi-studio'),
        );
});

test('a custom lead form link is rejected when already taken by another team', function () {
    Team::factory()->create(['slug' => 'acme-inc']);

    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->put(route('lead-form.update'), ['lead_form_slug' => 'acme-inc'])
        ->assertSessionHasErrors('lead_form_slug');

    expect($team->fresh()->lead_form_slug)->toBeNull();
});

test('a custom lead form link is rejected when invalid format', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->put(route('lead-form.update'), ['lead_form_slug' => 'Not A Valid Slug!'])
        ->assertSessionHasErrors('lead_form_slug');

    expect($team->fresh()->lead_form_slug)->toBeNull();
});

test('clearing the custom lead form link falls back to the team slug', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;
    $team->update(['lead_form_slug' => 'hilmi-studio']);

    $this->actingAs($user)
        ->put(route('lead-form.update'), ['lead_form_slug' => ''])
        ->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->lead_form_slug)->toBeNull();
    expect($team->leadFormPublicSlug())->toBe($team->slug);
});

test('a team owner can set a custom background color', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'background_theme' => 'custom',
        'background_color' => '#ff8800',
    ])->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->lead_form_background_theme->value)->toBe('custom');
    expect($team->lead_form_background_color)->toBe('#ff8800');
});

test('an invalid background color is rejected', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->put(route('lead-form.update'), ['background_color' => 'orange'])
        ->assertSessionHasErrors('background_color');

    expect($team->fresh()->lead_form_background_color)->toBeNull();
});

test('a team owner can upload a custom background image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'background_image' => UploadedFile::fake()->image('bg.png'),
    ])->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->leadFormBackgroundImageUrl())->not->toBeNull();
});

test('a team owner can upload a cover banner', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'cover_banner' => UploadedFile::fake()->image('cover.png'),
    ])->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->leadFormCoverUrl())->not->toBeNull();
});

test('a cover banner and background image upload via the camelCase keys the frontend actually sends are saved', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'backgroundImage' => UploadedFile::fake()->image('bg.png'),
        'coverBanner' => UploadedFile::fake()->image('cover.png'),
    ])->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->leadFormBackgroundImageUrl())->not->toBeNull();
    expect($team->leadFormCoverUrl())->not->toBeNull();
});

test('a team owner can save social and custom links', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'social_links' => [
            ['platform' => 'instagram', 'url' => 'https://instagram.com/hilmi'],
            ['platform' => 'website', 'url' => 'https://hilmi.dev'],
        ],
    ])->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->leadFormSocialLinks())->toBe([
        ['platform' => 'instagram', 'url' => 'https://instagram.com/hilmi'],
        ['platform' => 'website', 'url' => 'https://hilmi.dev'],
    ]);
});

test('social links are saved via the camelCase key the frontend sends', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'socialLinks' => [
            ['platform' => 'github', 'url' => 'https://github.com/hilmi'],
        ],
    ])->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->leadFormSocialLinks())->toBe([
        ['platform' => 'github', 'url' => 'https://github.com/hilmi'],
    ]);
});

test('a social link with an unknown platform is rejected', function () {
    $user = User::factory()->create();
    $user->refresh();

    $this->actingAs($user)->put(route('lead-form.update'), [
        'social_links' => [
            ['platform' => 'myspace', 'url' => 'https://myspace.com/hilmi'],
        ],
    ])->assertSessionHasErrors('social_links.0.platform');
});

test('a social link with an invalid url is rejected', function () {
    $user = User::factory()->create();
    $user->refresh();

    $this->actingAs($user)->put(route('lead-form.update'), [
        'social_links' => [
            ['platform' => 'instagram', 'url' => 'not-a-url'],
        ],
    ])->assertSessionHasErrors('social_links.0.url');
});

test('more than 8 social links are rejected', function () {
    $user = User::factory()->create();
    $user->refresh();

    $links = collect(range(1, 9))
        ->map(fn (int $i) => ['platform' => 'website', 'url' => "https://example.com/{$i}"])
        ->all();

    $this->actingAs($user)->put(route('lead-form.update'), [
        'social_links' => $links,
    ])->assertSessionHasErrors('social_links');
});

test('a team owner can save SEO meta title and description', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'meta_title' => 'Custom SEO Title',
        'meta_description' => 'A custom description for search engines and link previews.',
    ])->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->lead_form_meta_title)->toBe('Custom SEO Title');
    expect($team->lead_form_meta_description)->toBe('A custom description for search engines and link previews.');
});

test('SEO meta fields are saved via the camelCase keys the frontend sends', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'metaTitle' => 'Camel Title',
        'metaDescription' => 'Camel description.',
    ])->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->lead_form_meta_title)->toBe('Camel Title');
    expect($team->lead_form_meta_description)->toBe('Camel description.');
});

test('clearing the SEO meta fields falls back to the title and welcome message', function () {
    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;
    $team->update([
        'lead_form_meta_title' => 'Old Title',
        'lead_form_meta_description' => 'Old description.',
    ]);

    $this->actingAs($user)->put(route('lead-form.update'), [
        'meta_title' => '',
        'meta_description' => '',
    ])->assertRedirect(route('lead-form.edit'));

    $team = $team->fresh();
    expect($team->lead_form_meta_title)->toBeNull();
    expect($team->lead_form_meta_description)->toBeNull();
    expect($team->leadFormSettings()['metaTitle'])->toBe($team->leadFormSettings()['title']);
});

test('a meta title over 255 characters is rejected', function () {
    $user = User::factory()->create();
    $user->refresh();

    $this->actingAs($user)->put(route('lead-form.update'), [
        'meta_title' => str_repeat('a', 256),
    ])->assertSessionHasErrors('meta_title');
});

test('a meta description over 300 characters is rejected', function () {
    $user = User::factory()->create();
    $user->refresh();

    $this->actingAs($user)->put(route('lead-form.update'), [
        'meta_description' => str_repeat('a', 301),
    ])->assertSessionHasErrors('meta_description');
});

test('a team owner can upload a social sharing image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'og_image' => UploadedFile::fake()->image('og.png'),
    ])->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->leadFormOgImageUrl())->not->toBeNull();
});

test('a social sharing image uploaded via the camelCase key the frontend sends is saved', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $user->refresh();
    $team = $user->currentTeam;

    $this->actingAs($user)->put(route('lead-form.update'), [
        'ogImage' => UploadedFile::fake()->image('og.png'),
    ])->assertRedirect(route('lead-form.edit'));

    expect($team->fresh()->leadFormOgImageUrl())->not->toBeNull();
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
