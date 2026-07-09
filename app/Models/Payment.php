<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $document_id
 * @property string $method
 * @property int $amount_value
 * @property CarbonInterface $paid_at
 * @property string|null $notes
 */
#[Fillable(['method', 'amount_value', 'paid_at', 'notes'])]
class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory;

    /**
     * Get the document (invoice) this payment belongs to.
     *
     * @return BelongsTo<Document, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the array shape used on the invoice show page.
     *
     * @return array<string, mixed>
     */
    public function toPaymentArray(): array
    {
        return [
            'id' => $this->id,
            'label' => $this->method,
            'amount' => Document::money($this->amount_value),
            'recordedAt' => $this->paid_at->format('M j, Y'),
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
            'paid_at' => 'date',
        ];
    }
}
