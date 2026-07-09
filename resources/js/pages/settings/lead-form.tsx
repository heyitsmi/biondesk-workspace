import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { publicLeadForm } from '@/routes';
import { update } from '@/routes/lead-form';
import type { PublicLeadFormBackgroundTheme, SettingsLeadFormPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised');

const FIELD_LABEL = 'flex items-center justify-between text-[13px] font-semibold text-bion-text';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';
const FIELD_ERROR = 'text-[12px] text-bion-danger';

const CARD = 'overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface shadow-bion-raised';
const CARD_BODY = 'flex flex-col gap-[24px] p-[24px]';
const CARD_FOOTER =
    'flex items-center justify-end gap-[12px] border-t border-bion-border bg-bion-surface-raised px-[24px] py-[16px]';

function ToggleSwitch({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <label className="relative inline-block h-[24px] w-[44px] shrink-0 cursor-pointer">
            <input
                type="checkbox"
                className="peer h-0 w-0 opacity-0"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span
                className={cn(
                    'absolute inset-0 rounded-[24px] [transition:.2s]',
                    'before:absolute before:bottom-[3px] before:left-[3px] before:h-[18px] before:w-[18px] before:rounded-full before:bg-white before:shadow-[0_2px_4px_rgba(0,0,0,0.2)] before:[transition:.2s] before:content-[""]',
                    checked ? 'bg-bion-success before:translate-x-[20px]' : 'bg-bion-border',
                )}
            />
        </label>
    );
}

type AppearanceFormValues = {
    title: string;
    welcomeMessage: string;
    backgroundTheme: PublicLeadFormBackgroundTheme;
    banner: File | null;
};

type FieldsFormValues = {
    services: string[];
    askBudget: boolean;
    allowAttachments: boolean;
};

type AppearanceFieldErrors = Partial<Record<'title' | 'welcome_message' | 'background_theme' | 'banner', string>>;

export default function SettingsLeadForm({ formUrl, settings }: SettingsLeadFormPageProps) {
    const { currentTeam } = usePage().props;
    const [enabled, setEnabled] = useState(settings.enabled);
    const [linkCopied, setLinkCopied] = useState(false);
    const [bannerPreview, setBannerPreview] = useState<string | null>(settings.bannerUrl);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const appearanceForm = useForm<AppearanceFormValues>({
        title: settings.title,
        welcomeMessage: settings.welcomeMessage,
        backgroundTheme: settings.backgroundTheme,
        banner: null,
    });

    const fieldsForm = useForm<FieldsFormValues>({
        services: settings.services,
        askBudget: settings.askBudget,
        allowAttachments: settings.allowAttachments,
    });

    const appearanceErrors = appearanceForm.errors as AppearanceFieldErrors;

    const copyFormLink = async (): Promise<void> => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(formUrl);
            setLinkCopied(true);
            window.setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            return;
        }
    };

    const toggleEnabled = (next: boolean): void => {
        setEnabled(next);
        router.put(update.url(), { enabled: next }, { preserveScroll: true });
    };

    const updateService = (index: number, value: string): void => {
        fieldsForm.setData(
            'services',
            fieldsForm.data.services.map((service, i) => (i === index ? value : service)),
        );
    };

    const removeService = (index: number): void => {
        fieldsForm.setData(
            'services',
            fieldsForm.data.services.filter((_, i) => i !== index),
        );
    };

    const addService = (): void => {
        fieldsForm.setData('services', [...fieldsForm.data.services, '']);
    };

    const pickBanner = (): void => {
        bannerInputRef.current?.click();
    };

    const onBannerSelected = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0] ?? null;
        appearanceForm.setData('banner', file);

        if (file) {
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const saveAppearance = (): void => {
        appearanceForm.put(update.url(), { preserveScroll: true });
    };

    const saveFields = (): void => {
        fieldsForm.put(update.url(), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Public Lead Form settings" />

            <div className="mb-[20px]">
                <h2 className="mb-[6px] text-[18px] font-semibold text-bion-text">Public Lead Form</h2>
                <p className="text-[13.5px] text-bion-text-muted">
                    Customize the inquiry form you share with potential clients.
                </p>
            </div>

            <div className={CARD}>
                <div className={CARD_BODY}>
                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>Your public form link</label>
                        <div className="flex gap-[10px] max-[760px]:flex-col">
                            <input
                                type="text"
                                readOnly
                                className={cn(FIELD_INPUT, 'text-bion-text-muted')}
                                value={formUrl}
                            />
                            <button type="button" className={BTN_GHOST} onClick={copyFormLink}>
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-link" />
                                </svg>
                                {linkCopied ? 'Copied' : 'Copy'}
                            </button>
                            {currentTeam ? (
                                <a
                                    href={publicLeadForm(currentTeam.slug).url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={BTN_GHOST}
                                >
                                    Preview
                                </a>
                            ) : null}
                        </div>
                        <p className="mt-[4px] text-[12.5px] text-bion-text-muted">
                            Share this link anywhere to collect leads directly into your Opportunities
                            pipeline.
                        </p>
                    </div>

                    <div className="mt-[4px] flex items-center justify-between border-t border-bion-border pt-[20px]">
                        <div className="flex flex-col gap-[4px]">
                            <span className="text-[13.5px] font-medium text-bion-text">Enable Public Form</span>
                            <span className="text-[12.5px] text-bion-text-muted">
                                If disabled, the link will show a "Currently not accepting new projects"
                                message.
                            </span>
                        </div>
                        <ToggleSwitch checked={enabled} onChange={toggleEnabled} />
                    </div>
                </div>
            </div>

            <h3 className="my-[24px] text-[15px] font-semibold text-bion-text">Appearance</h3>
            <div className={CARD}>
                <div className={CARD_BODY}>
                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>Brand Logo</label>
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp,image/bmp,image/gif"
                            className="hidden"
                            onChange={onBannerSelected}
                        />
                        <button
                            type="button"
                            onClick={pickBanner}
                            className="flex cursor-pointer flex-col items-center gap-[12px] rounded-[8px] border-2 border-dashed border-bion-border bg-bion-bg p-[24px] text-center [transition:border-color_0.15s_ease] hover:border-bion-accent"
                        >
                            {bannerPreview ? (
                                <img
                                    src={bannerPreview}
                                    alt="Brand logo preview"
                                    className="h-[40px] w-[40px] rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-bion-surface-raised text-bion-text-muted">
                                    <svg className="h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                        <use href="#i-image" />
                                    </svg>
                                </div>
                            )}
                            <div className="text-[13.5px] font-medium text-bion-text">
                                Click to upload
                            </div>
                            <div className="text-[12px] text-bion-text-muted">SVG, PNG, JPG (max 2MB)</div>
                        </button>
                        {appearanceForm.errors.banner ? (
                            <span className={FIELD_ERROR}>{appearanceForm.errors.banner}</span>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>Form Title</label>
                        <input
                            type="text"
                            className={FIELD_INPUT}
                            value={appearanceForm.data.title}
                            onChange={(event) => appearanceForm.setData('title', event.target.value)}
                        />
                        {appearanceForm.errors.title ? (
                            <span className={FIELD_ERROR}>{appearanceForm.errors.title}</span>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>Welcome Message</label>
                        <textarea
                            className={cn(FIELD_INPUT, 'min-h-[80px] resize-y')}
                            value={appearanceForm.data.welcomeMessage}
                            onChange={(event) => appearanceForm.setData('welcomeMessage', event.target.value)}
                        />
                        {appearanceErrors.welcome_message ? (
                            <span className={FIELD_ERROR}>{appearanceErrors.welcome_message}</span>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>Background Theme</label>
                        <select
                            className={FIELD_INPUT}
                            value={appearanceForm.data.backgroundTheme}
                            onChange={(event) =>
                                appearanceForm.setData(
                                    'backgroundTheme',
                                    event.target.value as PublicLeadFormBackgroundTheme,
                                )
                            }
                        >
                            <option value="dark">Dark Mode (Default)</option>
                            <option value="light">Light Mode</option>
                            <option value="brand">Brand Color Auto-Match</option>
                        </select>
                    </div>
                </div>
                <div className={CARD_FOOTER}>
                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        disabled={appearanceForm.processing}
                        onClick={saveAppearance}
                    >
                        {appearanceForm.recentlySuccessful
                            ? 'Saved!'
                            : appearanceForm.processing
                              ? 'Saving...'
                              : 'Save Appearance'}
                    </button>
                </div>
            </div>

            <h3 className="my-[24px] text-[15px] font-semibold text-bion-text">Form Fields &amp; Services</h3>
            <div className={CARD}>
                <div className={CARD_BODY}>
                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>
                            "What do you need help with?" Options{' '}
                            <span className="text-[12px] font-normal text-bion-text-muted">
                                Clients can select multiple
                            </span>
                        </label>

                        <div className="flex flex-col gap-[8px] rounded-[8px] border border-bion-border bg-bion-bg p-[8px]">
                            {fieldsForm.data.services.map((service, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-[12px] rounded-[6px] border border-bion-border bg-bion-surface p-[10px_12px]"
                                >
                                    <input
                                        type="text"
                                        value={service}
                                        onChange={(event) => updateService(index, event.target.value)}
                                        className="flex-1 border-none bg-transparent text-[13.5px] text-bion-text outline-none"
                                    />
                                    <button
                                        type="button"
                                        className="p-[4px] text-bion-danger"
                                        onClick={() => removeService(index)}
                                    >
                                        <svg className={ICON_SM_CLS}>
                                            <use href="#i-x" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className={cn(BTN_GHOST, 'mt-[4px] self-start')}
                            onClick={addService}
                        >
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-plus" />
                            </svg>
                            Add Service
                        </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-bion-border pt-[20px]">
                        <div className="flex flex-col gap-[4px]">
                            <span className="text-[13.5px] font-medium text-bion-text">
                                Ask for Estimated Budget
                            </span>
                            <span className="text-[12.5px] text-bion-text-muted">
                                Show a dropdown for clients to select their budget range.
                            </span>
                        </div>
                        <ToggleSwitch
                            checked={fieldsForm.data.askBudget}
                            onChange={(value) => fieldsForm.setData('askBudget', value)}
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-bion-border pt-[20px]">
                        <div className="flex flex-col gap-[4px]">
                            <span className="text-[13.5px] font-medium text-bion-text">
                                Allow File Attachments
                            </span>
                            <span className="text-[12.5px] text-bion-text-muted">
                                Clients can upload briefs or reference images (up to 10MB).
                            </span>
                        </div>
                        <ToggleSwitch
                            checked={fieldsForm.data.allowAttachments}
                            onChange={(value) => fieldsForm.setData('allowAttachments', value)}
                        />
                    </div>
                </div>
                <div className={CARD_FOOTER}>
                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        disabled={fieldsForm.processing}
                        onClick={saveFields}
                    >
                        {fieldsForm.recentlySuccessful
                            ? 'Saved!'
                            : fieldsForm.processing
                              ? 'Saving...'
                              : 'Save Fields'}
                    </button>
                </div>
            </div>
        </>
    );
}
