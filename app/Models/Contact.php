<?php

namespace App\Models;

use App\Enums\ContactStatus;
use App\Enums\ContactType;
use Database\Factories\ContactFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property ContactType $type
 * @property ContactStatus $status
 * @property string $first_name
 * @property string|null $last_name
 * @property string|null $company
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $role
 * @property string|null $location
 * @property string|null $website
 * @property string|null $notes
 * @property string|null $billing_address
 */
#[Fillable([
    'type', 'status', 'first_name', 'last_name', 'company', 'email',
    'phone', 'role', 'location', 'website', 'notes', 'billing_address',
])]
class Contact extends Model
{
    /** @use HasFactory<ContactFactory> */
    use HasFactory;

    use LogsActivity;

    /**
     * Get the team this contact belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the opportunities for this contact.
     *
     * @return HasMany<Opportunity, $this>
     */
    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }

    /**
     * Get the contact's display code, e.g. "CNT-00124".
     */
    public function code(): string
    {
        return 'CNT-'.str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get the contact's full name.
     */
    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Get the contact's initials, e.g. "JS".
     */
    public function initials(): string
    {
        $parts = array_filter([$this->first_name, $this->last_name]);

        return mb_strtoupper(mb_substr(implode('', array_map(
            fn (string $part) => mb_substr($part, 0, 1),
            $parts,
        )), 0, 2));
    }

    /**
     * Get {id, name} options for a team's contacts, used in dropdowns.
     *
     * @return array<int, array{id: int, name: string}>
     */
    public static function optionsFor(Team $team): array
    {
        return $team->contacts()
            ->get()
            ->map(fn (self $contact) => [
                'id' => $contact->id,
                'name' => $contact->company ?: $contact->fullName(),
            ])
            ->values()
            ->all();
    }

    /**
     * Get the array shape used for contact list rows.
     *
     * @return array<string, mixed>
     */
    public function toListItem(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code(),
            'fullName' => $this->fullName(),
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'initials' => $this->initials(),
            'company' => $this->company,
            'email' => $this->email,
            'phone' => $this->phone,
            'type' => $this->type->value,
            'typeLabel' => $this->type->label(),
            'typeTone' => $this->type->tone(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'statusTone' => $this->status->tone(),
        ];
    }

    /**
     * Get the array shape used for the contact detail/edit pages.
     *
     * @return array<string, mixed>
     */
    public function toDetailArray(): array
    {
        return array_merge($this->toListItem(), [
            'role' => $this->role,
            'location' => $this->location,
            'website' => $this->website,
            'notes' => $this->notes,
            'billingAddress' => $this->billing_address,
            'relatedProjects' => [],
            'relatedInvoices' => [],
            'notesAndFiles' => [],
            'activity' => $this->activitiesAsSubject()
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($activity) => [
                    'id' => $activity->id,
                    'title' => $activity->description,
                    'description' => '',
                    'when' => $activity->created_at?->format('M j, Y \a\t g:i A') ?? '',
                    'tone' => 'muted',
                ])
                ->all(),
        ]);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => ContactType::class,
            'status' => ContactStatus::class,
        ];
    }

    /**
     * Get the options for logging activity on this model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
