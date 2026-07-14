<?php

namespace App\Models;

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use App\Enums\RequestLogStatus;
use Database\Factories\RequestLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property int $id
 * @property string|null $uuid
 * @property int $project_id
 * @property string $text
 * @property RequestLogSource $source
 * @property RequestLogClassification $classification
 * @property RequestLogStatus $status
 * @property string|null $notes
 * @property bool $visible_to_client
 */
#[Fillable(['project_id', 'text', 'source', 'classification', 'status', 'notes', 'visible_to_client'])]
class RequestLog extends Model implements HasMedia
{
    /** @use HasFactory<RequestLogFactory> */
    use HasFactory, InteractsWithMedia;

    /**
     * Assign a stable UUID used for full-page request log URLs.
     */
    protected static function booted(): void
    {
        static::creating(function (self $requestLog): void {
            $requestLog->uuid ??= (string) Str::uuid();
        });
    }

    /**
     * Get the project this request log belongs to.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the thread messages for this request log.
     *
     * @return HasMany<RequestLogMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(RequestLogMessage::class)->oldest();
    }

    /**
     * Get the attachments for this request log.
     *
     * @return array<int, array{name: string, url: string}>
     */
    public function attachmentsList(): array
    {
        return $this->getMedia('attachments')
            ->map(fn ($media) => [
                'name' => $media->file_name,
                'url' => $media->getUrl(),
            ])
            ->all();
    }

    /**
     * Register the media collections for this model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments');
    }

    /**
     * Get the array shape used for the project show page's request log tab.
     *
     * @return array<string, mixed>
     */
    public function toDetailArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'text' => $this->text,
            'source' => $this->source->value,
            'date' => $this->created_at?->diffForHumans() ?? '',
            'classification' => $this->classification->value,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'statusTone' => $this->status->tone(),
            'notes' => $this->notes ?? '',
            'attachments' => $this->attachmentsList(),
            'messages' => $this->messages->map->toThreadArray()->all(),
        ];
    }

    /**
     * Get the safe array shape used on the public client portal.
     *
     * @return array<string, mixed>
     */
    public function toClientPortalArray(): array
    {
        return [
            'id' => $this->id,
            'text' => $this->text,
            'sourceLabel' => $this->source->label(),
            'createdAt' => $this->created_at?->format('M j, Y') ?? '',
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'statusTone' => $this->status->tone(),
            'attachments' => $this->attachmentsList(),
            'messages' => $this->messages->map->toThreadArray()->all(),
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
            'source' => RequestLogSource::class,
            'classification' => RequestLogClassification::class,
            'status' => RequestLogStatus::class,
            'visible_to_client' => 'boolean',
        ];
    }
}
