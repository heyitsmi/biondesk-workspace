<?php

namespace App\Enums;

enum ContactStatus: string
{
    case Active = 'active';
    case Prospect = 'prospect';
    case Inactive = 'inactive';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Prospect => 'Prospect',
            self::Inactive => 'Inactive',
        };
    }

    /**
     * Get the status pill tone for the status.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Active => 'success',
            self::Prospect => 'accent',
            self::Inactive => 'danger',
        };
    }
}
