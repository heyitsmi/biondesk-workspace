import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, FormEvent } from 'react';
import { SOCIAL_PLATFORM_LABELS } from '@/lib/social-links';
import { cn } from '@/lib/utils';
import { submit } from '@/routes/public-lead-form';
import type { PublicLeadFormPageProps, SocialLinkPlatform } from '@/types';

const SOCIAL_ICON_CLS =
    'h-[16px] w-[16px] fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

function SocialIcon({ platform }: { platform: SocialLinkPlatform }) {
    switch (platform) {
        case 'instagram':
            return (
                <svg className={SOCIAL_ICON_CLS} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                        cx="17.2"
                        cy="6.8"
                        r="0.6"
                        fill="currentColor"
                        stroke="none"
                    />
                </svg>
            );
        case 'twitter':
            return (
                <svg className={SOCIAL_ICON_CLS} viewBox="0 0 24 24">
                    <path d="M4 4l16 16M20 4L4 20" />
                </svg>
            );
        case 'linkedin':
            return (
                <svg className={SOCIAL_ICON_CLS} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <line x1="7" y1="10" x2="7" y2="17" />
                    <circle
                        cx="7"
                        cy="6.5"
                        r="0.9"
                        fill="currentColor"
                        stroke="none"
                    />
                    <path d="M11 17v-4a2.5 2.5 0 015 0v4" />
                    <line x1="11" y1="10" x2="11" y2="17" />
                </svg>
            );
        case 'facebook':
            return (
                <svg
                    className={SOCIAL_ICON_CLS}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                >
                    <path d="M15 3h-2a4 4 0 00-4 4v3H7v4h2v7h4v-7h2.5l.5-4H13V7a1 1 0 011-1h2z" />
                </svg>
            );
        case 'tiktok':
            return (
                <svg
                    className={SOCIAL_ICON_CLS}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                >
                    <path d="M14 3v10.5a3.5 3.5 0 11-3.5-3.5c.17 0 .34.01.5.03V7.7a6.3 6.3 0 105.4 6.24V9.8a7.9 7.9 0 004.1 1.16V8.2a4.8 4.8 0 01-3.5-2.02A4.9 4.9 0 0116 3h-2z" />
                </svg>
            );
        case 'youtube':
            return (
                <svg className={SOCIAL_ICON_CLS} viewBox="0 0 24 24">
                    <rect x="3" y="6" width="18" height="12" rx="3" />
                    <path
                        d="M10 9.5l5 2.5-5 2.5v-5z"
                        fill="currentColor"
                        stroke="none"
                    />
                </svg>
            );
        case 'github':
            return (
                <svg className={SOCIAL_ICON_CLS} viewBox="0 0 24 24">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                </svg>
            );
        case 'dribbble':
            return (
                <svg className={SOCIAL_ICON_CLS} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M4 12c4 1.5 8.5 1.2 12.5-1M7 4.5c2.5 3 4 7 4.5 12.5M19 8.5c-3 .5-6.5.2-9.5-1.5" />
                </svg>
            );
        case 'behance':
            return (
                <svg className={SOCIAL_ICON_CLS} viewBox="0 0 24 24">
                    <rect x="2" y="7" width="8" height="10" rx="1.5" />
                    <line x1="2" y1="12" x2="9" y2="12" />
                    <path d="M14 12a4 4 0 118 0c0 .34-.02.67-.07 1H14" />
                    <line x1="14" y1="9" x2="20" y2="9" />
                </svg>
            );
        case 'website':
        default:
            return (
                <svg className={SOCIAL_ICON_CLS} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <path d="M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z" />
                </svg>
            );
    }
}

const FIELD_LABEL = 'mb-[8px] block text-[12.5px] font-semibold text-bion-text';
const FIELD_INPUT =
    'w-full rounded-[10px] border border-bion-border bg-bion-bg px-[14px] py-[12px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease,box-shadow_0.15s_ease] focus:border-bion-accent focus:shadow-[0_0_0_3px_var(--bion-accent-soft)]';
const FIELD_ERROR = 'mt-[6px] block text-[12px] text-bion-danger';

const BUDGET_OPTIONS = [
    { value: 'under5k', label: 'Under $5,000' },
    { value: '5k_10k', label: '$5,000 - $10,000' },
    { value: '10k_25k', label: '$10,000 - $25,000' },
    { value: 'over25k', label: '$25,000+' },
];

const TURNSTILE_CONTAINER_ID = 'turnstile-widget';
const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

const THEME_VARS: Record<'light' | 'dark', CSSProperties> = {
    light: {
        '--bion-bg': '#f6f7f9',
        '--bion-surface': '#ffffff',
        '--bion-surface-raised': '#ffffff',
        '--bion-border': '#e4e6eb',
        '--bion-text': '#12161f',
        '--bion-text-muted': '#6b7280',
        '--bion-accent': '#c77f1f',
        '--bion-accent-text': '#ffffff',
        '--bion-success': '#1f8a5f',
        '--bion-success-soft': 'rgb(31 138 95 / 0.12)',
        '--bion-danger': '#d6383d',
    } as CSSProperties,
    dark: {
        '--bion-bg': '#0b0e14',
        '--bion-surface': '#12161f',
        '--bion-surface-raised': '#1a1f2b',
        '--bion-border': '#232838',
        '--bion-text': '#edeff3',
        '--bion-text-muted': '#8b93a6',
        '--bion-accent': '#e8a33d',
        '--bion-accent-text': '#12161f',
        '--bion-success': '#34a87c',
        '--bion-success-soft': 'rgb(52 168 124 / 0.12)',
        '--bion-danger': '#e5484d',
    } as CSSProperties,
};

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: Record<string, unknown>,
            ) => string;
        };
    }
}

type LeadFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    services: string[];
    budget: string;
    message: string;
    attachments: File[];
    turnstileToken: string;
};

type LeadFormFieldErrors = Partial<
    Record<
        | 'first_name'
        | 'last_name'
        | 'email'
        | 'company'
        | 'services'
        | 'budget'
        | 'message'
        | 'attachments'
        | 'turnstile_token',
        string
    >
>;

const MAX_ATTACHMENTS = 5;

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(0)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PublicLeadFormPage({
    team,
    settings,
    turnstileSiteKey,
}: PublicLeadFormPageProps) {
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset } =
        useForm<LeadFormValues>({
            firstName: '',
            lastName: '',
            email: '',
            company: '',
            services: [],
            budget: '',
            message: '',
            attachments: [],
            turnstileToken: '',
        });

    const attachmentsInputRef = useRef<HTMLInputElement>(null);
    const setDataRef = useRef(setData);

    useEffect(() => {
        setDataRef.current = setData;
    });

    const fieldErrors = errors as LeadFormFieldErrors;

    useEffect(() => {
        if (!turnstileSiteKey) {
            return;
        }

        const renderWidget = (): void => {
            window.turnstile?.render(`#${TURNSTILE_CONTAINER_ID}`, {
                sitekey: turnstileSiteKey,
                callback: (token: string) =>
                    setDataRef.current('turnstileToken', token),
                'expired-callback': () =>
                    setDataRef.current('turnstileToken', ''),
            });
        };

        if (window.turnstile) {
            renderWidget();

            return;
        }

        const existing = document.getElementById(TURNSTILE_SCRIPT_ID);

        if (existing) {
            existing.addEventListener('load', renderWidget);

            return () => existing.removeEventListener('load', renderWidget);
        }

        const script = document.createElement('script');
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.addEventListener('load', renderWidget);
        document.body.appendChild(script);

        return () => script.removeEventListener('load', renderWidget);
    }, [turnstileSiteKey]);

    const toggleService = (value: string): void => {
        setData(
            'services',
            data.services.includes(value)
                ? data.services.filter((service) => service !== value)
                : [...data.services, value],
        );
    };

    const pickAttachments = (): void => {
        attachmentsInputRef.current?.click();
    };

    const onAttachmentsSelected = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const files = Array.from(event.target.files ?? []);
        setData(
            'attachments',
            [...data.attachments, ...files].slice(0, MAX_ATTACHMENTS),
        );
        event.target.value = '';
    };

    const removeAttachment = (index: number): void => {
        setData(
            'attachments',
            data.attachments.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        post(submit.url(team.leadFormSlug), {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitted(true);
                reset();
            },
        });
    };

    const initials = team.name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const baseThemeVars =
        THEME_VARS[settings.backgroundTheme === 'light' ? 'light' : 'dark'];
    const hasCustomBackground = settings.backgroundTheme === 'custom';
    const pageStyle: CSSProperties = hasCustomBackground
        ? ({
              ...baseThemeVars,
              '--bion-bg':
                  settings.backgroundColor ??
                  (baseThemeVars as Record<string, string>)['--bion-bg'],
              ...(settings.backgroundImageUrl
                  ? {
                        backgroundImage: `url(${settings.backgroundImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }
                  : {}),
          } as CSSProperties)
        : baseThemeVars;

    return (
        <>
            <Head title={settings.title}>
                <meta name="description" content={settings.metaDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={settings.metaTitle} />
                <meta
                    property="og:description"
                    content={settings.metaDescription}
                />
                {settings.ogImageUrl ? (
                    <meta property="og:image" content={settings.ogImageUrl} />
                ) : null}
                <meta
                    name="twitter:card"
                    content={
                        settings.ogImageUrl ? 'summary_large_image' : 'summary'
                    }
                />
                <meta name="twitter:title" content={settings.metaTitle} />
                <meta
                    name="twitter:description"
                    content={settings.metaDescription}
                />
                {settings.ogImageUrl ? (
                    <meta name="twitter:image" content={settings.ogImageUrl} />
                ) : null}
            </Head>

            <div
                style={pageStyle}
                className="flex min-h-screen flex-col items-center justify-center bg-bion-bg px-[20px] py-[40px] font-display text-[14px] leading-normal text-bion-text antialiased"
            >
                <div className="w-full max-w-[560px]">
                    <div className="overflow-hidden rounded-[16px] border border-bion-border bg-bion-surface shadow-bion-raised">
                        <div className="relative border-b border-bion-border bg-bion-surface-raised text-center">
                            {settings.coverUrl ? (
                                <div className="h-[120px] w-full overflow-hidden">
                                    <img
                                        src={settings.coverUrl}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : null}
                            <div
                                className={cn(
                                    'px-[40px] pb-[30px] max-[600px]:px-[24px] max-[600px]:pb-[24px]',
                                    settings.coverUrl
                                        ? '-mt-[32px]'
                                        : 'pt-[40px] max-[600px]:pt-[32px]',
                                )}
                            >
                                {settings.bannerUrl ? (
                                    <img
                                        src={settings.bannerUrl}
                                        alt={team.name}
                                        className={cn(
                                            'mx-auto mb-[20px] h-[64px] w-[64px] rounded-[16px] object-cover',
                                            settings.coverUrl &&
                                                'border-[3px] border-bion-surface shadow-bion-raised',
                                        )}
                                    />
                                ) : (
                                    <div
                                        className={cn(
                                            'mx-auto mb-[20px] flex h-[64px] w-[64px] items-center justify-center rounded-[16px] bg-bion-accent text-[24px] font-bold text-bion-accent-text',
                                            settings.coverUrl &&
                                                'border-[3px] border-bion-surface shadow-bion-raised',
                                        )}
                                    >
                                        {initials}
                                    </div>
                                )}
                                <h1 className="mb-[8px] text-[24px] font-bold">
                                    {settings.title}
                                </h1>
                                <p className="text-[14.5px] text-bion-text-muted">
                                    {settings.welcomeMessage}
                                </p>
                                {settings.socialLinks.length > 0 ? (
                                    <div className="mt-[16px] flex flex-wrap items-center justify-center gap-[10px]">
                                        {settings.socialLinks.map((link) => (
                                            <a
                                                key={`${link.platform}-${link.url}`}
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={
                                                    SOCIAL_PLATFORM_LABELS[
                                                        link.platform
                                                    ]
                                                }
                                                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-bion-border bg-bion-bg text-bion-text-muted [transition:color_0.15s_ease,border-color_0.15s_ease] hover:border-bion-accent hover:text-bion-accent"
                                            >
                                                <SocialIcon
                                                    platform={link.platform}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="px-[40px] pt-[32px] pb-[40px] max-[600px]:px-[24px] max-[600px]:pt-[24px] max-[600px]:pb-[32px]">
                            {!settings.enabled ? (
                                <div className="flex flex-col items-center gap-[12px] py-[24px] text-center">
                                    <h2 className="text-[17px] font-semibold">
                                        Currently not accepting new projects
                                    </h2>
                                    <p className="max-w-[360px] text-[13.5px] text-bion-text-muted">
                                        {team.name} isn&apos;t accepting new
                                        inquiries through this form right now.
                                        Please check back later.
                                    </p>
                                </div>
                            ) : submitted ? (
                                <div className="flex flex-col items-center gap-[12px] py-[24px] text-center">
                                    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-bion-success-soft text-bion-success">
                                        <svg
                                            className="h-[26px] w-[26px] fill-none stroke-current [stroke-width:2] [stroke-linecap:round] [stroke-linejoin:round]"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M5 12l5 5L20 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-[17px] font-semibold">
                                        Thanks, your inquiry is in!
                                    </h2>
                                    <p className="max-w-[360px] text-[13.5px] text-bion-text-muted">
                                        {team.name} will get back to you within
                                        24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-[24px] flex gap-[16px] max-[600px]:flex-col max-[600px]:gap-[24px]">
                                        <div className="flex-1">
                                            <label className={FIELD_LABEL}>
                                                First Name{' '}
                                                <span className="text-bion-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                className={FIELD_INPUT}
                                                placeholder="Jane"
                                                value={data.firstName}
                                                onChange={(event) =>
                                                    setData(
                                                        'firstName',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {fieldErrors.first_name ? (
                                                <span className={FIELD_ERROR}>
                                                    {fieldErrors.first_name}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="flex-1">
                                            <label className={FIELD_LABEL}>
                                                Last Name{' '}
                                                <span className="text-bion-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                className={FIELD_INPUT}
                                                placeholder="Doe"
                                                value={data.lastName}
                                                onChange={(event) =>
                                                    setData(
                                                        'lastName',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {fieldErrors.last_name ? (
                                                <span className={FIELD_ERROR}>
                                                    {fieldErrors.last_name}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="mb-[24px]">
                                        <label className={FIELD_LABEL}>
                                            Email Address{' '}
                                            <span className="text-bion-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            className={FIELD_INPUT}
                                            placeholder="jane@company.com"
                                            value={data.email}
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {fieldErrors.email ? (
                                            <span className={FIELD_ERROR}>
                                                {fieldErrors.email}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="mb-[24px]">
                                        <label className={FIELD_LABEL}>
                                            Company / Organization
                                        </label>
                                        <input
                                            type="text"
                                            className={FIELD_INPUT}
                                            placeholder="Acme Corp"
                                            value={data.company}
                                            onChange={(event) =>
                                                setData(
                                                    'company',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        {fieldErrors.company ? (
                                            <span className={FIELD_ERROR}>
                                                {fieldErrors.company}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="mt-[32px] border-t border-dashed border-bion-border pt-[24px]">
                                        <label className={FIELD_LABEL}>
                                            What do you need help with?{' '}
                                            <span className="text-bion-danger">
                                                *
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-[12px] max-[600px]:grid-cols-1">
                                            {settings.services.map(
                                                (service) => {
                                                    const isSelected =
                                                        data.services.includes(
                                                            service,
                                                        );

                                                    return (
                                                        <label
                                                            key={service}
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-[10px] rounded-[10px] border border-bion-border bg-bion-bg px-[14px] py-[12px] [transition:border-color_0.15s_ease] hover:border-bion-text-muted',
                                                                isSelected &&
                                                                    'border-bion-accent! bg-bion-accent-soft!',
                                                            )}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="h-[16px] w-[16px] cursor-pointer accent-bion-accent"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onChange={() =>
                                                                    toggleService(
                                                                        service,
                                                                    )
                                                                }
                                                            />
                                                            <span className="text-[13.5px] font-medium">
                                                                {service}
                                                            </span>
                                                        </label>
                                                    );
                                                },
                                            )}
                                        </div>
                                        {fieldErrors.services ? (
                                            <span className={FIELD_ERROR}>
                                                {fieldErrors.services}
                                            </span>
                                        ) : null}
                                    </div>

                                    {settings.askBudget ? (
                                        <div className="mt-[24px] mb-[24px]">
                                            <label className={FIELD_LABEL}>
                                                Estimated Budget
                                            </label>
                                            <select
                                                className={FIELD_INPUT}
                                                value={data.budget}
                                                onChange={(event) =>
                                                    setData(
                                                        'budget',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select a range...
                                                </option>
                                                {BUDGET_OPTIONS.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    ) : null}

                                    <div className="mb-[24px]">
                                        <label className={FIELD_LABEL}>
                                            Project Details{' '}
                                            <span className="text-bion-danger">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            className={cn(
                                                FIELD_INPUT,
                                                'min-h-[100px] resize-y',
                                            )}
                                            placeholder="Tell us about your goals, timeline, and any specific requirements..."
                                            value={data.message}
                                            onChange={(event) =>
                                                setData(
                                                    'message',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {fieldErrors.message ? (
                                            <span className={FIELD_ERROR}>
                                                {fieldErrors.message}
                                            </span>
                                        ) : null}
                                    </div>

                                    {settings.allowAttachments ? (
                                        <div className="mb-[24px]">
                                            <label className={FIELD_LABEL}>
                                                Attachments (Optional)
                                            </label>
                                            <input
                                                ref={attachmentsInputRef}
                                                type="file"
                                                multiple
                                                accept="image/*,.pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={onAttachmentsSelected}
                                            />
                                            <button
                                                type="button"
                                                onClick={pickAttachments}
                                                disabled={
                                                    data.attachments.length >=
                                                    MAX_ATTACHMENTS
                                                }
                                                className="flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[10px] border-2 border-dashed border-bion-border bg-bion-bg px-[14px] py-[16px] text-center [transition:border-color_0.15s_ease] hover:border-bion-accent disabled:cursor-not-allowed disabled:opacity-[0.5]"
                                            >
                                                <svg
                                                    className="h-[16px] w-[16px] shrink-0 fill-none stroke-current [stroke-width:1.6] text-bion-text-muted [stroke-linecap:round] [stroke-linejoin:round]"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                                    <polyline points="17 8 12 3 7 8" />
                                                    <line
                                                        x1="12"
                                                        y1="3"
                                                        x2="12"
                                                        y2="15"
                                                    />
                                                </svg>
                                                <span className="text-[13px] font-medium text-bion-text-muted">
                                                    Upload briefs or reference
                                                    images (up to 10MB each, max{' '}
                                                    {MAX_ATTACHMENTS} files)
                                                </span>
                                            </button>

                                            {data.attachments.length > 0 ? (
                                                <ul className="mt-[10px] flex flex-col gap-[6px]">
                                                    {data.attachments.map(
                                                        (file, index) => (
                                                            <li
                                                                key={`${file.name}-${index}`}
                                                                className="flex items-center justify-between gap-[10px] rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[8px]"
                                                            >
                                                                <span className="min-w-0 flex-1 truncate text-[12.5px] text-bion-text">
                                                                    {file.name}
                                                                </span>
                                                                <span className="shrink-0 text-[11.5px] text-bion-text-muted">
                                                                    {formatFileSize(
                                                                        file.size,
                                                                    )}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeAttachment(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="shrink-0 text-bion-danger"
                                                                    aria-label={`Remove ${file.name}`}
                                                                >
                                                                    <svg
                                                                        className="h-[14px] w-[14px] fill-none stroke-current [stroke-width:1.8] [stroke-linecap:round] [stroke-linejoin:round]"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path d="M6 6l12 12M18 6L6 18" />
                                                                    </svg>
                                                                </button>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            ) : null}
                                            {fieldErrors.attachments ? (
                                                <span className={FIELD_ERROR}>
                                                    {fieldErrors.attachments}
                                                </span>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    {turnstileSiteKey ? (
                                        <div className="mb-[24px]">
                                            <div id={TURNSTILE_CONTAINER_ID} />
                                            {fieldErrors.turnstile_token ? (
                                                <span className={FIELD_ERROR}>
                                                    {
                                                        fieldErrors.turnstile_token
                                                    }
                                                </span>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <p className="mb-[24px] text-[12.5px] text-bion-text-muted">
                                            Spam protection isn&apos;t
                                            configured for this form yet, so
                                            submissions are disabled.
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={
                                            processing || !turnstileSiteKey
                                        }
                                        className="mt-[10px] inline-flex w-full items-center justify-center gap-[7px] rounded-[8px] bg-bion-accent px-[20px] py-[11px] text-[14px] font-semibold text-bion-accent-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:opacity-[0.88] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-[0.5]"
                                    >
                                        {processing
                                            ? 'Sending...'
                                            : 'Send Inquiry'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="mt-[24px] text-center text-[12px] text-bion-text-muted">
                        Powered by{' '}
                        <a
                            href="/"
                            className="font-medium text-bion-text underline decoration-bion-border underline-offset-[3px]"
                        >
                            Biondesk
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
