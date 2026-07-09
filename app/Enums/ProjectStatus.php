<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case NotStarted = 'not_started';
    case InProgress = 'in_progress';
    case WaitingOnClient = 'waiting_on_client';
    case InReview = 'in_review';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::NotStarted => 'Not Started',
            self::InProgress => 'In Progress',
            self::WaitingOnClient => 'Waiting on Client',
            self::InReview => 'In Review',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Get the status pill tone for the status.
     */
    public function tone(): string
    {
        return match ($this) {
            self::NotStarted, self::InProgress, self::InReview => 'muted',
            self::WaitingOnClient => 'accent',
            self::Completed => 'success',
            self::Cancelled => 'danger',
        };
    }
}
