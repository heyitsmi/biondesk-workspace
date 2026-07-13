<?php

namespace App\Support\AiChat\Tools;

use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\Team;

class GetInvoicePaymentStatusTool implements Tool
{
    public function name(): string
    {
        return 'get_invoice_payment_status';
    }

    public function description(): string
    {
        return 'Look up invoice payment status by invoice number (fuzzy match). If no number is given, returns the 10 most recent invoices.';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'number' => [
                    'type' => 'string',
                    'description' => 'Invoice number or partial number, e.g. "INV-0043" or "0043".',
                ],
            ],
            'required' => [],
        ];
    }

    public function execute(Team $team, array $args): array
    {
        $number = isset($args['number']) ? trim((string) $args['number']) : null;

        $query = $team->documents()->where('type', DocumentType::Invoice)->with('payments');

        if ($number !== null && $number !== '') {
            $query->where('number', 'like', "%{$number}%");
        } else {
            $query->latest('issued_at')->limit(10);
        }

        $invoices = $query->get()->map(fn (Document $invoice) => [
            'number' => $invoice->number,
            'status' => $invoice->displayStatus(),
            'total' => $invoice->totalValue(),
            'paid' => $invoice->amountPaidValue(),
            'due' => $invoice->amountDueValue(),
            'dueAt' => $invoice->due_at?->toDateString(),
        ])->values()->all();

        return ['invoices' => $invoices];
    }
}
