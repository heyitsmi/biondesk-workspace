<?php

namespace App\Enums;

enum OpportunityPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';

    /**
     * Get the display label for the priority.
     */
    public function label(): string
    {
        return match ($this) {
            self::Low => 'Low',
            self::Medium => 'Medium',
            self::High => 'High',
        };
    }
}
