<?php

namespace App\Models;

use Database\Factories\BookingLinkFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property bool $is_active
 * @property int $duration_minutes
 * @property int $buffer_before_minutes
 * @property int $buffer_after_minutes
 * @property string $timezone
 * @property array<string, mixed> $availability
 * @property int $min_notice_minutes
 * @property int $max_days_ahead
 * @property string|null $location
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'team_id', 'name', 'slug', 'description', 'is_active', 'duration_minutes',
    'buffer_before_minutes', 'buffer_after_minutes', 'timezone', 'availability',
    'min_notice_minutes', 'max_days_ahead', 'location',
])]
class BookingLink extends Model
{
    /** @use HasFactory<BookingLinkFactory> */
    use HasFactory;

    /**
     * Default weekly availability for new booking links.
     *
     * @return array<string, array<int, array{start: string, end: string}>>
     */
    public static function defaultAvailability(): array
    {
        return [
            'monday' => [['start' => '09:00', 'end' => '17:00']],
            'tuesday' => [['start' => '09:00', 'end' => '17:00']],
            'wednesday' => [['start' => '09:00', 'end' => '17:00']],
            'thursday' => [['start' => '09:00', 'end' => '17:00']],
            'friday' => [['start' => '09:00', 'end' => '17:00']],
            'saturday' => [],
            'sunday' => [],
        ];
    }

    /**
     * Get the team this booking link belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get bookings created from this link.
     *
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the public path for this booking link.
     */
    public function publicPath(): string
    {
        return route('public-booking-link.show', [
            'team' => $this->team->leadFormPublicSlug(),
            'bookingLink' => $this->slug,
        ], false);
    }

    /**
     * Get the array shape used by authenticated booking link pages.
     *
     * @return array<string, mixed>
     */
    public function toListArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description ?? '',
            'isActive' => $this->is_active,
            'durationMinutes' => $this->duration_minutes,
            'bufferBeforeMinutes' => $this->buffer_before_minutes,
            'bufferAfterMinutes' => $this->buffer_after_minutes,
            'timezone' => $this->timezone,
            'availability' => $this->availability,
            'minNoticeMinutes' => $this->min_notice_minutes,
            'maxDaysAhead' => $this->max_days_ahead,
            'location' => $this->location ?? '',
            'publicUrl' => $this->publicPath(),
            'bookingsCount' => (int) ($this->bookings_count ?? $this->bookings()->count()),
            'createdAt' => $this->created_at?->format('M j, Y') ?? '',
        ];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'availability' => 'array',
            'duration_minutes' => 'integer',
            'buffer_before_minutes' => 'integer',
            'buffer_after_minutes' => 'integer',
            'min_notice_minutes' => 'integer',
            'max_days_ahead' => 'integer',
        ];
    }
}
