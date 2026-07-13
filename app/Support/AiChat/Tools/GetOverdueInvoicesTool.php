<?php

namespace App\Support\AiChat\Tools;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\Team;

class GetOverdueInvoicesTool implements Tool
{
    public function name(): string
    {
        return 'get_overdue_invoices';
    }

    public function description(): string
    {
        return "Get the team's invoices that are sent/viewed and past their due date, with amounts and how many days overdue.";
    }

    public function parameters(): array
    {
        return ['type' => 'object', 'properties' => new \stdClass, 'required' => []];
    }

    public function execute(Team $team, array $args): array
    {
        $invoices = $team->documents()
            ->where('type', DocumentType::Invoice)
            ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->with(['payments', 'contact'])
            ->get();

        return [
            'invoices' => $invoices->map(fn (Document $invoice) => [
                'number' => $invoice->number,
                'client' => $invoice->clientName(),
                'total' => $invoice->totalValue(),
                'amountDue' => $invoice->amountDueValue(),
                'dueAt' => $invoice->due_at?->toDateString(),
                'daysOverdue' => (int) $invoice->due_at->diffInDays(now()),
            ])->values()->all(),
        ];
    }
}
