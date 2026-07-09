<?php

namespace App\Enums;

enum RequestLogSource: string
{
    case WhatsApp = 'WhatsApp';
    case Email = 'Email';
    case Telegram = 'Telegram';
    case PhoneCall = 'Phone call';
    case Other = 'Other';

    /**
     * Get the display label for the source.
     */
    public function label(): string
    {
        return $this->value;
    }
}
