<?php

namespace App\Enums;

enum EventColor: string
{
    case Accent = 'accent';
    case Success = 'success';
    case Danger = 'danger';
    case Info = 'info';
    case Muted = 'muted';

    /**
     * Get the display label for the color.
     */
    public function label(): string
    {
        return match ($this) {
            self::Accent => 'Amber',
            self::Success => 'Green',
            self::Danger => 'Red',
            self::Info => 'Blue',
            self::Muted => 'Gray',
        };
    }

    /**
     * Get the hex value used for the calendar event background/border.
     */
    public function hex(): string
    {
        return match ($this) {
            self::Accent => '#e8a33d',
            self::Success => '#34a87c',
            self::Danger => '#e5484d',
            self::Info => '#60a5fa',
            self::Muted => '#8b93a6',
        };
    }
}
