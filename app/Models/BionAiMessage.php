<?php

namespace App\Models;

use App\Enums\BionAiMessageRole;
use Database\Factories\BionAiMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $conversation_id
 * @property BionAiMessageRole $role
 * @property string|null $content
 * @property list<array{id: string, name: string, arguments: array<string, mixed>}>|null $tool_calls
 * @property string|null $tool_name
 * @property string|null $tool_call_id
 */
#[Fillable(['role', 'content', 'tool_calls', 'tool_name', 'tool_call_id'])]
class BionAiMessage extends Model
{
    /** @use HasFactory<BionAiMessageFactory> */
    use HasFactory;

    /**
     * Get the conversation this message belongs to.
     *
     * @return BelongsTo<BionAiConversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(BionAiConversation::class, 'conversation_id');
    }

    /**
     * Get the array shape consumed by the frontend chat thread.
     *
     * @return array<string, mixed>
     */
    public function toChatArray(): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role->value,
            'content' => $this->content,
            'toolName' => $this->tool_name,
            'createdAt' => $this->created_at?->toIso8601String(),
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
            'role' => BionAiMessageRole::class,
            'tool_calls' => 'array',
        ];
    }
}
