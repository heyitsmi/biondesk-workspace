<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use Carbon\CarbonInterface;
use Database\Factories\RecurringInvoiceTemplateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $contact_id
 * @property int|null $project_id
 * @property string|null $title
 * @property string $currency
 * @property int $tax_percent
 * @property string|null $notes
 * @property int $interval_months
 * @property int $due_days
 * @property CarbonInterface $starts_at
 * @property CarbonInterface|null $ends_at
 * @property CarbonInterface $next_run_at
 * @property CarbonInterface|null $last_generated_at
 * @property int $occurrences_generated
 * @property bool $auto_send
 * @property bool $is_active
 */
#[Fillable([
    'contact_id', 'project_id', 'title', 'currency', 'tax_percent', 'notes',
    'interval_months', 'due_days', 'starts_at', 'ends_at', 'next_run_at',
    'last_generated_at', 'occurrences_generated', 'auto_send', 'is_active',
])]
class RecurringInvoiceTemplate extends Model
{
    /** @use HasFactory<RecurringInvoiceTemplateFactory> */
    use HasFactory;

    /**
     * Get the team this template belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the contact this template bills, if the contact still exists.
     *
     * @return BelongsTo<Contact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Get the project this template is linked to, if any.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the line items for this template.
     *
     * @return HasMany<RecurringInvoiceTemplateItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(RecurringInvoiceTemplateItem::class, 'recurring_invoice_template_id')->orderBy('sort_order');
    }

    /**
     * Get the invoices generated from this template.
     *
     * @return HasMany<Document, $this>
     */
    public function generatedInvoices(): HasMany
    {
        return $this->hasMany(Document::class)->orderByDesc('issued_at');
    }

    /**
     * Get the client display name for this template, via its contact.
     */
    public function clientName(): string
    {
        if ($this->contact === null) {
            return '';
        }

        return $this->contact->company ?: $this->contact->fullName();
    }

    /**
     * Replace this template's line items with the given set.
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
     * Get the sum of each line item's quantity * unit price, before tax.
     */
    public function subtotalValue(): int
    {
        return $this->items->sum(fn (RecurringInvoiceTemplateItem $item) => $item->quantity * $item->unit_price_value);
    }

    /**
     * Get the tax amount applied to the subtotal.
     */
    public function taxValue(): int
    {
        return (int) round($this->subtotalValue() * $this->tax_percent / 100);
    }

    /**
     * Get the final total: subtotal + tax.
     */
    public function totalValue(): int
    {
        return $this->subtotalValue() + $this->taxValue();
    }

    /**
     * Get a human-readable label for this template's billing cadence.
     */
    public function cadenceLabel(): string
    {
        return match ($this->interval_months) {
            1 => 'Monthly',
            3 => 'Every 3 months',
            6 => 'Every 6 months',
            12 => 'Annually',
            default => "Every {$this->interval_months} months",
        };
    }

    /**
     * Create and persist a new invoice Document for the current billing period,
     * copying this template's client/project/currency/tax/notes and line items.
     */
    public function generateInvoice(): Document
    {
        $document = $this->team->documents()->create([
            'type' => DocumentType::Invoice,
            'number' => Document::nextNumber($this->team, DocumentType::Invoice),
            'contact_id' => $this->contact_id,
            'project_id' => $this->project_id,
            'recurring_invoice_template_id' => $this->id,
            'title' => $this->title,
            'status' => $this->auto_send ? DocumentStatus::Sent : DocumentStatus::Draft,
            'issued_at' => $this->next_run_at,
            'due_at' => $this->next_run_at->copy()->addDays($this->due_days),
            'currency' => $this->currency,
            'tax_percent' => $this->tax_percent,
            'notes' => $this->notes,
        ]);

        $document->syncItems($this->items->map(fn (RecurringInvoiceTemplateItem $item) => [
            'name' => $item->name,
            'description' => $item->description,
            'quantity' => $item->quantity,
            'unit_price_value' => $item->unit_price_value,
        ])->all());

        return $document;
    }

    /**
     * Advance this template's schedule after generating an invoice for the
     * current `next_run_at` period. The new `next_run_at` is always recomputed
     * from the fixed `starts_at` anchor (not by repeatedly adding months to the
     * previous value), so a template anchored on e.g. the 31st doesn't drift to
     * the 28th forever after passing through February.
     */
    public function advanceSchedule(): void
    {
        $this->occurrences_generated++;
        $this->last_generated_at = $this->next_run_at;
        $this->next_run_at = $this->starts_at->copy()->addMonthsNoOverflow($this->occurrences_generated * $this->interval_months);

        if ($this->ends_at !== null && $this->next_run_at->gt($this->ends_at)) {
            $this->is_active = false;
        }

        $this->save();
    }

    /**
     * Reactivate a paused template. If its next run date has already passed,
     * snap it to today instead of generating a backdated invoice for a stale
     * missed period.
     */
    public function reactivate(): void
    {
        $this->is_active = true;

        if ($this->next_run_at->isPast()) {
            $this->next_run_at = now()->startOfDay();
        }

        $this->save();
    }

    /**
     * Get the array shape used for the recurring invoice list rows.
     *
     * @return array<string, mixed>
     */
    public function toListItem(): array
    {
        return [
            'id' => $this->id,
            'client' => $this->clientName(),
            'title' => $this->title ?? '',
            'cadenceLabel' => $this->cadenceLabel(),
            'nextInvoiceAt' => $this->is_active ? $this->next_run_at->format('M j, Y') : '',
            'nextInvoiceSort' => $this->is_active ? $this->next_run_at->timestamp : 0,
            'statusLabel' => $this->is_active ? 'Active' : 'Paused',
            'tone' => $this->is_active ? 'success' : 'muted',
            'amount' => Document::money($this->totalValue()),
            'amountValue' => $this->totalValue(),
            'autoSend' => $this->auto_send,
        ];
    }

    /**
     * Get the array shape used for the recurring invoice detail/edit pages.
     *
     * @return array<string, mixed>
     */
    public function toDetailArray(): array
    {
        return [...$this->toListItem(),
            'intervalMonths' => $this->interval_months,
            'dueDays' => $this->due_days,
            'startsAt' => $this->starts_at->toDateString(),
            'endsAt' => $this->ends_at?->toDateString(),
            'occurrencesGenerated' => $this->occurrences_generated,
            'notes' => $this->notes ?? '',
            'currency' => $this->currency,
            'taxPercent' => $this->tax_percent,
            'contactId' => $this->contact_id ?? '',
            'projectId' => $this->project_id ?? '',
            'lineItems' => $this->items->map(fn (RecurringInvoiceTemplateItem $item) => [
                'name' => $item->name,
                'description' => $item->description ?? '',
                'qty' => $item->quantity,
                'price' => Document::money($item->unit_price_value),
            ])->all(),
            'generatedInvoices' => $this->generatedInvoices->map(fn (Document $document) => $document->toInvoiceListItem())->all(),
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
            'starts_at' => 'date',
            'ends_at' => 'date',
            'next_run_at' => 'date',
            'last_generated_at' => 'date',
            'auto_send' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
