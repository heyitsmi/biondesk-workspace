<?php

namespace App\Enums;

enum RequestLogStatus: string
{
    case Submitted = 'submitted';
    case Reviewing = 'reviewing';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Declined = 'declined';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Submitted => 'Submitted',
            self::Reviewing => 'Reviewing',
            self::InProgress => 'In Progress',
            self::Resolved => 'Resolved',
            self::Declined => 'Declined',
        };
    }

    /**
     * Get the status pill tone.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Submitted, self::Reviewing => 'accent',
            self::InProgress => 'muted',
            self::Resolved => 'success',
            self::Declined => 'danger',
        };
    }

    /**
     * Determine whether this request should count as open.
     */
    public function isOpen(): bool
    {
        return ! in_array($this, [self::Resolved, self::Declined], true);
    }
}
