<?php

namespace App\Models;

use App\Enums\RequestLogMessageAuthorType;
use Database\Factories\RequestLogMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property int $id
 * @property int $request_log_id
 * @property RequestLogMessageAuthorType $author_type
 * @property int|null $user_id
 * @property int|null $contact_id
 * @property string $body
 */
#[Fillable(['request_log_id', 'author_type', 'user_id', 'contact_id', 'body'])]
class RequestLogMessage extends Model implements HasMedia
{
    /** @use HasFactory<RequestLogMessageFactory> */
    use HasFactory, InteractsWithMedia;

    /**
     * Get the request log this message belongs to.
     *
     * @return BelongsTo<RequestLog, $this>
     */
    public function requestLog(): BelongsTo
    {
        return $this->belongsTo(RequestLog::class);
    }

    /**
     * Get the team user who authored this message, if any.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the client contact who authored this message, if any.
     *
     * @return BelongsTo<Contact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Register the media collections for this model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments');
    }

    /**
     * Get the attachments for this message.
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
     * Get the array shape used for request thread messages.
     *
     * @return array<string, mixed>
     */
    public function toThreadArray(): array
    {
        return [
            'id' => $this->id,
            'authorType' => $this->author_type->value,
            'authorLabel' => $this->authorLabel(),
            'body' => $this->body,
            'createdAt' => $this->created_at?->format('M j, Y') ?? '',
            'attachments' => $this->attachmentsList(),
        ];
    }

    /**
     * Get the reader-facing author label.
     */
    public function authorLabel(): string
    {
        if ($this->author_type === RequestLogMessageAuthorType::Team) {
            return $this->user?->name ?? 'Team';
        }

        return $this->contact?->displayName() ?? 'Client';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'author_type' => RequestLogMessageAuthorType::class,
        ];
    }
}
