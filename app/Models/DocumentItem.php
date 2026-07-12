<?php

namespace App\Models;

use Database\Factories\DocumentItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $document_id
 * @property string $name
 * @property string|null $description
 * @property int $quantity
 * @property int $unit_price_value
 * @property int $sort_order
 */
#[Fillable(['name', 'description', 'quantity', 'unit_price_value', 'sort_order'])]
class DocumentItem extends Model
{
    /** @use HasFactory<DocumentItemFactory> */
    use HasFactory;

    /**
     * Get the document this line item belongs to.
     *
     * @return BelongsTo<Document, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the line total: quantity * unit price.
     */
    public function lineTotalValue(): int
    {
        return $this->quantity * $this->unit_price_value;
    }

    /**
     * Get the array shape used on document create/edit/show pages.
     *
     * @return array<string, mixed>
     */
    public function toItemArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description ?? '',
            'quantity' => $this->quantity,
            'unitPriceValue' => $this->unit_price_value,
            'lineTotalValue' => $this->lineTotalValue(),
        ];
    }
}
