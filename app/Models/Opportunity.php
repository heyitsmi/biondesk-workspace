<?php

namespace App\Models;

use App\Enums\OpportunityPriority;
use App\Enums\OpportunityStage;
use Database\Factories\OpportunityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property int $contact_id
 * @property string $title
 * @property OpportunityStage $stage
 * @property string|null $source
 * @property int $amount_value
 * @property OpportunityPriority $priority
 * @property Carbon|null $close_date
 * @property string|null $description
 */
#[Fillable(['title', 'stage', 'source', 'amount_value', 'priority', 'close_date', 'description', 'contact_id'])]
class Opportunity extends Model
{
    /** @use HasFactory<OpportunityFactory> */
    use HasFactory;

    use LogsActivity;

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
     * Get the formatted amount, e.g. "$5,000".
     */
    public function formattedAmount(): string
    {
        return '$'.number_format($this->amount_value);
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
            'stage' => $this->stage->value,
            'stageLabel' => $this->stage->label(),
            'tone' => $this->stage->tone(),
            'lastActivity' => $this->updated_at?->diffForHumans() ?? '',
            'activityOrder' => $this->updated_at->timestamp,
            'summary' => $this->description ?? '',
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
            ->dontLogEmptyChanges();
    }
}
