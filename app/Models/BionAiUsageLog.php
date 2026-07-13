<?php

namespace App\Models;

use Database\Factories\BionAiUsageLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

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
 * @property Carbon|null $created_at
 */
#[Fillable(['team_id', 'user_id', 'conversation_id', 'provider', 'model', 'input_tokens', 'output_tokens', 'estimated_cost_micros'])]
class BionAiUsageLog extends Model
{
    /** @use HasFactory<BionAiUsageLogFactory> */
    use HasFactory;

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

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

    /**
     * Format a micro-USD amount (1 USD = 1,000,000 micros) as a dollar
     * string. Always 4 decimals, since a single turn's cost is typically a
     * fraction of a cent and would round to "$0.00" at 2 decimals.
     */
    public static function formatCost(int $micros): string
    {
        return '$'.number_format($micros / 1_000_000, 4);
    }
}
