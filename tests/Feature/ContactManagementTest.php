<?php

use App\Enums\ContactType;
use App\Models\Contact;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('contacts index lists only the current team\'s contacts', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();

    Contact::factory()->for($team)->create(['first_name' => 'Jane', 'last_name' => 'Doe', 'company' => 'Acme Corp']);
    Contact::factory()->for($otherTeam)->create(['first_name' => 'Other', 'last_name' => 'Team']);

    $this->actingAs($user)
        ->get(route('contacts.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contacts/index')
            ->has('contacts', 1)
            ->where('contacts.0.fullName', 'Jane Doe')
            ->where('contacts.0.company', 'Acme Corp')
            ->where('contactsCount', '1'),
        );
});

test('a contact can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this->actingAs($user)->post(route('contacts.store', ['current_team' => $team->slug]), [
        'type' => 'client',
        'company' => 'Acme Corp',
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@acme.test',
        'phone' => '555-1234',
        'role' => 'CEO',
        'location' => 'NYC',
        'website' => 'https://acme.test',
        'notes' => 'Important client',
    ]);

    $contact = Contact::sole();

    $response->assertRedirect(route('contacts.show', ['current_team' => $team->slug, 'contact' => $contact->id]));
    expect($contact->team_id)->toBe($team->id);
    expect($contact->first_name)->toBe('Jane');
    expect($contact->company)->toBe('Acme Corp');
});

test('a contact can be created from the camelCase payload the frontend form sends', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)->post(route('contacts.store', ['current_team' => $team->slug]), [
        'type' => 'client',
        'company' => 'Acme Corp',
        'firstName' => 'Jane',
        'lastName' => 'Doe',
    ])->assertRedirect();

    $contact = Contact::sole();
    expect($contact->first_name)->toBe('Jane');
    expect($contact->last_name)->toBe('Doe');
});

test('contact creation requires a first name', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('contacts.store', ['current_team' => $team->slug]), [
            'type' => 'client',
        ])
        ->assertSessionHasErrors('first_name');

    expect(Contact::count())->toBe(0);
});

test('a contact can be viewed, edited, and updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create(['first_name' => 'Jane', 'last_name' => 'Doe']);

    $this->actingAs($user)
        ->get(route('contacts.show', ['current_team' => $team->slug, 'contact' => $contact->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contacts/show')
            ->where('contact.id', $contact->id)
            ->where('contact.fullName', 'Jane Doe'),
        );

    $this->actingAs($user)
        ->get(route('contacts.edit', ['current_team' => $team->slug, 'contact' => $contact->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contacts/edit')
            ->where('contact.id', $contact->id),
        );

    $this->actingAs($user)
        ->put(route('contacts.update', ['current_team' => $team->slug, 'contact' => $contact->id]), [
            'type' => 'lead',
            'first_name' => 'Janet',
            'last_name' => 'Doe',
        ])
        ->assertRedirect(route('contacts.show', ['current_team' => $team->slug, 'contact' => $contact->id]));

    expect($contact->fresh()->first_name)->toBe('Janet');
    expect($contact->fresh()->type)->toBe(ContactType::Lead);
});

test('a contact can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->delete(route('contacts.destroy', ['current_team' => $team->slug, 'contact' => $contact->id]))
        ->assertRedirect(route('contacts.index', ['current_team' => $team->slug]));

    expect(Contact::find($contact->id))->toBeNull();
});

test('a team cannot view, edit, update, or delete another team\'s contact', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $contact = Contact::factory()->for($otherTeam)->create();

    $this->actingAs($user)
        ->get(route('contacts.show', ['current_team' => $team->slug, 'contact' => $contact->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->get(route('contacts.edit', ['current_team' => $team->slug, 'contact' => $contact->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->put(route('contacts.update', ['current_team' => $team->slug, 'contact' => $contact->id]), [
            'type' => 'lead',
            'first_name' => 'Hacked',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('contacts.destroy', ['current_team' => $team->slug, 'contact' => $contact->id]))
        ->assertNotFound();

    expect($contact->fresh())->not->toBeNull();
});
