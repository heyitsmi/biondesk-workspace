<?php

namespace App\Enums;

enum ReminderJobType: string
{
    case InvoiceDueSoon = 'invoice_due_soon';
    case InvoiceOverdue = 'invoice_overdue';
    case QuoteUnresponded = 'quote_unresponded';

    /**
     * Get the reminder message for a document, e.g. "Invoice INV-2026-0001 is due soon".
     */
    public function title(string $documentNumber): string
    {
        return match ($this) {
            self::InvoiceDueSoon => "Invoice {$documentNumber} is due soon",
            self::InvoiceOverdue => "Invoice {$documentNumber} is now overdue",
            self::QuoteUnresponded => "Quote {$documentNumber} has not been responded to",
        };
    }

    /**
     * Get the email subject for this reminder type.
     */
    public function emailSubject(string $documentNumber): string
    {
        return match ($this) {
            self::InvoiceDueSoon => "Reminder: Invoice {$documentNumber} is due soon",
            self::InvoiceOverdue => "Overdue: Invoice {$documentNumber}",
            self::QuoteUnresponded => "Following up: Quote {$documentNumber}",
        };
    }
}
