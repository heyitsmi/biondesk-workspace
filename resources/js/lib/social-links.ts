import type { SocialLinkPlatform } from '@/types';

export const SOCIAL_PLATFORM_LABELS: Record<SocialLinkPlatform, string> = {
    instagram: 'Instagram',
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    github: 'GitHub',
    dribbble: 'Dribbble',
    behance: 'Behance',
    website: 'Website / Custom Link',
};

export const SOCIAL_PLATFORM_OPTIONS = Object.entries(
    SOCIAL_PLATFORM_LABELS,
) as Array<[SocialLinkPlatform, string]>;
