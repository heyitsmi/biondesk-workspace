<?php

namespace App\Console\Commands;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\ReminderJobType;
use App\Mail\DocumentReminderMail;
use App\Models\Document;
use App\Models\ReminderJob;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

#[Signature('reminders:generate')]
#[Description('Generate reminder jobs for invoices approaching/past due and unresponded quotes, then email them')]
class GenerateDocumentReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->generateInvoiceDueSoonReminders();
        $this->generateInvoiceOverdueReminders();
        $this->generateQuoteUnrespondedReminders();
        $sent = $this->sendPendingReminders();

        $this->info("Sent {$sent} reminder email(s).");

        return self::SUCCESS;
    }

    /**
     * Invoices due within the next 3 days that haven't been reminded about yet.
     */
    private function generateInvoiceDueSoonReminders(): void
    {
        Document::query()
            ->where('type', DocumentType::Invoice)
            ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
            ->whereNotNull('due_at')
            ->whereBetween('due_at', [now()->toDateString(), now()->addDays(3)->toDateString()])
            ->each(function (Document $invoice): void {
                ReminderJob::firstOrCreate(
                    ['document_id' => $invoice->id, 'type' => ReminderJobType::InvoiceDueSoon],
                    ['scheduled_at' => $invoice->due_at],
                );
            });
    }

    /**
     * Invoices already past their due date.
     */
    private function generateInvoiceOverdueReminders(): void
    {
        Document::query()
            ->where('type', DocumentType::Invoice)
            ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
            ->whereNotNull('due_at')
            ->where('due_at', '<', now()->toDateString())
            ->each(function (Document $invoice): void {
                ReminderJob::firstOrCreate(
                    ['document_id' => $invoice->id, 'type' => ReminderJobType::InvoiceOverdue],
                    ['scheduled_at' => $invoice->due_at],
                );
            });
    }

    /**
     * Quotes sent/viewed but never accepted or rejected before their validity expired.
     */
    private function generateQuoteUnrespondedReminders(): void
    {
        Document::query()
            ->where('type', DocumentType::Quote)
            ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::Viewed])
            ->whereNotNull('valid_until')
            ->where('valid_until', '<', now()->toDateString())
            ->each(function (Document $quote): void {
                ReminderJob::firstOrCreate(
                    ['document_id' => $quote->id, 'type' => ReminderJobType::QuoteUnresponded],
                    ['scheduled_at' => $quote->valid_until],
                );
            });
    }

    /**
     * Email every reminder job that hasn't been sent yet, then mark it sent so
     * it's never emailed twice.
     */
    private function sendPendingReminders(): int
    {
        $sent = 0;

        ReminderJob::query()
            ->whereNull('sent_at')
            ->with('document.contact')
            ->each(function (ReminderJob $reminderJob) use (&$sent): void {
                $email = $reminderJob->document->contact?->email;

                if ($email === null) {
                    return;
                }

                Mail::to($email)->send(new DocumentReminderMail($reminderJob));
                $reminderJob->update(['sent_at' => now()]);
                $sent++;
            });

        return $sent;
    }
}
