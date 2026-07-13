<?php

namespace App\Console\Commands;

use App\Mail\RecurringInvoiceGeneratedMail;
use App\Models\RecurringInvoiceTemplate;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

#[Signature('invoices:generate-recurring')]
#[Description('Generate invoices from active recurring templates whose next run date has arrived, then email the auto-send ones')]
class GenerateRecurringInvoices extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $generated = 0;
        $sent = 0;

        RecurringInvoiceTemplate::query()
            ->where('is_active', true)
            ->whereNotNull('contact_id')
            ->whereDate('next_run_at', '<=', now())
            ->with('contact', 'items', 'team')
            ->each(function (RecurringInvoiceTemplate $template) use (&$generated, &$sent): void {
                $document = DB::transaction(function () use ($template) {
                    $document = $template->generateInvoice();
                    $template->advanceSchedule();

                    return $document;
                });
                $generated++;

                if ($template->auto_send && $template->contact?->email !== null) {
                    Mail::to($template->contact->email)->send(new RecurringInvoiceGeneratedMail($document));
                    $sent++;
                }
            });

        // Templates whose contact was deleted are paused instead of left to
        // silently sit stuck forever without ever surfacing to the user.
        RecurringInvoiceTemplate::query()
            ->where('is_active', true)
            ->whereNull('contact_id')
            ->whereDate('next_run_at', '<=', now())
            ->update(['is_active' => false]);

        $this->info("Generated {$generated} invoice(s), sent {$sent} email(s).");

        return self::SUCCESS;
    }
}
