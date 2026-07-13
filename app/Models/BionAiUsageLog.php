<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $user_id
 * @property int|null $conversation_id
 * @property string $provider
 * @property string $model
 * @property int $input_tokens
 * @property int $output_tokens
 * @property int $estimated_cost_micros
 */
#[Fillable(['team_id', 'user_id', 'conversation_id', 'provider', 'model', 'input_tokens', 'output_tokens', 'estimated_cost_micros'])]
class BionAiUsageLog extends Model
{
    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * Get the team this usage log belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the user who triggered this usage, if still present.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the conversation this usage was incurred in, if any.
     *
     * @return BelongsTo<BionAiConversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(BionAiConversation::class, 'conversation_id');
    }
}
