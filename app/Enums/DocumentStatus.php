<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case Draft = 'draft';
    case Sent = 'sent';
    case Viewed = 'viewed';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Sent => 'Sent',
            self::Viewed => 'Viewed',
            self::Accepted => 'Accepted',
            self::Rejected => 'Rejected',
        };
    }

    /**
     * Get the status pill tone for the status.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Draft => 'muted',
            self::Sent, self::Viewed => 'accent',
            self::Accepted => 'success',
            self::Rejected => 'danger',
        };
    }
}
