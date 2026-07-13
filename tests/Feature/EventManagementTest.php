<?php

use App\Models\Event;
use App\Models\Team;
use App\Models\User;

test('an event can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('calendar.events.store', ['current_team' => $team->slug]), [
            'title' => 'Client call',
            'description' => 'Kickoff discussion',
            'starts_at' => '2026-08-01T10:00:00',
            'ends_at' => '2026-08-01T11:00:00',
            'all_day' => false,
            'location' => 'Zoom',
            'color' => 'accent',
        ])
        ->assertRedirect(route('calendar.index', ['current_team' => $team->slug]));

    $event = Event::where('team_id', $team->id)->firstOrFail();
    expect($event->title)->toBe('Client call');
    expect($event->all_day)->toBeFalse();
    expect($event->recurrence)->toBeNull();
});

test('a recurring event can be created with a preset', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('calendar.events.store', ['current_team' => $team->slug]), [
            'title' => 'Weekly sync',
            'starts_at' => '2026-08-03T09:00:00',
            'all_day' => false,
            'color' => 'success',
            'recurrence' => 'weekly',
        ])
        ->assertRedirect();

    $event = Event::where('team_id', $team->id)->firstOrFail();
    expect($event->recurrence->value)->toBe('weekly');
    expect($event->isRecurring())->toBeTrue();
});

test('an invalid recurrence preset is rejected', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('calendar.events.store', ['current_team' => $team->slug]), [
            'title' => 'Bad recurrence',
            'starts_at' => '2026-08-03T09:00:00',
            'recurrence' => 'biweekly',
        ])
        ->assertSessionHasErrors('recurrence');

    expect(Event::where('team_id', $team->id)->count())->toBe(0);
});

test('an invalid color is rejected', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('calendar.events.store', ['current_team' => $team->slug]), [
            'title' => 'Bad color',
            'starts_at' => '2026-08-03T09:00:00',
            'color' => 'purple',
        ])
        ->assertSessionHasErrors('color');
});

test('a timed event requires ends_at to be after starts_at', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('calendar.events.store', ['current_team' => $team->slug]), [
            'title' => 'Backwards event',
            'starts_at' => '2026-08-03T10:00:00',
            'ends_at' => '2026-08-03T09:00:00',
            'all_day' => false,
        ])
        ->assertSessionHasErrors('ends_at');
});

test('an all-day event does not enforce ends_at ordering', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->post(route('calendar.events.store', ['current_team' => $team->slug]), [
            'title' => 'Multi-day off-site',
            'starts_at' => '2026-08-03',
            'ends_at' => '2026-08-01',
            'all_day' => true,
        ])
        ->assertSessionDoesntHaveErrors('ends_at');
});

test('an event can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $event = Event::factory()->for($team)->create(['title' => 'Original']);

    $this->actingAs($user)
        ->put(route('calendar.events.update', ['current_team' => $team->slug, 'event' => $event->id]), [
            'title' => 'Renamed',
            'starts_at' => '2026-08-05T10:00:00',
            'all_day' => false,
            'color' => 'danger',
        ])
        ->assertRedirect(route('calendar.index', ['current_team' => $team->slug]));

    expect($event->fresh()->title)->toBe('Renamed');
    expect($event->fresh()->color->value)->toBe('danger');
});

test('an event can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $event = Event::factory()->for($team)->create();

    $this->actingAs($user)
        ->delete(route('calendar.events.destroy', ['current_team' => $team->slug, 'event' => $event->id]))
        ->assertRedirect(route('calendar.index', ['current_team' => $team->slug]));

    expect(Event::find($event->id))->toBeNull();
});

test('a non-recurring event can be moved via drag/resize', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $event = Event::factory()->for($team)->create([
        'starts_at' => '2026-08-01 10:00:00',
        'ends_at' => '2026-08-01 11:00:00',
        'recurrence' => null,
    ]);

    $this->actingAs($user)
        ->patch(route('calendar.events.move', ['current_team' => $team->slug, 'event' => $event->id]), [
            'starts_at' => '2026-08-02T14:00:00',
            'ends_at' => '2026-08-02T15:00:00',
        ])
        ->assertRedirect();

    $event->refresh();
    expect($event->starts_at->format('Y-m-d H:i'))->toBe('2026-08-02 14:00');
    expect($event->ends_at->format('Y-m-d H:i'))->toBe('2026-08-02 15:00');
});

test('a recurring event cannot be moved via drag/resize', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $event = Event::factory()->for($team)->create([
        'starts_at' => '2026-08-01 10:00:00',
        'ends_at' => '2026-08-01 11:00:00',
        'recurrence' => 'weekly',
    ]);

    $this->actingAs($user)
        ->patch(route('calendar.events.move', ['current_team' => $team->slug, 'event' => $event->id]), [
            'starts_at' => '2026-08-02T14:00:00',
            'ends_at' => '2026-08-02T15:00:00',
        ])
        ->assertStatus(422);

    expect($event->fresh()->starts_at->format('Y-m-d H:i'))->toBe('2026-08-01 10:00');
});

test('a team cannot view, update, move, or delete another team\'s events', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $event = Event::factory()->for($otherTeam)->create();

    $this->actingAs($user)
        ->put(route('calendar.events.update', ['current_team' => $team->slug, 'event' => $event->id]), [
            'title' => 'Hacked',
            'starts_at' => '2026-08-01T10:00:00',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->patch(route('calendar.events.move', ['current_team' => $team->slug, 'event' => $event->id]), [
            'starts_at' => '2026-08-01T10:00:00',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('calendar.events.destroy', ['current_team' => $team->slug, 'event' => $event->id]))
        ->assertNotFound();

    expect($event->fresh()->title)->not->toBe('Hacked');
});

test('calendar index renders events and aggregated entries scoped to the current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    Event::factory()->for($team)->create();

    $this->actingAs($user)
        ->get(route('calendar.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('calendar/index')
            ->has('events', 1)
            ->has('aggregated'),
        );
});
