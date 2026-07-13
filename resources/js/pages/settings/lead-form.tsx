import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { SOCIAL_PLATFORM_OPTIONS } from '@/lib/social-links';
import { cn } from '@/lib/utils';
import { publicLeadForm } from '@/routes';
import { update } from '@/routes/lead-form';
import type {
    PublicLeadFormBackgroundTheme,
    SettingsLeadFormPageProps,
    SocialLink,
} from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(
    BTN,
    'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]',
);
const BTN_GHOST = cn(
    BTN,
    'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised',
);
const BTN_SM =
    'inline-flex items-center gap-[6px] rounded-[7px] px-[12px] py-[7px] text-[12.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_SM_PRIMARY = cn(
    BTN_SM,
    'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]',
);

const FIELD_LABEL =
    'flex items-center justify-between text-[13px] font-semibold text-bion-text';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';
const FIELD_ERROR = 'text-[12px] text-bion-danger';
const FIELD_HINT = 'text-[12.5px] text-bion-text-muted';

const CARD =
    'overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface shadow-bion-raised';
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
                    'before:absolute before:bottom-[3px] before:left-[3px] before:h-[18px] before:w-[18px] before:rounded-full before:bg-white before:shadow-[0_2px_4px_rgba(0,0,0,0.2)] before:content-[""] before:[transition:.2s]',
                    checked
                        ? 'bg-bion-success before:translate-x-[20px]'
                        : 'bg-bion-border',
                )}
            />
        </label>
    );
}

type LinkFormValues = {
    leadFormSlug: string;
};

type AppearanceFormValues = {
    title: string;
    welcomeMessage: string;
    backgroundTheme: PublicLeadFormBackgroundTheme;
    backgroundColor: string;
    banner: File | null;
    backgroundImage: File | null;
    coverBanner: File | null;
};

type FieldsFormValues = {
    services: string[];
    askBudget: boolean;
    allowAttachments: boolean;
};

type LinksFormValues = {
    socialLinks: SocialLink[];
};

type SeoFormValues = {
    metaTitle: string;
    metaDescription: string;
    ogImage: File | null;
};

type LinkFieldErrors = Partial<Record<'lead_form_slug', string>>;

type AppearanceFieldErrors = Partial<
    Record<
        | 'title'
        | 'welcome_message'
        | 'background_theme'
        | 'background_color'
        | 'banner'
        | 'background_image'
        | 'cover_banner',
        string
    >
>;

type LinksFieldErrors = Partial<
    Record<`social_links.${number}.${'platform' | 'url'}`, string>
>;

type SeoFieldErrors = Partial<
    Record<'meta_title' | 'meta_description' | 'og_image', string>
>;

const DEFAULT_BACKGROUND_COLOR = '#0b0e14';
const RECOMMENDED_META_TITLE_LENGTH = 60;
const RECOMMENDED_META_DESCRIPTION_LENGTH = 160;

export default function SettingsLeadForm({
    formUrl,
    settings,
}: SettingsLeadFormPageProps) {
    const { currentTeam } = usePage().props;
    const [enabled, setEnabled] = useState(settings.enabled);
    const [linkCopied, setLinkCopied] = useState(false);
    const [bannerPreview, setBannerPreview] = useState<string | null>(
        settings.bannerUrl,
    );
    const [backgroundImagePreview, setBackgroundImagePreview] = useState<
        string | null
    >(settings.backgroundImageUrl);
    const [coverBannerPreview, setCoverBannerPreview] = useState<string | null>(
        settings.coverUrl,
    );
    const [ogImagePreview, setOgImagePreview] = useState<string | null>(
        settings.ogImageUrl,
    );
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const backgroundImageInputRef = useRef<HTMLInputElement>(null);
    const coverBannerInputRef = useRef<HTMLInputElement>(null);
    const ogImageInputRef = useRef<HTMLInputElement>(null);

    const linkPrefix = formUrl.slice(0, formUrl.length - settings.slug.length);

    const linkForm = useForm<LinkFormValues>({
        leadFormSlug: settings.customSlug ?? '',
    });

    const appearanceForm = useForm<AppearanceFormValues>({
        title: settings.title,
        welcomeMessage: settings.welcomeMessage,
        backgroundTheme: settings.backgroundTheme,
        backgroundColor: settings.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
        banner: null,
        backgroundImage: null,
        coverBanner: null,
    });

    const fieldsForm = useForm<FieldsFormValues>({
        services: settings.services,
        askBudget: settings.askBudget,
        allowAttachments: settings.allowAttachments,
    });

    const linksForm = useForm<LinksFormValues>({
        socialLinks: settings.socialLinks,
    });

    const seoForm = useForm<SeoFormValues>({
        metaTitle: settings.metaTitle,
        metaDescription: settings.metaDescription,
        ogImage: null,
    });

    const linkErrors = linkForm.errors as LinkFieldErrors;
    const appearanceErrors = appearanceForm.errors as AppearanceFieldErrors;
    const linksErrors = linksForm.errors as LinksFieldErrors;
    const seoErrors = seoForm.errors as SeoFieldErrors;

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

    const saveLink = (): void => {
        linkForm.put(update.url(), { preserveScroll: true });
    };

    const updateService = (index: number, value: string): void => {
        fieldsForm.setData(
            'services',
            fieldsForm.data.services.map((service, i) =>
                i === index ? value : service,
            ),
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

    const pickBackgroundImage = (): void => {
        backgroundImageInputRef.current?.click();
    };

    const onBackgroundImageSelected = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const file = event.target.files?.[0] ?? null;
        appearanceForm.setData('backgroundImage', file);

        if (file) {
            setBackgroundImagePreview(URL.createObjectURL(file));
        }
    };

    const pickCoverBanner = (): void => {
        coverBannerInputRef.current?.click();
    };

    const onCoverBannerSelected = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const file = event.target.files?.[0] ?? null;
        appearanceForm.setData('coverBanner', file);

        if (file) {
            setCoverBannerPreview(URL.createObjectURL(file));
        }
    };

    const saveAppearance = (): void => {
        appearanceForm.put(update.url(), { preserveScroll: true });
    };

    const saveFields = (): void => {
        fieldsForm.put(update.url(), { preserveScroll: true });
    };

    const addSocialLink = (): void => {
        linksForm.setData('socialLinks', [
            ...linksForm.data.socialLinks,
            { platform: 'website', url: '' },
        ]);
    };

    const removeSocialLink = (index: number): void => {
        linksForm.setData(
            'socialLinks',
            linksForm.data.socialLinks.filter((_, i) => i !== index),
        );
    };

    const updateSocialLink = (
        index: number,
        field: keyof SocialLink,
        value: string,
    ): void => {
        linksForm.setData(
            'socialLinks',
            linksForm.data.socialLinks.map((link, i) =>
                i === index ? { ...link, [field]: value } : link,
            ),
        );
    };

    const saveSocialLinks = (): void => {
        linksForm.put(update.url(), { preserveScroll: true });
    };

    const pickOgImage = (): void => {
        ogImageInputRef.current?.click();
    };

    const onOgImageSelected = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0] ?? null;
        seoForm.setData('ogImage', file);

        if (file) {
            setOgImagePreview(URL.createObjectURL(file));
        }
    };

    const saveSeo = (): void => {
        seoForm.put(update.url(), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Public Lead Form settings" />

            <div className="mb-[20px]">
                <h2 className="mb-[6px] text-[18px] font-semibold text-bion-text">
                    Public Lead Form
                </h2>
                <p className="text-[13.5px] text-bion-text-muted">
                    Customize the inquiry form you share with potential clients.
                </p>
            </div>

            <div className={CARD}>
                <div className={CARD_BODY}>
                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>
                            Your public form link
                        </label>
                        <div className="flex gap-[10px] max-[760px]:flex-col">
                            <input
                                type="text"
                                readOnly
                                className={cn(
                                    FIELD_INPUT,
                                    'text-bion-text-muted',
                                )}
                                value={formUrl}
                            />
                            <button
                                type="button"
                                className={BTN_GHOST}
                                onClick={copyFormLink}
                            >
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-link" />
                                </svg>
                                {linkCopied ? 'Copied' : 'Copy'}
                            </button>
                            {currentTeam ? (
                                <a
                                    href={publicLeadForm(settings.slug).url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={BTN_GHOST}
                                >
                                    Preview
                                </a>
                            ) : null}
                        </div>
                        <p className={cn('mt-[4px]', FIELD_HINT)}>
                            Share this link anywhere to collect leads directly
                            into your Opportunities pipeline.
                        </p>
                    </div>

                    <div className="flex flex-col gap-[8px] border-t border-bion-border pt-[20px]">
                        <label className={FIELD_LABEL}>Custom Link</label>
                        <div className="flex items-center gap-[2px] max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-[8px]">
                            <span className="shrink-0 rounded-[8px_0_0_8px] border border-r-0 border-bion-border bg-bion-surface-raised px-[14px] py-[10px] text-[13.5px] text-bion-text-muted max-[600px]:rounded-[8px] max-[600px]:border-r max-[600px]:border-b-0">
                                {linkPrefix}
                            </span>
                            <input
                                type="text"
                                className={cn(
                                    FIELD_INPUT,
                                    'rounded-[0_8px_8px_0] max-[600px]:rounded-[8px]',
                                )}
                                placeholder={currentTeam?.slug}
                                value={linkForm.data.leadFormSlug}
                                onChange={(event) =>
                                    linkForm.setData(
                                        'leadFormSlug',
                                        event.target.value.toLowerCase(),
                                    )
                                }
                            />
                        </div>
                        {linkErrors.lead_form_slug ? (
                            <span className={FIELD_ERROR}>
                                {linkErrors.lead_form_slug}
                            </span>
                        ) : null}
                        <p className={FIELD_HINT}>
                            Set a memorable link that stays the same even if you
                            rename your team. Leave blank to use the default.
                        </p>
                        <button
                            type="button"
                            className={cn(BTN_SM_PRIMARY, 'self-start')}
                            disabled={linkForm.processing}
                            onClick={saveLink}
                        >
                            {linkForm.recentlySuccessful
                                ? 'Saved!'
                                : linkForm.processing
                                  ? 'Saving...'
                                  : 'Save Link'}
                        </button>
                    </div>

                    <div className="mt-[4px] flex items-center justify-between border-t border-bion-border pt-[20px]">
                        <div className="flex flex-col gap-[4px]">
                            <span className="text-[13.5px] font-medium text-bion-text">
                                Enable Public Form
                            </span>
                            <span className={FIELD_HINT}>
                                If disabled, the link will show a "Currently not
                                accepting new projects" message.
                            </span>
                        </div>
                        <ToggleSwitch
                            checked={enabled}
                            onChange={toggleEnabled}
                        />
                    </div>
                </div>
            </div>

            <h3 className="my-[24px] text-[15px] font-semibold text-bion-text">
                Appearance
            </h3>
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
                            <div className="text-[12px] text-bion-text-muted">
                                SVG, PNG, JPG (max 2MB)
                            </div>
                        </button>
                        {appearanceForm.errors.banner ? (
                            <span className={FIELD_ERROR}>
                                {appearanceForm.errors.banner}
                            </span>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>Cover Banner</label>
                        <input
                            ref={coverBannerInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={onCoverBannerSelected}
                        />
                        <button
                            type="button"
                            onClick={pickCoverBanner}
                            className="relative flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-[8px] overflow-hidden rounded-[8px] border-2 border-dashed border-bion-border bg-bion-bg text-center [transition:border-color_0.15s_ease] hover:border-bion-accent"
                        >
                            {coverBannerPreview ? (
                                <img
                                    src={coverBannerPreview}
                                    alt="Cover banner preview"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <>
                                    <svg className="h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] text-bion-text-muted [stroke-linecap:round] [stroke-linejoin:round]">
                                        <use href="#i-image" />
                                    </svg>
                                    <div className="text-[13.5px] font-medium text-bion-text">
                                        Click to upload
                                    </div>
                                    <div className="text-[12px] text-bion-text-muted">
                                        Recommended 1200x400px, PNG or JPG (max
                                        5MB)
                                    </div>
                                </>
                            )}
                        </button>
                        {appearanceErrors.cover_banner ? (
                            <span className={FIELD_ERROR}>
                                {appearanceErrors.cover_banner}
                            </span>
                        ) : null}
                        <p className={FIELD_HINT}>
                            Displayed as a wide banner behind your logo at the
                            top of the form.
                        </p>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>Form Title</label>
                        <input
                            type="text"
                            className={FIELD_INPUT}
                            value={appearanceForm.data.title}
                            onChange={(event) =>
                                appearanceForm.setData(
                                    'title',
                                    event.target.value,
                                )
                            }
                        />
                        {appearanceForm.errors.title ? (
                            <span className={FIELD_ERROR}>
                                {appearanceForm.errors.title}
                            </span>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>Welcome Message</label>
                        <textarea
                            className={cn(FIELD_INPUT, 'min-h-[80px] resize-y')}
                            value={appearanceForm.data.welcomeMessage}
                            onChange={(event) =>
                                appearanceForm.setData(
                                    'welcomeMessage',
                                    event.target.value,
                                )
                            }
                        />
                        {appearanceErrors.welcome_message ? (
                            <span className={FIELD_ERROR}>
                                {appearanceErrors.welcome_message}
                            </span>
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
                                    event.target
                                        .value as PublicLeadFormBackgroundTheme,
                                )
                            }
                        >
                            <option value="dark">Dark Mode (Default)</option>
                            <option value="light">Light Mode</option>
                            <option value="brand">
                                Brand Color Auto-Match
                            </option>
                            <option value="custom">
                                Custom Color or Image
                            </option>
                        </select>

                        {appearanceForm.data.backgroundTheme === 'custom' ? (
                            <div className="mt-[8px] flex flex-col gap-[16px] rounded-[8px] border border-bion-border bg-bion-bg p-[16px]">
                                <div className="flex flex-col gap-[8px]">
                                    <label className={FIELD_LABEL}>
                                        Background Color
                                    </label>
                                    <div className="flex items-center gap-[10px]">
                                        <input
                                            type="color"
                                            className="h-[38px] w-[48px] shrink-0 cursor-pointer rounded-[8px] border border-bion-border bg-bion-surface p-[2px]"
                                            value={
                                                appearanceForm.data
                                                    .backgroundColor
                                            }
                                            onChange={(event) =>
                                                appearanceForm.setData(
                                                    'backgroundColor',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <input
                                            type="text"
                                            className={FIELD_INPUT}
                                            placeholder="#0b0e14"
                                            value={
                                                appearanceForm.data
                                                    .backgroundColor
                                            }
                                            onChange={(event) =>
                                                appearanceForm.setData(
                                                    'backgroundColor',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    {appearanceErrors.background_color ? (
                                        <span className={FIELD_ERROR}>
                                            {appearanceErrors.background_color}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="flex flex-col gap-[8px]">
                                    <label className={FIELD_LABEL}>
                                        Background Image (Optional)
                                    </label>
                                    <input
                                        ref={backgroundImageInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={onBackgroundImageSelected}
                                    />
                                    <button
                                        type="button"
                                        onClick={pickBackgroundImage}
                                        className="relative flex h-[100px] w-full cursor-pointer flex-col items-center justify-center gap-[6px] overflow-hidden rounded-[8px] border-2 border-dashed border-bion-border bg-bion-surface text-center [transition:border-color_0.15s_ease] hover:border-bion-accent"
                                    >
                                        {backgroundImagePreview ? (
                                            <img
                                                src={backgroundImagePreview}
                                                alt="Background image preview"
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                <svg className="h-[16px] w-[16px] shrink-0 fill-none stroke-current [stroke-width:1.6] text-bion-text-muted [stroke-linecap:round] [stroke-linejoin:round]">
                                                    <use href="#i-image" />
                                                </svg>
                                                <div className="text-[12.5px] font-medium text-bion-text">
                                                    Click to upload
                                                </div>
                                            </>
                                        )}
                                    </button>
                                    {appearanceErrors.background_image ? (
                                        <span className={FIELD_ERROR}>
                                            {appearanceErrors.background_image}
                                        </span>
                                    ) : null}
                                    <p className={FIELD_HINT}>
                                        Used as the full-page background instead
                                        of the color when set.
                                    </p>
                                </div>
                            </div>
                        ) : null}
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

            <h3 className="my-[24px] text-[15px] font-semibold text-bion-text">
                Form Fields &amp; Services
            </h3>
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
                                        onChange={(event) =>
                                            updateService(
                                                index,
                                                event.target.value,
                                            )
                                        }
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
                            <span className={FIELD_HINT}>
                                Show a dropdown for clients to select their
                                budget range.
                            </span>
                        </div>
                        <ToggleSwitch
                            checked={fieldsForm.data.askBudget}
                            onChange={(value) =>
                                fieldsForm.setData('askBudget', value)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-bion-border pt-[20px]">
                        <div className="flex flex-col gap-[4px]">
                            <span className="text-[13.5px] font-medium text-bion-text">
                                Allow File Attachments
                            </span>
                            <span className={FIELD_HINT}>
                                Clients can upload briefs or reference images
                                (up to 10MB).
                            </span>
                        </div>
                        <ToggleSwitch
                            checked={fieldsForm.data.allowAttachments}
                            onChange={(value) =>
                                fieldsForm.setData('allowAttachments', value)
                            }
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

            <h3 className="my-[24px] text-[15px] font-semibold text-bion-text">
                Social &amp; Custom Links
            </h3>
            <div className={CARD}>
                <div className={CARD_BODY}>
                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>
                            Links{' '}
                            <span className="text-[12px] font-normal text-bion-text-muted">
                                Shown as icons on your public form
                            </span>
                        </label>

                        <div className="flex flex-col gap-[8px] rounded-[8px] border border-bion-border bg-bion-bg p-[8px]">
                            {linksForm.data.socialLinks.length === 0 ? (
                                <p className="p-[10px_12px] text-[13px] text-bion-text-muted">
                                    No links added yet.
                                </p>
                            ) : null}
                            {linksForm.data.socialLinks.map((link, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-[4px]"
                                >
                                    <div className="flex items-center gap-[8px] rounded-[6px] border border-bion-border bg-bion-surface p-[10px_12px]">
                                        <select
                                            className="shrink-0 rounded-[6px] border border-bion-border bg-bion-bg px-[8px] py-[6px] text-[13px] text-bion-text outline-none"
                                            value={link.platform}
                                            onChange={(event) =>
                                                updateSocialLink(
                                                    index,
                                                    'platform',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {SOCIAL_PLATFORM_OPTIONS.map(
                                                ([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={link.url}
                                            onChange={(event) =>
                                                updateSocialLink(
                                                    index,
                                                    'url',
                                                    event.target.value,
                                                )
                                            }
                                            className="flex-1 border-none bg-transparent text-[13.5px] text-bion-text outline-none"
                                        />
                                        <button
                                            type="button"
                                            className="p-[4px] text-bion-danger"
                                            onClick={() =>
                                                removeSocialLink(index)
                                            }
                                        >
                                            <svg className={ICON_SM_CLS}>
                                                <use href="#i-x" />
                                            </svg>
                                        </button>
                                    </div>
                                    {linksErrors[
                                        `social_links.${index}.platform`
                                    ] ? (
                                        <span className={FIELD_ERROR}>
                                            {
                                                linksErrors[
                                                    `social_links.${index}.platform`
                                                ]
                                            }
                                        </span>
                                    ) : null}
                                    {linksErrors[
                                        `social_links.${index}.url`
                                    ] ? (
                                        <span className={FIELD_ERROR}>
                                            {
                                                linksErrors[
                                                    `social_links.${index}.url`
                                                ]
                                            }
                                        </span>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className={cn(BTN_GHOST, 'mt-[4px] self-start')}
                            onClick={addSocialLink}
                            disabled={linksForm.data.socialLinks.length >= 8}
                        >
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-plus" />
                            </svg>
                            Add Link
                        </button>
                    </div>
                </div>
                <div className={CARD_FOOTER}>
                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        disabled={linksForm.processing}
                        onClick={saveSocialLinks}
                    >
                        {linksForm.recentlySuccessful
                            ? 'Saved!'
                            : linksForm.processing
                              ? 'Saving...'
                              : 'Save Links'}
                    </button>
                </div>
            </div>

            <h3 className="my-[24px] text-[15px] font-semibold text-bion-text">
                SEO &amp; Sharing
            </h3>
            <div className={CARD}>
                <div className={CARD_BODY}>
                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>
                            Meta Title{' '}
                            <span
                                className={cn(
                                    'text-[12px] font-normal',
                                    seoForm.data.metaTitle.length >
                                        RECOMMENDED_META_TITLE_LENGTH
                                        ? 'text-bion-danger'
                                        : 'text-bion-text-muted',
                                )}
                            >
                                {seoForm.data.metaTitle.length}/
                                {RECOMMENDED_META_TITLE_LENGTH}
                            </span>
                        </label>
                        <input
                            type="text"
                            className={FIELD_INPUT}
                            placeholder={settings.title}
                            value={seoForm.data.metaTitle}
                            onChange={(event) =>
                                seoForm.setData('metaTitle', event.target.value)
                            }
                        />
                        {seoErrors.meta_title ? (
                            <span className={FIELD_ERROR}>
                                {seoErrors.meta_title}
                            </span>
                        ) : null}
                        <p className={FIELD_HINT}>
                            Shown in search results and browser tabs. Leave
                            blank to use the form title.
                        </p>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>
                            Meta Description{' '}
                            <span
                                className={cn(
                                    'text-[12px] font-normal',
                                    seoForm.data.metaDescription.length >
                                        RECOMMENDED_META_DESCRIPTION_LENGTH
                                        ? 'text-bion-danger'
                                        : 'text-bion-text-muted',
                                )}
                            >
                                {seoForm.data.metaDescription.length}/
                                {RECOMMENDED_META_DESCRIPTION_LENGTH}
                            </span>
                        </label>
                        <textarea
                            className={cn(FIELD_INPUT, 'min-h-[80px] resize-y')}
                            placeholder={settings.welcomeMessage}
                            value={seoForm.data.metaDescription}
                            onChange={(event) =>
                                seoForm.setData(
                                    'metaDescription',
                                    event.target.value,
                                )
                            }
                        />
                        {seoErrors.meta_description ? (
                            <span className={FIELD_ERROR}>
                                {seoErrors.meta_description}
                            </span>
                        ) : null}
                        <p className={FIELD_HINT}>
                            Shown in search results and link previews. Leave
                            blank to use the welcome message.
                        </p>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className={FIELD_LABEL}>
                            Social Sharing Image
                        </label>
                        <input
                            ref={ogImageInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={onOgImageSelected}
                        />
                        <button
                            type="button"
                            onClick={pickOgImage}
                            className="relative flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-[8px] overflow-hidden rounded-[8px] border-2 border-dashed border-bion-border bg-bion-bg text-center [transition:border-color_0.15s_ease] hover:border-bion-accent"
                        >
                            {ogImagePreview ? (
                                <img
                                    src={ogImagePreview}
                                    alt="Social sharing image preview"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <>
                                    <svg className="h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] text-bion-text-muted [stroke-linecap:round] [stroke-linejoin:round]">
                                        <use href="#i-image" />
                                    </svg>
                                    <div className="text-[13.5px] font-medium text-bion-text">
                                        Click to upload
                                    </div>
                                    <div className="text-[12px] text-bion-text-muted">
                                        Recommended 1200x630px, PNG or JPG (max
                                        5MB)
                                    </div>
                                </>
                            )}
                        </button>
                        {seoErrors.og_image ? (
                            <span className={FIELD_ERROR}>
                                {seoErrors.og_image}
                            </span>
                        ) : null}
                        <p className={FIELD_HINT}>
                            Shown when your form link is shared on social media
                            or chat apps. Falls back to your cover banner or
                            logo when not set.
                        </p>
                    </div>
                </div>
                <div className={CARD_FOOTER}>
                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        disabled={seoForm.processing}
                        onClick={saveSeo}
                    >
                        {seoForm.recentlySuccessful
                            ? 'Saved!'
                            : seoForm.processing
                              ? 'Saving...'
                              : 'Save SEO Settings'}
                    </button>
                </div>
            </div>
        </>
    );
}
