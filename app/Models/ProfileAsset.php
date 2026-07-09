<?php

namespace App\Models;

use App\Enums\ProfileAssetCategory;
use Database\Factories\ProfileAssetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Spatie\Activitylog\Enums\ActivityEvent;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property int $id
 * @property int $team_id
 * @property ProfileAssetCategory $category
 * @property string $title
 * @property string|null $short_description
 * @property string|null $body
 */
#[Fillable(['team_id', 'category', 'title', 'short_description', 'body'])]
class ProfileAsset extends Model implements HasMedia
{
    /** @use HasFactory<ProfileAssetFactory> */
    use HasFactory;

    use InteractsWithMedia, LogsActivity;

    /**
     * Get the team this profile asset belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Register the media collections for this model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')->singleFile();
    }

    /**
     * Get the featured image URL, or null when none has been uploaded.
     */
    public function imageUrl(): ?string
    {
        $url = $this->getFirstMediaUrl('image');

        return $url === '' ? null : $url;
    }

    /**
     * Get a short plain-text excerpt of this asset's content, used for card previews.
     */
    public function excerpt(): string
    {
        if ($this->short_description !== null && $this->short_description !== '') {
            return $this->short_description;
        }

        return Str::limit((string) $this->body, 140);
    }

    /**
     * Get a single-line summary of this asset, used as AI generation context.
     */
    public function contextLine(): string
    {
        $summary = trim($this->excerpt().' '.(string) $this->body);

        return "[{$this->category->label()}] {$this->title}: ".Str::limit($summary, 400);
    }

    /**
     * Get the array shape used for the profile library index/edit pages.
     *
     * @return array<string, mixed>
     */
    public function toProfileArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->excerpt(),
            'category' => $this->category->value,
            'categoryLabel' => $this->category->label(),
            'icon' => $this->category->icon(),
            'updatedAt' => $this->updated_at?->diffForHumans() ?? '',
            'shortDescription' => $this->short_description ?? '',
            'body' => $this->body ?? '',
            'hasImage' => $this->hasMedia('image'),
            'imageUrl' => $this->imageUrl(),
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
            'category' => ProfileAssetCategory::class,
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
                ActivityEvent::Created->value => "New profile added: {$this->title}",
                ActivityEvent::Updated->value => "Profile updated: {$this->title}",
                ActivityEvent::Deleted->value => "Profile removed: {$this->title}",
                default => $eventName,
            });
    }
}
