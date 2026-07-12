<?php

use App\Enums\ContactStatus;
use App\Enums\ContactType;
use App\Enums\OpportunityStage;
use App\Mail\NewPublicLeadReceived;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    config(['services.turnstile.secret_key' => 'test-secret']);
});

test('a public lead form submission creates a contact and an inbox opportunity', function () {
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);
    Mail::fake();

    $owner = User::factory()->create();
    $team = $owner->currentTeam;

    $response = $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'company' => 'Acme Corp',
        'services' => ['Brand Identity', 'Web Design'],
        'budget' => 'under5k',
        'message' => 'We need a new brand identity.',
        'turnstile_token' => 'valid-token',
    ]);

    $response->assertRedirect();

    $contact = Contact::where('email', 'jane@acme.test')->firstOrFail();
    expect($contact->team_id)->toBe($team->id);
    expect($contact->type)->toBe(ContactType::Lead);
    expect($contact->status)->toBe(ContactStatus::Prospect);
    expect($contact->company)->toBe('Acme Corp');

    $opportunity = Opportunity::where('contact_id', $contact->id)->firstOrFail();
    expect($opportunity->stage)->toBe(OpportunityStage::Inbox);
    expect($opportunity->source)->toBe('Public form');
    expect($opportunity->description)->toContain('Brand Identity, Web Design');
    expect($opportunity->description)->toContain('Under $5,000');
    expect($opportunity->description)->toContain('We need a new brand identity.');

    Mail::assertSent(NewPublicLeadReceived::class, fn ($mail) => $mail->hasTo($owner->email));
});

test('a public lead form submission works when addressed via a custom lead form slug', function () {
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);
    Mail::fake();

    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $team->update(['lead_form_slug' => 'hilmi-studio']);

    $response = $this->post(route('public-lead-form.submit', ['team' => 'hilmi-studio']), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello there.',
        'turnstile_token' => 'valid-token',
    ]);

    $response->assertRedirect();

    $contact = Contact::where('email', 'jane@acme.test')->firstOrFail();
    expect($contact->team_id)->toBe($team->id);
});

test('a public lead form submission attaches uploaded files to the opportunity when attachments are allowed', function () {
    Storage::fake('public');
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);
    Mail::fake();

    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $team->update(['lead_form_allow_attachments' => true]);

    $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello there.',
        'turnstile_token' => 'valid-token',
        'attachments' => [
            UploadedFile::fake()->image('brief.png'),
            UploadedFile::fake()->create('brief.pdf', 500, 'application/pdf'),
        ],
    ])->assertRedirect();

    $contact = Contact::where('email', 'jane@acme.test')->firstOrFail();
    $opportunity = Opportunity::where('contact_id', $contact->id)->firstOrFail();

    expect($opportunity->attachmentsArray())->toHaveCount(2);
});

test('a public lead form submission ignores uploaded files when attachments are disabled', function () {
    Storage::fake('public');
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);
    Mail::fake();

    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $team->update(['lead_form_allow_attachments' => false]);

    $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello there.',
        'turnstile_token' => 'valid-token',
        'attachments' => [UploadedFile::fake()->image('brief.png')],
    ])->assertRedirect();

    $contact = Contact::where('email', 'jane@acme.test')->firstOrFail();
    $opportunity = Opportunity::where('contact_id', $contact->id)->firstOrFail();

    expect($opportunity->attachmentsArray())->toHaveCount(0);
});

test('a public lead form submission rejects more than five attachments', function () {
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);
    Mail::fake();

    $team = User::factory()->create()->currentTeam;

    $response = $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello there.',
        'turnstile_token' => 'valid-token',
        'attachments' => array_fill(0, 6, UploadedFile::fake()->image('brief.png')),
    ]);

    $response->assertSessionHasErrors('attachments');
    expect(Contact::where('email', 'jane@acme.test')->exists())->toBeFalse();
});

test('a public lead form submission reuses an existing contact by email', function () {
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);
    Mail::fake();

    $team = User::factory()->create()->currentTeam;
    $existing = Contact::factory()->for($team)->create(['email' => 'jane@acme.test']);

    $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'JANE@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello again.',
        'turnstile_token' => 'valid-token',
    ]);

    expect(Contact::where('team_id', $team->id)->count())->toBe(1);

    $opportunity = Opportunity::where('contact_id', $existing->id)->firstOrFail();
    expect($opportunity->stage)->toBe(OpportunityStage::Inbox);
});

test('a public lead form submission accepts the camelCase payload the frontend form sends', function () {
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);
    Mail::fake();

    $team = User::factory()->create()->currentTeam;

    $response = $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'firstName' => 'Jane',
        'lastName' => 'Doe',
        'email' => 'jane@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello there.',
        'turnstileToken' => 'valid-token',
    ]);

    $response->assertSessionDoesntHaveErrors();

    expect(Contact::where('email', 'jane@acme.test')->exists())->toBeTrue();
});

test('a public lead form submission is rejected when turnstile is not configured', function () {
    config(['services.turnstile.secret_key' => null]);
    Mail::fake();

    $team = User::factory()->create()->currentTeam;

    $response = $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello there.',
        'turnstile_token' => 'some-token',
    ]);

    $response->assertSessionHasErrors('turnstile_token');
    expect(Contact::where('email', 'jane@acme.test')->exists())->toBeFalse();
    Mail::assertNothingSent();
});

test('a public lead form submission is rejected when turnstile verification fails', function () {
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => false])]);
    Mail::fake();

    $team = User::factory()->create()->currentTeam;

    $response = $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello there.',
        'turnstile_token' => 'invalid-token',
    ]);

    $response->assertSessionHasErrors('turnstile_token');
    expect(Contact::where('email', 'jane@acme.test')->exists())->toBeFalse();
});

test('a public lead form submission sends the secret key and token to cloudflare', function () {
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);
    Mail::fake();

    $team = User::factory()->create()->currentTeam;

    $this->post(route('public-lead-form.submit', ['team' => $team->slug]), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'services' => ['Web Design'],
        'message' => 'Hello there.',
        'turnstile_token' => 'valid-token',
    ]);

    Http::assertSent(function (HttpRequest $request) {
        return $request->url() === 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
            && $request['secret'] === 'test-secret'
            && $request['response'] === 'valid-token';
    });
});
