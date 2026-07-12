<?php

namespace App\Models;

use Database\Factories\RecurringInvoiceTemplateItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $recurring_invoice_template_id
 * @property string $name
 * @property string|null $description
 * @property int $quantity
 * @property int $unit_price_value
 * @property int $sort_order
 */
#[Fillable(['name', 'description', 'quantity', 'unit_price_value', 'sort_order'])]
class RecurringInvoiceTemplateItem extends Model
{
    /** @use HasFactory<RecurringInvoiceTemplateItemFactory> */
    use HasFactory;

    /**
     * Get the recurring invoice template this line item belongs to.
     *
     * @return BelongsTo<RecurringInvoiceTemplate, $this>
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(RecurringInvoiceTemplate::class, 'recurring_invoice_template_id');
    }

    /**
     * Get the line total: quantity * unit price.
     */
    public function lineTotalValue(): int
    {
        return $this->quantity * $this->unit_price_value;
    }

    /**
     * Get the array shape used on the recurring invoice create/edit/show pages.
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
