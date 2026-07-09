<?php

namespace App\Enums;

enum LeadFormBackgroundTheme: string
{
    case Dark = 'dark';
    case Light = 'light';
    case Brand = 'brand';

    /**
     * Get the display label for the theme.
     */
    public function label(): string
    {
        return match ($this) {
            self::Dark => 'Dark Mode Default',
            self::Light => 'Light Mode',
            self::Brand => 'Brand Color Auto-Match',
        };
    }
}
