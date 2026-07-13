<?php

namespace App\Enums;

enum SocialLinkPlatform: string
{
    case Instagram = 'instagram';
    case Twitter = 'twitter';
    case Linkedin = 'linkedin';
    case Facebook = 'facebook';
    case Tiktok = 'tiktok';
    case Youtube = 'youtube';
    case Github = 'github';
    case Dribbble = 'dribbble';
    case Behance = 'behance';
    case Website = 'website';

    /**
     * Get the display label for the platform.
     */
    public function label(): string
    {
        return match ($this) {
            self::Instagram => 'Instagram',
            self::Twitter => 'X (Twitter)',
            self::Linkedin => 'LinkedIn',
            self::Facebook => 'Facebook',
            self::Tiktok => 'TikTok',
            self::Youtube => 'YouTube',
            self::Github => 'GitHub',
            self::Dribbble => 'Dribbble',
            self::Behance => 'Behance',
            self::Website => 'Website / Custom Link',
        };
    }
}
