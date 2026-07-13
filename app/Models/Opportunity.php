<?php

namespace App\Models;

use App\Enums\OpportunityPriority;
use App\Enums\OpportunityStage;
use Database\Factories\OpportunityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Enums\ActivityEvent;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property int $id
 * @property int $team_id
 * @property int $contact_id
 * @property string $title
 * @property OpportunityStage $stage
 * @property string|null $source
 * @property int $amount_value
 * @property OpportunityPriority $priority
 * @property int|null $win_probability
 * @property Carbon|null $close_date
 * @property string|null $description
 */
#[Fillable(['title', 'stage', 'source', 'amount_value', 'win_probability', 'priority', 'close_date', 'description', 'contact_id'])]
class Opportunity extends Model implements HasMedia
{
    /** @use HasFactory<OpportunityFactory> */
    use HasFactory;

    use InteractsWithMedia, LogsActivity;

    /**
     * Get the team this opportunity belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the contact this opportunity belongs to.
     *
     * @return BelongsTo<Contact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Get the project created from this opportunity, if any.
     *
     * @return HasOne<Project, $this>
     */
    public function project(): HasOne
    {
        return $this->hasOne(Project::class);
    }

    /**
     * Get the formatted amount, e.g. "$5,000".
     */
    public function formattedAmount(): string
    {
        return '$'.number_format($this->amount_value);
    }

    /**
     * Register the media collections for this model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments');
    }

    /**
     * Get the client-uploaded attachments (e.g. from the public lead form) as a
     * simple array of {name, url, size}.
     *
     * @return array<int, array{name: string, url: string, size: int}>
     */
    public function attachmentsArray(): array
    {
        return $this->getMedia('attachments')
            ->map(fn (Media $media) => [
                'name' => (string) $media->file_name,
                'url' => $media->getUrl(),
                'size' => (int) $media->size,
            ])
            ->values()
            ->all();
    }

    /**
     * Get {id, title, company} options for the team's opportunities that don't have a
     * project yet, used in the project create form's opportunity picker.
     *
     * @return array<int, array{id: int, title: string, company: string}>
     */
    public static function availableForProject(Team $team): array
    {
        return $team->opportunities()
            ->whereDoesntHave('project')
            ->with('contact')
            ->get()
            ->map(fn (self $opportunity) => [
                'id' => $opportunity->id,
                'title' => $opportunity->title,
                'company' => $opportunity->contact->company ?: $opportunity->contact->fullName(),
            ])
            ->values()
            ->all();
    }

    /**
     * Get the array shape used for opportunity board/list rows.
     *
     * @return array<string, mixed>
     */
    public function toListItem(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'company' => $this->contact->company ?? '',
            'contact' => $this->contact->fullName(),
            'source' => $this->source ?? '',
            'amount' => $this->formattedAmount(),
            'amountValue' => $this->amount_value,
            'winProbability' => $this->win_probability,
            'stage' => $this->stage->value,
            'stageLabel' => $this->stage->label(),
            'tone' => $this->stage->tone(),
            'lastActivity' => $this->updated_at?->diffForHumans() ?? '',
            'activityOrder' => $this->updated_at->timestamp,
            'summary' => $this->description ?? '',
            'projectId' => $this->project?->id,
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
            'stage' => OpportunityStage::class,
            'priority' => OpportunityPriority::class,
            'close_date' => 'date',
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
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn (string $eventName) => match ($eventName) {
                ActivityEvent::Created->value => "New opportunity: {$this->title}",
                ActivityEvent::Updated->value => "Opportunity updated: {$this->title}",
                ActivityEvent::Deleted->value => "Opportunity removed: {$this->title}",
                default => $eventName,
            });
    }
}
