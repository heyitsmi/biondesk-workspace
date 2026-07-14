<?php

namespace App\Enums;

enum WorkflowAutomationTrigger: string
{
    case ClientRequestSubmitted = 'client_request_submitted';
    case ClientRequestReplied = 'client_request_replied';
    case RequestStatusChanged = 'request_status_changed';
    case ProjectStatusChanged = 'project_status_changed';
    case InvoiceDueSoon = 'invoice_due_soon';
    case InvoiceOverdue = 'invoice_overdue';
    case QuoteUnresponded = 'quote_unresponded';

    /**
     * Get the display label for the trigger.
     */
    public function label(): string
    {
        return match ($this) {
            self::ClientRequestSubmitted => 'Client request submitted',
            self::ClientRequestReplied => 'Client request replied',
            self::RequestStatusChanged => 'Request status changed',
            self::ProjectStatusChanged => 'Project status changed',
            self::InvoiceDueSoon => 'Invoice due soon',
            self::InvoiceOverdue => 'Invoice overdue',
            self::QuoteUnresponded => 'Quote unresponded',
        };
    }

    /**
     * Determine whether the trigger is evaluated by the scheduler.
     */
    public function isScheduled(): bool
    {
        return in_array($this, [
            self::InvoiceDueSoon,
            self::InvoiceOverdue,
            self::QuoteUnresponded,
        ], true);
    }
}
