<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Scheduled = 'scheduled';
    case Cancelled = 'cancelled';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Scheduled => 'Scheduled',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Get the status pill tone for the status.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Scheduled => 'success',
            self::Cancelled => 'danger',
        };
    }
}
