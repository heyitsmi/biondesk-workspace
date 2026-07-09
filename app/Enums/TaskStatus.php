<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Backlog = 'backlog';
    case Todo = 'todo';
    case InProgress = 'in_progress';
    case InReview = 'in_review';
    case Done = 'done';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Backlog => 'Backlog',
            self::Todo => 'To Do',
            self::InProgress => 'In Progress',
            self::InReview => 'In Review',
            self::Done => 'Done',
        };
    }

    /**
     * Get the status pill tone for the status.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Backlog, self::Todo => 'muted',
            self::InProgress, self::InReview => 'accent',
            self::Done => 'success',
        };
    }
}
