<?php

namespace App\Models;

use Database\Factories\BionAiConversationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $team_id
 * @property int $user_id
 * @property string|null $title
 */
#[Fillable(['title'])]
class BionAiConversation extends Model
{
    /** @use HasFactory<BionAiConversationFactory> */
    use HasFactory;

    /**
     * Get the team this conversation belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the user who owns this conversation.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the messages in this conversation. Unordered — callers order
     * explicitly (`orderBy('created_at')->orderBy('id')` for thread order,
     * `orderByDesc('id')` for "the latest message"), since `created_at` alone
     * isn't unique enough to disambiguate messages created in the same
     * second (a tool round can produce several rows within milliseconds).
     *
     * @return HasMany<BionAiMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(BionAiMessage::class, 'conversation_id');
    }

    /**
     * Derive a short conversation title from the first user message.
     */
    public function deriveTitleFrom(string $firstUserMessage): string
    {
        return Str::limit(trim($firstUserMessage), 60);
    }
}
