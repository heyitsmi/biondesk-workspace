<?php

namespace App\Enums;

enum ProfileAssetCategory: string
{
    case Company = 'company';
    case Team = 'team';
    case CaseStudy = 'case';
    case Asset = 'asset';

    /**
     * Get the display label for the category.
     */
    public function label(): string
    {
        return match ($this) {
            self::Company => 'Company Info',
            self::Team => 'Team Bio',
            self::CaseStudy => 'Case Study',
            self::Asset => 'Assets',
        };
    }

    /**
     * Get the icon sprite id used for this category.
     */
    public function icon(): string
    {
        return match ($this) {
            self::Company => 'i-briefcase',
            self::Team => 'i-user',
            self::CaseStudy => 'i-layers',
            self::Asset => 'i-image',
        };
    }
}
