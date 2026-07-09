<?php

namespace App\Enums;

enum RequestLogClassification: string
{
    case New = 'new';
    case Duplicate = 'duplicate';
    case Related = 'related';
    case Contradiction = 'contradiction';

    /**
     * Get the display label for the classification.
     */
    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::Duplicate => 'Duplicate',
            self::Related => 'Related',
            self::Contradiction => 'Contradiction',
        };
    }

    /**
     * Get the pill tone for the classification.
     */
    public function tone(): string
    {
        return match ($this) {
            self::New => 'accent',
            self::Duplicate, self::Related => 'muted',
            self::Contradiction => 'danger',
        };
    }
}
