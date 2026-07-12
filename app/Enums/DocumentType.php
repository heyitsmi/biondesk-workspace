<?php

namespace App\Enums;

enum DocumentType: string
{
    case Proposal = 'proposal';
    case Quote = 'quote';
    case Invoice = 'invoice';

    /**
     * Get the display label for the type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Proposal => 'Proposal',
            self::Quote => 'Quotation',
            self::Invoice => 'Invoice',
        };
    }

    /**
     * Get the document number prefix, e.g. "P" for proposal.
     */
    public function numberPrefix(): string
    {
        return match ($this) {
            self::Proposal => 'P',
            self::Quote => 'QUO',
            self::Invoice => 'INV',
        };
    }
}
