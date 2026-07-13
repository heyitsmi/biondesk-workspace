<?php

namespace App\Models;

use App\Enums\EventColor;
use App\Enums\EventRecurrence;
use Carbon\CarbonInterface;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $team_id
 * @property string $title
 * @property string|null $description
 * @property CarbonInterface $starts_at
 * @property CarbonInterface|null $ends_at
 * @property bool $all_day
 * @property string|null $location
 * @property EventColor $color
 * @property EventRecurrence|null $recurrence
 */
#[Fillable(['title', 'description', 'starts_at', 'ends_at', 'all_day', 'location', 'color', 'recurrence'])]
class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory;

    /**
     * Get the team this event belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Determine whether this event repeats on a recurrence preset.
     */
    public function isRecurring(): bool
    {
        return $this->recurrence !== null;
    }

    /**
     * Get the array shape consumed directly as a FullCalendar event object.
     *
     * Datetimes are always serialized without a timezone offset (floating
     * local/"wall clock" time), so FullCalendar and its rrule plugin render
     * them identically regardless of the viewer's browser timezone, rather
     * than reinterpreting them as an absolute UTC instant. This app has no
     * distributed-team timezone support — a deliberate v1 limitation.
     *
     * @return array<string, mixed>
     */
    public function toCalendarArray(): array
    {
        $base = [
            'id' => "event-{$this->id}",
            'title' => $this->title,
            'allDay' => $this->all_day,
            'editable' => ! $this->isRecurring(),
            'backgroundColor' => $this->color->hex(),
            'borderColor' => $this->color->hex(),
            'extendedProps' => [
                'kind' => 'event',
                'recordId' => $this->id,
                'description' => $this->description ?? '',
                'location' => $this->location ?? '',
                'colorToken' => $this->color->value,
                'recurring' => $this->isRecurring(),
                'recurrence' => $this->recurrence?->value,
            ],
        ];

        if (! $this->isRecurring()) {
            return [...$base,
                'start' => $this->starts_at->format('Y-m-d\TH:i:s'),
                'end' => $this->ends_at?->format('Y-m-d\TH:i:s'),
            ];
        }

        return [...$base,
            'rrule' => [
                'freq' => $this->recurrence->value,
                'dtstart' => $this->all_day
                    ? $this->starts_at->format('Y-m-d')
                    : $this->starts_at->format('Y-m-d\TH:i:s'),
            ],
            'duration' => $this->all_day
                ? ['days' => max(1, (int) $this->starts_at->diffInDays($this->ends_at ?? $this->starts_at) + 1)]
                : $this->durationString(),
        ];
    }

    /**
     * Get the event's duration as an "HH:mm:ss" string, defaulting to 30
     * minutes when no end time is set.
     */
    private function durationString(): string
    {
        $minutes = $this->ends_at !== null
            ? max(1, (int) $this->starts_at->diffInMinutes($this->ends_at))
            : 30;

        return sprintf('%02d:%02d:00', intdiv($minutes, 60), $minutes % 60);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'all_day' => 'boolean',
            'color' => EventColor::class,
            'recurrence' => EventRecurrence::class,
        ];
    }
}
