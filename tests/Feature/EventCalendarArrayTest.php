<?php

use App\Enums\EventColor;
use App\Enums\EventRecurrence;
use App\Models\Event;
use App\Models\Team;

test('a non-recurring timed event serializes start/end without a timezone offset', function () {
    $team = Team::factory()->create();
    $event = Event::factory()->for($team)->create([
        'title' => 'Client call',
        'starts_at' => '2026-08-01 10:00:00',
        'ends_at' => '2026-08-01 11:00:00',
        'all_day' => false,
        'color' => EventColor::Accent,
        'recurrence' => null,
    ]);

    $array = $event->toCalendarArray();

    expect($array['id'])->toBe("event-{$event->id}");
    expect($array['start'])->toBe('2026-08-01T10:00:00');
    expect($array['end'])->toBe('2026-08-01T11:00:00');
    expect($array['allDay'])->toBeFalse();
    expect($array['editable'])->toBeTrue();
    expect($array)->not->toHaveKey('rrule');
    expect($array['start'])->not->toContain('+');
    expect($array['start'])->not->toContain('Z');
});

test('a non-recurring all-day event has a null end when ends_at is not set', function () {
    $team = Team::factory()->create();
    $event = Event::factory()->for($team)->create([
        'starts_at' => '2026-08-01 00:00:00',
        'ends_at' => null,
        'all_day' => true,
        'recurrence' => null,
    ]);

    $array = $event->toCalendarArray();

    expect($array['allDay'])->toBeTrue();
    expect($array['end'])->toBeNull();
});

test('a recurring timed event serializes an rrule and duration instead of start/end', function () {
    $team = Team::factory()->create();
    $event = Event::factory()->for($team)->create([
        'starts_at' => '2026-08-03 09:00:00',
        'ends_at' => '2026-08-03 09:30:00',
        'all_day' => false,
        'recurrence' => EventRecurrence::Weekly,
    ]);

    $array = $event->toCalendarArray();

    expect($array)->not->toHaveKey('start');
    expect($array)->not->toHaveKey('end');
    expect($array['rrule'])->toBe([
        'freq' => 'weekly',
        'dtstart' => '2026-08-03T09:00:00',
    ]);
    expect($array['duration'])->toBe('00:30:00');
    expect($array['editable'])->toBeFalse();
    expect($array['extendedProps']['recurring'])->toBeTrue();
});

test('a recurring all-day event serializes duration as a day count', function () {
    $team = Team::factory()->create();
    $event = Event::factory()->for($team)->create([
        'starts_at' => '2026-08-03 00:00:00',
        'ends_at' => '2026-08-04 00:00:00',
        'all_day' => true,
        'recurrence' => EventRecurrence::Monthly,
    ]);

    $array = $event->toCalendarArray();

    expect($array['rrule']['dtstart'])->toBe('2026-08-03');
    expect($array['duration'])->toBe(['days' => 2]);
});

test('a recurring event with no ends_at falls back to a default duration', function () {
    $team = Team::factory()->create();
    $event = Event::factory()->for($team)->create([
        'starts_at' => '2026-08-03 09:00:00',
        'ends_at' => null,
        'all_day' => false,
        'recurrence' => EventRecurrence::Daily,
    ]);

    $array = $event->toCalendarArray();

    expect($array['duration'])->toBe('00:30:00');
});
