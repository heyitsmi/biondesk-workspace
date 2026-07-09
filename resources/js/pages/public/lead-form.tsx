import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { submit } from '@/routes/public-lead-form';
import type { PublicLeadFormPageProps } from '@/types';

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
            render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
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
    turnstileToken: string;
};

type LeadFormFieldErrors = Partial<
    Record<'first_name' | 'last_name' | 'email' | 'company' | 'services' | 'budget' | 'message' | 'turnstile_token', string>
>;

export default function PublicLeadFormPage({ team, settings, turnstileSiteKey }: PublicLeadFormPageProps) {
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LeadFormValues>({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        services: [],
        budget: '',
        message: '',
        turnstileToken: '',
    });

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
                callback: (token: string) => setDataRef.current('turnstileToken', token),
                'expired-callback': () => setDataRef.current('turnstileToken', ''),
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

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        post(submit.url(team.slug), {
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

    const themeVars = THEME_VARS[settings.backgroundTheme === 'light' ? 'light' : 'dark'];

    return (
        <>
            <Head title={`${team.name} lead form`} />

            <div
                style={themeVars}
                className="flex min-h-screen flex-col items-center justify-center bg-bion-bg px-[20px] py-[40px] font-display text-[14px] leading-normal text-bion-text antialiased"
            >
                <div className="w-full max-w-[560px]">
                    <div className="overflow-hidden rounded-[16px] border border-bion-border bg-bion-surface shadow-bion-raised">
                        <div className="border-b border-bion-border bg-bion-surface-raised px-[40px] pt-[40px] pb-[30px] text-center max-[600px]:px-[24px] max-[600px]:pt-[32px] max-[600px]:pb-[24px]">
                            {settings.bannerUrl ? (
                                <img
                                    src={settings.bannerUrl}
                                    alt={team.name}
                                    className="mx-auto mb-[20px] h-[64px] w-[64px] rounded-[16px] object-cover"
                                />
                            ) : (
                                <div className="mx-auto mb-[20px] flex h-[64px] w-[64px] items-center justify-center rounded-[16px] bg-bion-accent text-[24px] font-bold text-bion-accent-text">
                                    {initials}
                                </div>
                            )}
                            <h1 className="mb-[8px] text-[24px] font-bold">{settings.title}</h1>
                            <p className="text-[14.5px] text-bion-text-muted">{settings.welcomeMessage}</p>
                        </div>

                        <div className="px-[40px] pt-[32px] pb-[40px] max-[600px]:px-[24px] max-[600px]:pt-[24px] max-[600px]:pb-[32px]">
                            {!settings.enabled ? (
                                <div className="flex flex-col items-center gap-[12px] py-[24px] text-center">
                                    <h2 className="text-[17px] font-semibold">
                                        Currently not accepting new projects
                                    </h2>
                                    <p className="max-w-[360px] text-[13.5px] text-bion-text-muted">
                                        {team.name} isn&apos;t accepting new inquiries through this form right
                                        now. Please check back later.
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
                                        {team.name} will get back to you within 24
                                        hours.
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
                                                onChange={(event) => setData('firstName', event.target.value)}
                                                required
                                            />
                                            {fieldErrors.first_name ? (
                                                <span className={FIELD_ERROR}>{fieldErrors.first_name}</span>
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
                                                onChange={(event) => setData('lastName', event.target.value)}
                                                required
                                            />
                                            {fieldErrors.last_name ? (
                                                <span className={FIELD_ERROR}>{fieldErrors.last_name}</span>
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
                                            onChange={(event) => setData('email', event.target.value)}
                                            required
                                        />
                                        {fieldErrors.email ? (
                                            <span className={FIELD_ERROR}>{fieldErrors.email}</span>
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
                                            onChange={(event) => setData('company', event.target.value)}
                                        />
                                        {fieldErrors.company ? (
                                            <span className={FIELD_ERROR}>{fieldErrors.company}</span>
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
                                            {settings.services.map((service) => {
                                                const isSelected = data.services.includes(service);

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
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                toggleService(service)
                                                            }
                                                        />
                                                        <span className="text-[13.5px] font-medium">
                                                            {service}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {fieldErrors.services ? (
                                            <span className={FIELD_ERROR}>{fieldErrors.services}</span>
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
                                                onChange={(event) => setData('budget', event.target.value)}
                                            >
                                                <option value="">
                                                    Select a range...
                                                </option>
                                                {BUDGET_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
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
                                            onChange={(event) => setData('message', event.target.value)}
                                            required
                                        />
                                        {fieldErrors.message ? (
                                            <span className={FIELD_ERROR}>{fieldErrors.message}</span>
                                        ) : null}
                                    </div>

                                    {turnstileSiteKey ? (
                                        <div className="mb-[24px]">
                                            <div id={TURNSTILE_CONTAINER_ID} />
                                            {fieldErrors.turnstile_token ? (
                                                <span className={FIELD_ERROR}>{fieldErrors.turnstile_token}</span>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <p className="mb-[24px] text-[12.5px] text-bion-text-muted">
                                            Spam protection isn&apos;t configured for this form yet, so
                                            submissions are disabled.
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing || !turnstileSiteKey}
                                        className="mt-[10px] inline-flex w-full items-center justify-center gap-[7px] rounded-[8px] bg-bion-accent px-[20px] py-[11px] text-[14px] font-semibold text-bion-accent-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:opacity-[0.88] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-[0.5]"
                                    >
                                        {processing ? 'Sending...' : 'Send Inquiry'}
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
