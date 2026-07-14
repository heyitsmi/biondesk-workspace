<?php

namespace App\Models;

use Database\Factories\EmbeddingIndexEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $project_id
 * @property string $embeddable_type
 * @property int $embeddable_id
 * @property string $embedding_model
 * @property int $embedding_dimensions
 * @property string $content_hash
 * @property string $embedded_text
 * @property list<float>|null $embedding
 * @property array<string, mixed>|null $metadata
 * @property Carbon|null $embedded_at
 * @property Carbon|null $failed_at
 * @property string|null $failure_reason
 */
#[Fillable([
    'team_id',
    'project_id',
    'embeddable_type',
    'embeddable_id',
    'embedding_model',
    'embedding_dimensions',
    'content_hash',
    'embedded_text',
    'embedding',
    'metadata',
    'embedded_at',
    'failed_at',
    'failure_reason',
])]
class EmbeddingIndexEntry extends Model
{
    /** @use HasFactory<EmbeddingIndexEntryFactory> */
    use HasFactory;

    /**
     * Get the indexed model.
     *
     * @return MorphTo<Model, $this>
     */
    public function embeddable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the team this index entry belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the project scope for this entry, if any.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'embedding' => 'array',
            'metadata' => 'array',
            'embedded_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }
}
