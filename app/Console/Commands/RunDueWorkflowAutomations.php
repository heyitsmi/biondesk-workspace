<?php

namespace App\Console\Commands;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\WorkflowAutomationTrigger;
use App\Models\Document;
use App\Support\WorkflowAutomations\WorkflowAutomationRunner;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

#[Signature('workflow-automations:run-due')]
#[Description('Run due workflow automations for invoice and quote date-based triggers')]
class RunDueWorkflowAutomations extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(WorkflowAutomationRunner $runner): int
    {
        $runs = 0;

        $runs += $this->runInvoiceDueSoonAutomations($runner);
        $runs += $this->runInvoiceOverdueAutomations($runner);
        $runs += $this->runQuoteUnrespondedAutomations($runner);

        $this->info("Evaluated {$runs} due workflow automation subject(s).");

        return self::SUCCESS;
    }

    private function runInvoiceDueSoonAutomations(WorkflowAutomationRunner $runner): int
    {
        return $this->runForDocuments(
            $runner,
            WorkflowAutomationTrigger::InvoiceDueSoon,
            Document::query()
                ->where('type', DocumentType::Invoice)
                ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
                ->whereNotNull('due_at')
                ->whereBetween('due_at', [now()->toDateString(), now()->addDays(3)->toDateString()]),
        );
    }

    private function runInvoiceOverdueAutomations(WorkflowAutomationRunner $runner): int
    {
        return $this->runForDocuments(
            $runner,
            WorkflowAutomationTrigger::InvoiceOverdue,
            Document::query()
                ->where('type', DocumentType::Invoice)
                ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
                ->whereNotNull('due_at')
                ->where('due_at', '<', now()->toDateString()),
        );
    }

    private function runQuoteUnrespondedAutomations(WorkflowAutomationRunner $runner): int
    {
        return $this->runForDocuments(
            $runner,
            WorkflowAutomationTrigger::QuoteUnresponded,
            Document::query()
                ->where('type', DocumentType::Quote)
                ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
                ->whereNotNull('valid_until')
                ->where('valid_until', '<', now()->toDateString()),
        );
    }

    /**
     * @param  Builder<Document>  $query
     */
    private function runForDocuments(WorkflowAutomationRunner $runner, WorkflowAutomationTrigger $trigger, Builder $query): int
    {
        $count = 0;

        $query->each(function (Document $document) use ($runner, $trigger, &$count): void {
            $runner->runForTrigger($document->team_id, $trigger, Document::class, $document->id);
            $count++;
        });

        return $count;
    }
}
