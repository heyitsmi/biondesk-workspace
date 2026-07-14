<?php

namespace App\Models;

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use Database\Factories\RequestLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property int $id
 * @property int $project_id
 * @property string $text
 * @property RequestLogSource $source
 * @property RequestLogClassification $classification
 * @property string|null $notes
 * @property bool $visible_to_client
 */
#[Fillable(['project_id', 'text', 'source', 'classification', 'notes', 'visible_to_client'])]
class RequestLog extends Model implements HasMedia
{
    /** @use HasFactory<RequestLogFactory> */
    use HasFactory, InteractsWithMedia;

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
            'text' => $this->text,
            'source' => $this->source->value,
            'date' => $this->created_at?->diffForHumans() ?? '',
            'classification' => $this->classification->value,
            'notes' => $this->notes ?? '',
            'attachments' => $this->attachmentsList(),
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
            'visible_to_client' => 'boolean',
        ];
    }
}
