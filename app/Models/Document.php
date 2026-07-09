<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use Carbon\CarbonInterface;
use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Spatie\Activitylog\Enums\ActivityEvent;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property DocumentType $type
 * @property int|null $contact_id
 * @property int|null $opportunity_id
 * @property int|null $project_id
 * @property string $number
 * @property string|null $title
 * @property DocumentStatus $status
 * @property CarbonInterface|null $issued_at
 * @property CarbonInterface|null $valid_until
 * @property CarbonInterface|null $due_at
 * @property string $currency
 * @property int $discount_percent
 * @property int $tax_percent
 * @property string|null $content
 * @property string|null $notes
 * @property string|null $public_token
 */
#[Fillable(['type', 'contact_id', 'opportunity_id', 'project_id', 'number', 'title', 'status', 'issued_at', 'valid_until', 'due_at', 'currency', 'discount_percent', 'tax_percent', 'content', 'notes'])]
class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory;

    use LogsActivity;

    /**
     * Get the team this document belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the contact this document is addressed to.
     *
     * @return BelongsTo<Contact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Get the opportunity this document is linked to, if any.
     *
     * @return BelongsTo<Opportunity, $this>
     */
    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    /**
     * Get the project this document is linked to, if any.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the line items for this document.
     *
     * @return HasMany<DocumentItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(DocumentItem::class)->orderBy('sort_order');
    }

    /**
     * Generate the next sequential document number for the given team and type,
     * e.g. "P-2026-0001", "QUO-2026-0001", "INV-2026-0001".
     */
    public static function nextNumber(Team $team, DocumentType $type): string
    {
        $year = now()->year;
        $prefix = "{$type->numberPrefix()}-{$year}-";

        $count = $team->documents()
            ->where('type', $type)
            ->where('number', 'like', "{$prefix}%")
            ->count();

        return $prefix.str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);
    }

    /**
     * Replace this document's line items with the given set.
     *
     * @param  array<int, array{name: string, description: string|null, quantity: int, unit_price_value: int}>  $items
     */
    public function syncItems(array $items): void
    {
        $this->items()->delete();

        foreach ($items as $index => $item) {
            $this->items()->create([
                'name' => $item['name'],
                'description' => $item['description'] ?? null,
                'quantity' => $item['quantity'],
                'unit_price_value' => $item['unit_price_value'],
                'sort_order' => $index,
            ]);
        }

        $this->unsetRelation('items');
    }

    /**
     * Create a new draft document of the given type, copying this document's
     * client/project/currency and line items. Used for proposal -> quote/invoice
     * and quote -> invoice conversions.
     */
    public function duplicateAs(DocumentType $type): self
    {
        $copy = $this->team->documents()->create([
            'type' => $type,
            'number' => self::nextNumber($this->team, $type),
            'contact_id' => $this->contact_id,
            'project_id' => $this->project_id,
            'opportunity_id' => $this->opportunity_id,
            'title' => $this->title,
            'status' => DocumentStatus::Draft,
            'currency' => $this->currency,
            'discount_percent' => $this->discount_percent,
            'tax_percent' => $this->tax_percent,
            'notes' => $this->notes,
        ]);

        $copy->syncItems($this->items->map(fn (DocumentItem $item) => [
            'name' => $item->name,
            'description' => $item->description,
            'quantity' => $item->quantity,
            'unit_price_value' => $item->unit_price_value,
        ])->all());

        return $copy;
    }

    /**
     * Get a unique public share token for this document, generating one if needed.
     */
    public function ensurePublicToken(): string
    {
        if ($this->public_token === null) {
            $this->public_token = Str::random(32);
            $this->save();
        }

        return $this->public_token;
    }

    /**
     * Get the sum of each line item's quantity * unit price, before discount/tax.
     */
    public function subtotalValue(): int
    {
        return $this->items->sum(fn (DocumentItem $item) => $item->quantity * $item->unit_price_value);
    }

    /**
     * Get the discount amount deducted from the subtotal.
     */
    public function discountValue(): int
    {
        return (int) round($this->subtotalValue() * $this->discount_percent / 100);
    }

    /**
     * Get the tax amount applied after the discount.
     */
    public function taxValue(): int
    {
        return (int) round(($this->subtotalValue() - $this->discountValue()) * $this->tax_percent / 100);
    }

    /**
     * Get the final total: subtotal - discount + tax.
     */
    public function totalValue(): int
    {
        return $this->subtotalValue() - $this->discountValue() + $this->taxValue();
    }

    /**
     * Get the formatted total, e.g. "$5,000".
     */
    public function formattedTotal(): string
    {
        return '$'.number_format($this->totalValue());
    }

    /**
     * Determine whether this invoice is overdue: sent/viewed and past its due date.
     * This is a computed display state, not a persisted status value, since real
     * paid/unpaid tracking depends on the Payment model (a later phase).
     */
    public function isOverdue(): bool
    {
        if ($this->type !== DocumentType::Invoice) {
            return false;
        }

        if (! in_array($this->status, [DocumentStatus::Sent, DocumentStatus::Viewed], true)) {
            return false;
        }

        return $this->due_at !== null && $this->due_at->isPast();
    }

    /**
     * Get the display status value, substituting the computed "overdue" state
     * for invoices when applicable.
     */
    public function displayStatus(): string
    {
        return $this->isOverdue() ? 'overdue' : $this->status->value;
    }

    /**
     * Get the display status label.
     */
    public function displayStatusLabel(): string
    {
        return $this->isOverdue() ? 'Overdue' : $this->status->label();
    }

    /**
     * Get the display status tone.
     */
    public function displayStatusTone(): string
    {
        return $this->isOverdue() ? 'danger' : $this->status->tone();
    }

    /**
     * Get the client display name for this document, via its contact.
     */
    public function clientName(): string
    {
        if ($this->contact === null) {
            return '';
        }

        return $this->contact->company ?: $this->contact->fullName();
    }

    /**
     * Get the linked project/context label for quotation & invoice list rows.
     */
    public function contextLabel(): string
    {
        return $this->project->title ?? '';
    }

    /**
     * Get the public share URL for this document, matching the current
     * `/d/{team:slug}/{document}` route (number-based lookup).
     */
    public function shareUrl(): string
    {
        return url('/d/'.$this->team->slug.'/'.mb_strtolower($this->number));
    }

    /**
     * Get the {id, title} shape for a linked project, or null.
     *
     * @return array{id: int, title: string}|null
     */
    public function linkedProjectArray(): ?array
    {
        if ($this->project === null) {
            return null;
        }

        return ['id' => $this->project->id, 'title' => $this->project->title];
    }

    /**
     * Format a whole-dollar amount, e.g. "$5,000".
     */
    public static function money(int $value): string
    {
        return '$'.number_format($value);
    }

    /**
     * Get the contact's billing address, or an empty string when there is no contact.
     */
    private function contactAddress(): string
    {
        $contact = $this->contact;

        return $contact === null ? '' : ($contact->billing_address ?? '');
    }

    /**
     * Get the contact's email, or an empty string when there is no contact.
     */
    private function contactEmail(): string
    {
        $contact = $this->contact;

        return $contact === null ? '' : ($contact->email ?? '');
    }

    /**
     * Get a Unix timestamp for sorting, or 0 when the given date is null.
     */
    private static function timestampOf(?CarbonInterface $date): int
    {
        return $date === null ? 0 : $date->getTimestamp();
    }

    /**
     * Get the array shape used for proposal board/list rows.
     *
     * @return array<string, mixed>
     */
    public function toProposalListItem(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title ?? '',
            'number' => $this->number,
            'client' => $this->clientName(),
            'stage' => $this->status->value,
            'stageLabel' => $this->status->label(),
            'tone' => $this->status->tone(),
            'amount' => $this->formattedTotal(),
            'amountValue' => $this->totalValue(),
            'updatedAt' => $this->updated_at?->diffForHumans() ?? '',
            'dateSort' => self::timestampOf($this->updated_at),
            'shareUrl' => $this->shareUrl(),
            'items' => $this->items->map(fn (DocumentItem $item) => [
                'label' => $item->name,
                'amount' => self::money($item->lineTotalValue()),
            ])->all(),
        ];
    }

    /**
     * Get the array shape used for the proposal show page.
     *
     * @return array<string, mixed>
     */
    public function toProposalDetailArray(): array
    {
        return [...$this->toProposalListItem(),
            'datePrepared' => $this->issued_at?->format('M j, Y') ?? '',
            'datePreparedIso' => $this->issued_at?->toDateString() ?? '',
            'validUntil' => $this->valid_until?->format('M j, Y') ?? '',
            'validUntilIso' => $this->valid_until?->toDateString() ?? '',
            'preparedFor' => [
                'name' => $this->clientName(),
                'attn' => $this->contact?->fullName() ?? '',
                'address' => $this->contactAddress(),
                'email' => $this->contactEmail(),
            ],
            'business' => [
                'name' => $this->team->name,
                'address' => '',
                'email' => '',
            ],
            'summary' => $this->content ?? '',
            'scopeIntro' => '',
            'scopeItems' => [],
            'timeline' => '',
            'lineItems' => $this->items->map(fn (DocumentItem $item) => [
                'name' => $item->name,
                'description' => $item->description ?? '',
                'qty' => $item->quantity,
                'price' => self::money($item->unit_price_value),
                'total' => self::money($item->lineTotalValue()),
            ])->all(),
            'subtotal' => self::money($this->subtotalValue()),
            'taxLabel' => "Tax ({$this->tax_percent}%)",
            'taxAmount' => self::money($this->taxValue()),
            'total' => self::money($this->totalValue()),
            'notes' => $this->notes ?? '',
            'linkedProject' => $this->linkedProjectArray(),
            'currency' => $this->currency,
        ];
    }

    /**
     * Get the array shape used for quotation list rows.
     *
     * @return array<string, mixed>
     */
    public function toQuotationListItem(): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'client' => $this->clientName(),
            'context' => $this->contextLabel(),
            'status' => $this->displayStatus(),
            'statusLabel' => $this->displayStatusLabel(),
            'tone' => $this->displayStatusTone(),
            'issuedAt' => $this->issued_at?->format('M j, Y') ?? '',
            'issuedSort' => self::timestampOf($this->issued_at),
            'expiryAt' => $this->valid_until?->format('M j, Y') ?? '',
            'expirySort' => self::timestampOf($this->valid_until),
            'amount' => $this->formattedTotal(),
            'amountValue' => $this->totalValue(),
        ];
    }

    /**
     * Get the array shape used for the quotation show page.
     *
     * @return array<string, mixed>
     */
    public function toQuotationDetailArray(): array
    {
        return [...$this->toQuotationListItem(),
            'validityLabel' => $this->valid_until !== null ? "Valid until {$this->valid_until->format('M j, Y')}" : '',
            'business' => [
                'name' => $this->team->name,
                'address' => '',
                'email' => '',
            ],
            'preparedFor' => [
                'name' => $this->clientName(),
                'attn' => $this->contact?->fullName() ?? '',
                'address' => $this->contactAddress(),
                'email' => $this->contactEmail(),
            ],
            'lineItems' => $this->items->map(fn (DocumentItem $item) => [
                'name' => $item->name,
                'description' => $item->description ?? '',
                'qty' => $item->quantity,
                'price' => self::money($item->unit_price_value),
                'total' => self::money($item->lineTotalValue()),
            ])->all(),
            'subtotal' => self::money($this->subtotalValue()),
            'discountLabel' => "Discount ({$this->discount_percent}%)",
            'discountAmount' => self::money($this->discountValue()),
            'total' => self::money($this->totalValue()),
            'terms' => $this->notes ?? '',
            'linkedProject' => $this->linkedProjectArray(),
            'currency' => $this->currency,
        ];
    }

    /**
     * Get the array shape used for invoice list rows.
     *
     * @return array<string, mixed>
     */
    public function toInvoiceListItem(): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'client' => $this->clientName(),
            'context' => $this->contextLabel(),
            'status' => $this->displayStatus(),
            'statusLabel' => $this->displayStatusLabel(),
            'tone' => $this->displayStatusTone(),
            'issuedAt' => $this->issued_at?->format('M j, Y') ?? '',
            'issuedSort' => self::timestampOf($this->issued_at),
            'dueAt' => $this->due_at?->format('M j, Y') ?? '',
            'dueSort' => self::timestampOf($this->due_at),
            'amount' => $this->formattedTotal(),
            'amountValue' => $this->totalValue(),
        ];
    }

    /**
     * Get the array shape used for the invoice show page.
     *
     * @return array<string, mixed>
     */
    public function toInvoiceDetailArray(): array
    {
        return [...$this->toInvoiceListItem(),
            'dueInLabel' => $this->due_at !== null ? ($this->isOverdue() ? "Due {$this->due_at->diffForHumans()}" : "Due {$this->due_at->diffForHumans()}") : '',
            'business' => [
                'name' => $this->team->name,
                'address' => '',
                'email' => '',
            ],
            'billTo' => [
                'name' => $this->clientName(),
                'attn' => $this->contact?->fullName() ?? '',
                'address' => $this->contactAddress(),
                'email' => $this->contactEmail(),
            ],
            'lineItems' => $this->items->map(fn (DocumentItem $item) => [
                'name' => $item->name,
                'description' => $item->description ?? '',
                'qty' => $item->quantity,
                'price' => self::money($item->unit_price_value),
                'total' => self::money($item->lineTotalValue()),
            ])->all(),
            'subtotal' => self::money($this->subtotalValue()),
            'taxLabel' => "Tax ({$this->tax_percent}%)",
            'taxAmount' => self::money($this->taxValue()),
            'total' => self::money($this->totalValue()),
            'amountPaid' => self::money(0),
            'amountDue' => self::money($this->totalValue()),
            'paymentInstructions' => $this->notes ?? '',
            'payments' => [],
            'linkedProject' => $this->linkedProjectArray(),
            'currency' => $this->currency,
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
            'type' => DocumentType::class,
            'status' => DocumentStatus::class,
            'issued_at' => 'date',
            'valid_until' => 'date',
            'due_at' => 'date',
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
                ActivityEvent::Created->value => "{$this->type->label()} created",
                ActivityEvent::Updated->value => "{$this->type->label()} updated",
                ActivityEvent::Deleted->value => "{$this->type->label()} deleted",
                default => $eventName,
            });
    }
}
