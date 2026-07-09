<?php

namespace App\Models;

use App\Enums\TaskStatus;
use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property int $id
 * @property int $project_id
 * @property string $title
 * @property TaskStatus $status
 * @property string|null $description
 * @property list<string>|null $tags
 */
#[Fillable(['project_id', 'title', 'status', 'description', 'tags'])]
class Task extends Model implements HasMedia
{
    /** @use HasFactory<TaskFactory> */
    use HasFactory, InteractsWithMedia;

    /**
     * Get the project this task belongs to.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the attachments for this task.
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
     * Get the array shape used for the project board's lightweight task list.
     *
     * @return array<string, mixed>
     */
    public function toListItem(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'done' => $this->status === TaskStatus::Done,
        ];
    }

    /**
     * Get the array shape used for the project show page's task board/list.
     *
     * @return array<string, mixed>
     */
    public function toDetailArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status->value,
            'description' => $this->description ?? '',
            'tags' => $this->tags ?? [],
            'attachments' => $this->attachmentsList(),
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
            'status' => TaskStatus::class,
            'tags' => 'array',
        ];
    }
}
