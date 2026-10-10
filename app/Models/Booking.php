<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $team_id
 * @property int $booking_link_id
 * @property int|null $contact_id
 * @property int|null $opportunity_id
 * @property int|null $event_id
 * @property string $first_name
 * @property string $last_name
 * @property string $email
 * @property string|null $company
 * @property string|null $notes
 * @property Carbon $starts_at
 * @property Carbon $ends_at
 * @property string $timezone
 * @property BookingStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'team_id', 'booking_link_id', 'contact_id', 'opportunity_id', 'event_id',
    'first_name', 'last_name', 'email', 'company', 'notes', 'starts_at',
    'ends_at', 'timezone', 'status',
])]
class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    /**
     * Get the team this booking belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the booking link used for this booking.
     *
     * @return BelongsTo<BookingLink, $this>
     */
    public function bookingLink(): BelongsTo
    {
        return $this->belongsTo(BookingLink::class);
    }

    /**
     * Get the contact created or reused by this booking.
     *
     * @return BelongsTo<Contact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Get the opportunity created by this booking.
     *
     * @return BelongsTo<Opportunity, $this>
     */
    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    /**
     * Get the calendar event created by this booking.
     *
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the booker's full name.
     */
    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
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
            'status' => BookingStatus::class,
        ];
    }
}
