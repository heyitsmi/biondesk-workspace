<?php

namespace App\Models;

use App\Enums\ReminderJobType;
use Carbon\CarbonInterface;
use Database\Factories\ReminderJobFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $document_id
 * @property ReminderJobType $type
 * @property CarbonInterface $scheduled_at
 * @property CarbonInterface|null $sent_at
 * @property CarbonInterface|null $dismissed_at
 */
#[Fillable(['document_id', 'type', 'scheduled_at', 'sent_at', 'dismissed_at'])]
class ReminderJob extends Model
{
    /** @use HasFactory<ReminderJobFactory> */
    use HasFactory;

    /**
     * Get the document (invoice or quote) this reminder is for.
     *
     * @return BelongsTo<Document, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the display bucket for grouping on the reminders page.
     */
    public function bucket(): string
    {
        if ($this->scheduled_at->isPast() && ! $this->scheduled_at->isToday()) {
            return 'overdue';
        }

        if ($this->scheduled_at->isToday()) {
            return 'today';
        }

        return 'upcoming';
    }

    /**
     * Get the {kind, label, id} shape linking back to the underlying document.
     *
     * @return array{kind: string, label: string, id: int}
     */
    public function linkArray(): array
    {
        return [
            'kind' => $this->type === ReminderJobType::QuoteUnresponded ? 'quotation' : 'invoice',
            'label' => $this->document->number,
            'id' => $this->document_id,
        ];
    }

    /**
     * Get the array shape used on the reminders page.
     *
     * @return array<string, mixed>
     */
    public function toReminderArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->type->title($this->document->number),
            'bucket' => $this->bucket(),
            'dueLabel' => $this->scheduled_at->format('M j, Y'),
            'dueSort' => $this->scheduled_at->timestamp,
            'completed' => $this->dismissed_at !== null,
            'link' => $this->linkArray(),
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
            'type' => ReminderJobType::class,
            'scheduled_at' => 'date',
            'sent_at' => 'datetime',
            'dismissed_at' => 'datetime',
        ];
    }
}
