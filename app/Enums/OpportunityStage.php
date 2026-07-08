<?php

namespace App\Enums;

enum OpportunityStage: string
{
    case Inbox = 'inbox';
    case Drafting = 'drafting';
    case Sent = 'sent';
    case Negotiation = 'negotiation';
    case Won = 'won';
    case Lost = 'lost';

    /**
     * Get the display label for the stage.
     */
    public function label(): string
    {
        return match ($this) {
            self::Inbox => 'Inbox',
            self::Drafting => 'Drafting',
            self::Sent => 'Sent',
            self::Negotiation => 'Negotiation',
            self::Won => 'Won',
            self::Lost => 'Lost',
        };
    }

    /**
     * Get the status pill tone for the stage.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Inbox, self::Drafting, self::Sent => 'muted',
            self::Negotiation => 'accent',
            self::Won => 'success',
            self::Lost => 'danger',
        };
    }
}
