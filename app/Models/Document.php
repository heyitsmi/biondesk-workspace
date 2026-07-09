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
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

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
class Document extends Model implements HasMedia
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory;

    use InteractsWithMedia;
    use LogsActivity;

    /**
     * Assign a public share token to every document as soon as it's created.
     */
    protected static function booted(): void
    {
        static::creating(function (self $document) {
            $document->public_token ??= Str::random(32);
        });
    }

    /**
     * Register the media collections for this model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('pdf')->singleFile();
    }

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
     * Get the payments recorded against this document (invoice).
     *
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderBy('paid_at');
    }

    /**
     * Get the reminder jobs generated for this document.
     *
     * @return HasMany<ReminderJob, $this>
     */
    public function reminderJobs(): HasMany
    {
        return $this->hasMany(ReminderJob::class);
    }

    /**
     * Get the sum of all payments recorded against this invoice.
     */
    public function amountPaidValue(): int
    {
        return $this->payments->sum('amount_value');
    }

    /**
     * Get the remaining balance: total minus payments received so far.
     */
    public function amountDueValue(): int
    {
        return max(0, $this->totalValue() - $this->amountPaidValue());
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
     * Get the public share URL for this document, token-based per decision 0.9.
     */
    public function shareUrl(): string
    {
        return url('/d/'.$this->public_token);
    }

    /**
     * Get the generate/status/download URLs used by the "Download PDF" flow,
     * shared by both the internal show pages and the public share page.
     *
     * @return array{generate: string, status: string, download: string}
     */
    public function pdfUrls(): array
    {
        return [
            'generate' => route('documents.pdf.generate', ['document' => $this->public_token]),
            'status' => route('documents.pdf.status', ['document' => $this->public_token]),
            'download' => route('documents.pdf.download', ['document' => $this->public_token]),
        ];
    }

    /**
     * Get a content hash covering every field that affects the rendered
     * document (header fields + line items), used to decide whether a cached
     * PDF is still valid or needs to be regenerated.
     */
    public function contentHash(): string
    {
        $payload = [
            'type' => $this->type->value,
            'title' => $this->title,
            'number' => $this->number,
            'status' => $this->status->value,
            'issued_at' => $this->issued_at?->toDateString(),
            'valid_until' => $this->valid_until?->toDateString(),
            'due_at' => $this->due_at?->toDateString(),
            'currency' => $this->currency,
            'discount_percent' => $this->discount_percent,
            'tax_percent' => $this->tax_percent,
            'content' => $this->content,
            'notes' => $this->notes,
            'contact_id' => $this->contact_id,
            'project_id' => $this->project_id,
            'items' => $this->items->map(fn (DocumentItem $item) => [
                'name' => $item->name,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price_value' => $item->unit_price_value,
            ])->all(),
        ];

        return hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));
    }

    /**
     * Determine whether the cached PDF (if any) still matches this document's
     * current content — i.e. whether it's safe to serve without regenerating.
     */
    public function hasCurrentCachedPdf(): bool
    {
        $media = $this->getFirstMedia('pdf');

        return $media !== null && $media->getCustomProperty('content_hash') === $this->contentHash();
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
            'pdfUrls' => $this->pdfUrls(),
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
            'shareUrl' => $this->shareUrl(),
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
            'pdfUrls' => $this->pdfUrls(),
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
            'shareUrl' => $this->shareUrl(),
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
            'dueInLabel' => $this->due_at !== null ? ($this->isOverdue() ? "Overdue by {$this->due_at->diffForHumans(null, CarbonInterface::DIFF_ABSOLUTE)}" : "Due {$this->due_at->diffForHumans()}") : '',
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
            'amountPaid' => self::money($this->amountPaidValue()),
            'amountDue' => self::money($this->amountDueValue()),
            'paymentInstructions' => $this->notes ?? '',
            'payments' => $this->payments->map(fn (Payment $payment) => $payment->toPaymentArray())->all(),
            'linkedProject' => $this->linkedProjectArray(),
            'currency' => $this->currency,
            'pdfUrls' => $this->pdfUrls(),
        ];
    }

    /**
     * Get the array shape used for the public share page (/d/{public_token}) and
     * the print view rendered into a PDF, unified across all three document types.
     *
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        [$recipientLabel, $dateFields, $adjustmentLabel, $adjustmentAmount, $totalLabel, $notesLabel, $primaryActionLabel] = match ($this->type) {
            DocumentType::Proposal => [
                'Prepared For',
                [
                    ['label' => 'Date Prepared', 'value' => $this->issued_at?->format('M j, Y') ?? '—', 'danger' => false],
                    ['label' => 'Valid Until', 'value' => $this->valid_until?->format('M j, Y') ?? '—', 'danger' => false],
                ],
                "Tax ({$this->tax_percent}%)",
                self::money($this->taxValue()),
                'Total Amount',
                'Notes',
                'Accept Proposal',
            ],
            DocumentType::Quote => [
                'Prepared For',
                [
                    ['label' => 'Date Issued', 'value' => $this->issued_at?->format('M j, Y') ?? '—', 'danger' => false],
                    ['label' => 'Expiry Date', 'value' => $this->valid_until?->format('M j, Y') ?? '—', 'danger' => false],
                ],
                "Discount ({$this->discount_percent}%)",
                self::money($this->discountValue()),
                'Total Estimate',
                'Terms & Conditions',
                'Accept Quote',
            ],
            DocumentType::Invoice => [
                'Bill To',
                [
                    ['label' => 'Date Issued', 'value' => $this->issued_at?->format('M j, Y') ?? '—', 'danger' => false],
                    ['label' => 'Due Date', 'value' => $this->due_at?->format('M j, Y') ?? '—', 'danger' => $this->isOverdue()],
                ],
                "Tax ({$this->tax_percent}%)",
                self::money($this->taxValue()),
                'Invoice Total',
                'Payment Instructions',
                'Pay Now',
            ],
        };

        return [
            'kind' => $this->type === DocumentType::Quote ? 'quotation' : $this->type->value,
            'kindLabel' => $this->type->label(),
            'number' => $this->number,
            'context' => $this->contextLabel(),
            'statusLabel' => $this->displayStatusLabel(),
            'tone' => $this->displayStatusTone(),
            'business' => [
                'name' => $this->team->name,
                'address' => '',
                'email' => '',
            ],
            'recipient' => [
                'label' => $recipientLabel,
                'name' => $this->clientName(),
                'attn' => $this->contact?->fullName() ?? '',
                'address' => $this->contactAddress(),
                'email' => $this->contactEmail(),
            ],
            'dateFields' => $dateFields,
            'lineItems' => $this->items->map(fn (DocumentItem $item) => [
                'name' => $item->name,
                'description' => $item->description ?? '',
                'qty' => $item->quantity,
                'price' => self::money($item->unit_price_value),
                'total' => self::money($item->lineTotalValue()),
            ])->all(),
            'subtotal' => self::money($this->subtotalValue()),
            'adjustmentLabel' => $adjustmentLabel,
            'adjustmentAmount' => $adjustmentAmount,
            'totalLabel' => $totalLabel,
            'total' => self::money($this->totalValue()),
            'amountPaid' => $this->type === DocumentType::Invoice ? self::money($this->amountPaidValue()) : null,
            'amountDue' => $this->type === DocumentType::Invoice ? self::money($this->amountDueValue()) : null,
            'notesLabel' => $notesLabel,
            'notes' => $this->notes ?? '',
            'primaryActionLabel' => $primaryActionLabel,
            'currency' => $this->currency,
            'pdfUrls' => $this->pdfUrls(),
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
