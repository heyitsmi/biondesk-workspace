<?php

use App\Enums\OpportunityStage;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('opportunities index lists only the current team\'s opportunities with summary', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();

    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Won, 'amount_value' => 1000]);
    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Lost, 'amount_value' => 2000]);
    Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Inbox, 'amount_value' => 3000]);
    Opportunity::factory()->for($otherTeam)->for(Contact::factory()->for($otherTeam))->create();

    $this->actingAs($user)
        ->get(route('opportunities.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('opportunities/index')
            ->has('stages', 6)
            ->has('opportunities', 3)
            ->where('summary.openCount', '1')
            ->where('summary.winRate', '50%'),
        );
});

test('the create page returns stages, team contacts, and defaults', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    Contact::factory()->for($team)->count(2)->create();

    $this->actingAs($user)
        ->get(route('opportunities.create', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('opportunities/create')
            ->has('stages', 6)
            ->has('contacts', 2)
            ->where('defaults.stage', 'inbox'),
        );
});

test('the create page includes the quick added contact from flash data', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create(['company' => 'Acme Corp']);

    $this->actingAs($user)
        ->withSession([
            'quickAddedContact' => [
                'id' => $contact->id,
                'name' => 'Acme Corp',
            ],
        ])
        ->get(route('opportunities.create', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('opportunities/create')
            ->where('quickAddedContact.id', $contact->id)
            ->where('quickAddedContact.name', 'Acme Corp'),
        );
});

test('an opportunity can be created for a contact belonging to the team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('opportunities.store', ['current_team' => $team->slug]), [
            'title' => 'Website Redesign',
            'contact_id' => $contact->id,
            'amount_value' => 5000,
            'stage' => 'inbox',
            'priority' => 'medium',
            'description' => 'Initial brief received',
        ])
        ->assertRedirect(route('opportunities.index', ['current_team' => $team->slug]));

    $opportunity = Opportunity::sole();
    expect($opportunity->team_id)->toBe($team->id);
    expect($opportunity->contact_id)->toBe($contact->id);
    expect($opportunity->amount_value)->toBe(5000);
});

test('an opportunity can be created from the camelCase payload the frontend form sends', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->post(route('opportunities.store', ['current_team' => $team->slug]), [
            'title' => 'Website Redesign',
            'contactId' => $contact->id,
            'amountValue' => '5000',
            'stage' => 'inbox',
            'priority' => 'medium',
            'closeDate' => '',
        ])
        ->assertRedirect(route('opportunities.index', ['current_team' => $team->slug]));

    $opportunity = Opportunity::sole();
    expect($opportunity->contact_id)->toBe($contact->id);
    expect($opportunity->amount_value)->toBe(5000);
    expect($opportunity->close_date)->toBeNull();
});

test('an opportunity cannot be created for another team\'s contact', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignContact = Contact::factory()->for($otherTeam)->create();

    $this->actingAs($user)
        ->post(route('opportunities.store', ['current_team' => $team->slug]), [
            'title' => 'Website Redesign',
            'contact_id' => $foreignContact->id,
            'stage' => 'inbox',
            'priority' => 'medium',
        ])
        ->assertSessionHasErrors('contact_id');

    expect(Opportunity::count())->toBe(0);
});

test('an opportunity can be edited and updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create(['title' => 'Old Title']);

    $this->actingAs($user)
        ->get(route('opportunities.edit', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('opportunities/edit')
            ->where('opportunity.id', $opportunity->id)
            ->where('opportunity.title', 'Old Title'),
        );

    $this->actingAs($user)
        ->put(route('opportunities.update', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]), [
            'title' => 'New Title',
            'contact_id' => $contact->id,
            'stage' => 'negotiation',
            'priority' => 'high',
        ])
        ->assertRedirect(route('opportunities.index', ['current_team' => $team->slug]));

    expect($opportunity->fresh()->title)->toBe('New Title');
    expect($opportunity->fresh()->stage)->toBe(OpportunityStage::Negotiation);
});

test('the edit page includes the quick added contact from flash data', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $newContact = Contact::factory()->for($team)->create(['company' => 'Acme Corp']);
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    $this->actingAs($user)
        ->withSession([
            'quickAddedContact' => [
                'id' => $newContact->id,
                'name' => 'Acme Corp',
            ],
        ])
        ->get(route('opportunities.edit', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('opportunities/edit')
            ->where('quickAddedContact.id', $newContact->id)
            ->where('quickAddedContact.name', 'Acme Corp'),
        );
});

test('an opportunity\'s stage can be moved via the drag endpoint', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create(['stage' => OpportunityStage::Inbox]);

    $this->actingAs($user)
        ->patch(route('opportunities.move-stage', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]), [
            'stage' => 'won',
        ])
        ->assertRedirect();

    expect($opportunity->fresh()->stage)->toBe(OpportunityStage::Won);
});

test('a team cannot edit, update, or move another team\'s opportunity', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignContact = Contact::factory()->for($otherTeam)->create();
    $opportunity = Opportunity::factory()->for($otherTeam)->for($foreignContact)->create();

    $this->actingAs($user)
        ->get(route('opportunities.edit', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]))
        ->assertNotFound();

    $ownContact = Contact::factory()->for($team)->create();

    $this->actingAs($user)
        ->put(route('opportunities.update', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]), [
            'title' => 'Hacked',
            'contact_id' => $ownContact->id,
            'stage' => 'won',
            'priority' => 'medium',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->patch(route('opportunities.move-stage', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]), [
            'stage' => 'won',
        ])
        ->assertNotFound();

    expect($opportunity->fresh()->title)->not->toBe('Hacked');
});

test('an opportunity can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    $this->actingAs($user)
        ->delete(route('opportunities.destroy', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]))
        ->assertRedirect(route('opportunities.index', ['current_team' => $team->slug]));

    expect(Opportunity::find($opportunity->id))->toBeNull();
});

test('a team cannot delete another team\'s opportunity', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignContact = Contact::factory()->for($otherTeam)->create();
    $opportunity = Opportunity::factory()->for($otherTeam)->for($foreignContact)->create();

    $this->actingAs($user)
        ->delete(route('opportunities.destroy', ['current_team' => $team->slug, 'opportunity' => $opportunity->id]))
        ->assertNotFound();

    expect($opportunity->fresh())->not->toBeNull();
});
