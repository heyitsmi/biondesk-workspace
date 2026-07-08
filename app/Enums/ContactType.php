<?php

namespace App\Enums;

enum ContactType: string
{
    case Client = 'client';
    case Lead = 'lead';
    case Vendor = 'vendor';

    /**
     * Get the display label for the type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Client => 'Client',
            self::Lead => 'Lead',
            self::Vendor => 'Vendor',
        };
    }

    /**
     * Get the status pill tone for the type.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Client => 'accent',
            self::Lead, self::Vendor => 'muted',
        };
    }
}
