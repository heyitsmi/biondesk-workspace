<?php

namespace App\Enums;

enum RequestLogMessageAuthorType: string
{
    case Client = 'client';
    case Team = 'team';

    /**
     * Get the display label for the author type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Client => 'Client',
            self::Team => 'Team',
        };
    }
}
