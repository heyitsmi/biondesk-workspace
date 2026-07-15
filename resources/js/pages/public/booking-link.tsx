import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { IconSprite } from '@/components/biondesk/icon-sprite';
import { cn } from '@/lib/utils';
import { store as submitBooking } from '@/routes/public-booking-link';
import type {
    PublicBookingLinkPageProps,
    PublicBookingSlot,
    PublicBookingSlotGroup,
} from '@/types';

type BookingFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    notes: string;
    startsAt: string;
    turnstileToken: string;
};

type BookingStep = 'time' | 'details';

type BookingFieldErrors = Partial<
    Record<
        | 'first_name'
        | 'last_name'
        | 'email'
        | 'company'
        | 'notes'
        | 'starts_at'
        | 'turnstile_token',
        string
    >
>;

const FIELD_LABEL =
    'mb-[7px] block text-[12px] font-semibold uppercase text-bion-text-muted [letter-spacing:0.04em]';
const FIELD_INPUT =
    'w-full rounded-[10px] border border-bion-border bg-bion-bg px-[14px] py-[12px] text-[14px] font-medium text-bion-text outline-none [transition:background_0.15s_ease,border-color_0.15s_ease,box-shadow_0.15s_ease] placeholder:text-bion-text-muted/70 focus:border-bion-accent focus:bg-bion-surface focus:shadow-[0_0_0_4px_var(--bion-accent-soft)]';
const FIELD_ERROR = 'mt-[6px] block text-[12px] text-bion-danger';
const TURNSTILE_CONTAINER_ID = 'booking-turnstile-widget';
const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

const THEME_VARS: CSSProperties = {
    '--bion-bg': '#f6f7f9',
    '--bion-surface': '#ffffff',
    '--bion-surface-raised': '#ffffff',
    '--bion-border': '#e4e6eb',
    '--bion-text': '#12161f',
    '--bion-text-muted': '#6b7280',
    '--bion-accent': '#c77f1f',
    '--bion-accent-soft': 'rgb(199 127 31 / 0.12)',
    '--bion-accent-text': '#ffffff',
    '--bion-success': '#1f8a5f',
    '--bion-success-soft': 'rgb(31 138 95 / 0.12)',
    '--bion-danger': '#d6383d',
    '--bion-danger-soft': 'rgb(214 56 61 / 0.1)',
} as CSSProperties;

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: Record<string, unknown>,
            ) => string;
            reset?: (widgetId?: string) => void;
        };
    }
}

export default function PublicBookingLinkPage({
    team,
    bookingLink,
    slotGroups,
    turnstileSiteKey,
}: PublicBookingLinkPageProps) {
    const [submitted, setSubmitted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(slotGroups[0]?.date ?? '');
    const [step, setStep] = useState<BookingStep>('time');
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<BookingFormValues>({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        notes: '',
        startsAt: '',
        turnstileToken: '',
    });
    const fieldErrors = errors as BookingFieldErrors;

    const visibleGroup = useMemo(
        () =>
            slotGroups.find((group) => group.date === selectedDate) ??
            slotGroups[0],
        [selectedDate, slotGroups],
    );

    const selectedSlot = useMemo(
        () =>
            slotGroups
                .flatMap((group) => group.slots)
                .find((slot) => slot.startsAt === data.startsAt),
        [data.startsAt, slotGroups],
    );

    const selectedSlotGroup = useMemo(
        () =>
            slotGroups.find((group) =>
                group.slots.some((slot) => slot.startsAt === data.startsAt),
            ),
        [data.startsAt, slotGroups],
    );
    const initials = team.name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

    useEffect(() => {
        if (!turnstileSiteKey) {
            return;
        }

        const renderWidget = (): void => {
            if (!window.turnstile) {
                return;
            }

            const container = document.getElementById(TURNSTILE_CONTAINER_ID);

            if (!container || container.dataset.rendered === 'true') {
                return;
            }

            window.turnstile.render(container, {
                sitekey: turnstileSiteKey,
                callback: (token: string) => setData('turnstileToken', token),
                'expired-callback': () => setData('turnstileToken', ''),
            });
            container.dataset.rendered = 'true';
        };

        if (window.turnstile) {
            renderWidget();

            return;
        }

        if (!document.getElementById(TURNSTILE_SCRIPT_ID)) {
            const script = document.createElement('script');
            script.id = TURNSTILE_SCRIPT_ID;
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.onload = renderWidget;
            document.head.appendChild(script);
        }
    }, [setData, turnstileSiteKey]);

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        post(
            submitBooking({
                team: team.leadFormSlug || team.slug,
                bookingLink: bookingLink.slug,
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitted(true);
                    reset();
                },
                onError: (responseErrors) => {
                    if (responseErrors.starts_at) {
                        setStep('time');
                    }

                    window.turnstile?.reset?.();
                    setData('turnstileToken', '');
                },
            },
        );
    };

    return (
        <>
            <Head title={`${bookingLink.name} | ${team.name}`} />
            <IconSprite />

            <main
                style={THEME_VARS}
                className="min-h-screen bg-[#f4f6fa] px-[20px] py-[36px] text-bion-text max-[760px]:px-[14px] max-[760px]:py-[18px]"
            >
                <div className="mx-auto grid max-w-[1180px] grid-cols-[330px_minmax(0,1fr)] gap-[22px] max-[940px]:grid-cols-1">
                    <aside className="h-fit rounded-[14px] border border-bion-border bg-bion-surface p-[22px] shadow-[0_22px_60px_rgb(18_22_31/0.08)]">
                        <div className="mb-[22px] flex items-center justify-between gap-[12px]">
                            <div className="flex items-center gap-[12px]">
                                {team.imageUrl ? (
                                    <img
                                        src={team.imageUrl}
                                        alt={team.name}
                                        className="h-[38px] w-[38px] rounded-[10px] border border-bion-border bg-bion-bg object-cover"
                                    />
                                ) : (
                                    <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-bion-border bg-bion-accent text-[13px] font-semibold text-bion-accent-text">
                                        {initials}
                                    </span>
                                )}
                                <div>
                                    <div className="text-[14px] font-semibold">{team.name}</div>
                                    <div className="text-[12px] text-bion-text-muted">Booking link</div>
                                </div>
                            </div>
                            <span className="rounded-full border border-bion-border bg-bion-bg px-[9px] py-[5px] text-[11px] font-semibold text-bion-text-muted">
                                Public
                            </span>
                        </div>

                        <div className="mb-[22px] border-b border-bion-border pb-[22px]">
                            <h1 className="mb-[10px] text-[30px] font-semibold leading-[1.08]">
                                {bookingLink.name}
                            </h1>
                            <p className="text-[14px] leading-[1.65] text-bion-text-muted">
                                {bookingLink.description ||
                                    'Pick an available time and share a few details before the meeting.'}
                            </p>
                        </div>

                        <div className="space-y-[9px] text-[13px] text-bion-text-muted">
                            <MetaRow
                                icon="i-clock"
                                label="Duration"
                                value={`${bookingLink.durationMinutes} minutes`}
                            />
                            <MetaRow icon="i-calendar" label="Timezone" value={bookingLink.timezone} />
                            {bookingLink.location ? (
                                <MetaRow icon="i-link" label="Location" value={bookingLink.location} />
                            ) : null}
                        </div>
                    </aside>

                    <section className="overflow-hidden rounded-[14px] border border-bion-border bg-bion-surface shadow-[0_22px_60px_rgb(18_22_31/0.08)]">
                        {submitted ? (
                            <div className="p-[30px]">
                                <div className="mb-[18px] inline-flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-bion-success-soft text-bion-success">
                                    <svg className="h-[21px] w-[21px] fill-none stroke-current [stroke-width:2]">
                                        <use href="#i-check" />
                                    </svg>
                                </div>
                                <h2 className="mb-[8px] text-[24px] font-semibold">Booking confirmed</h2>
                                <p className="max-w-[560px] text-[14px] leading-[1.65] text-bion-text-muted">
                                    Thanks. A confirmation has been sent to your email and the team has been notified.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submit}>
                                <div className="border-b border-bion-border bg-bion-surface-raised px-[24px] py-[16px]">
                                    <StepIndicator step={step} hasSelectedSlot={Boolean(data.startsAt)} />
                                </div>

                                {step === 'time' ? (
                                    <div className="p-[24px]">
                                        <div className="mb-[20px] flex flex-wrap items-start justify-between gap-[12px]">
                                            <div>
                                                <div className="mb-[8px] inline-flex items-center gap-[7px] rounded-full bg-bion-bg px-[10px] py-[5px] text-[11px] font-semibold uppercase text-bion-text-muted [letter-spacing:0.04em]">
                                                    <span className="h-[6px] w-[6px] rounded-full bg-bion-accent" />
                                                    Step 1
                                                </div>
                                                <h2 className="mb-[6px] text-[24px] font-semibold leading-[1.1]">
                                                    Choose a time
                                                </h2>
                                                <p className="text-[13px] text-bion-text-muted">
                                                    Available slots are based on {bookingLink.timezone}.
                                                </p>
                                            </div>
                                            {selectedSlot && selectedSlotGroup ? (
                                                <SelectedSlotPill
                                                    date={selectedSlotGroup.label}
                                                    time={selectedSlot.time}
                                                />
                                            ) : null}
                                        </div>

                                        {slotGroups.length === 0 ? (
                                            <div className="rounded-[12px] border border-dashed border-bion-border bg-bion-bg p-[18px] text-[13px] text-bion-text-muted">
                                                No available slots right now.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-[18px] max-[760px]:grid-cols-1">
                                                <div className="max-h-[470px] overflow-y-auto rounded-[12px] border border-bion-border bg-bion-bg p-[8px]">
                                                    <div className="flex flex-col gap-[7px]">
                                                        {slotGroups.map((group) => (
                                                            <button
                                                                key={group.date}
                                                                type="button"
                                                                className={cn(
                                                                    'rounded-[10px] border px-[13px] py-[12px] text-left [transition:background_0.15s_ease,border-color_0.15s_ease,box-shadow_0.15s_ease,color_0.15s_ease]',
                                                                    group.date === selectedDate
                                                                        ? 'border-bion-accent bg-bion-surface text-bion-accent shadow-[0_8px_22px_rgb(199_127_31/0.10)]'
                                                                        : 'border-transparent bg-transparent text-bion-text hover:border-bion-border hover:bg-bion-surface',
                                                                )}
                                                                onClick={() => setSelectedDate(group.date)}
                                                            >
                                                                <span className="block text-[13.5px] font-semibold">
                                                                    {group.label}
                                                                </span>
                                                                <span className="mt-[4px] block text-[11.5px] font-medium text-bion-text-muted">
                                                                    {group.slots.length} available slots
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="rounded-[12px] border border-bion-border bg-bion-bg p-[10px]">
                                                    <SlotGrid
                                                        group={visibleGroup}
                                                        selected={data.startsAt}
                                                        onSelect={(slot) => {
                                                            setData('startsAt', slot.startsAt);
                                                            setStep('details');
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {fieldErrors.starts_at ? (
                                            <span className={FIELD_ERROR}>{fieldErrors.starts_at}</span>
                                        ) : null}

                                        <div className="mt-[18px] flex items-center justify-between gap-[12px] rounded-[12px] border border-bion-border bg-bion-bg px-[14px] py-[12px] max-[620px]:flex-col max-[620px]:items-stretch">
                                            <p className="text-[12.5px] text-bion-text-muted">
                                                {selectedSlot && selectedSlotGroup
                                                    ? `${selectedSlotGroup.label} at ${selectedSlot.time} is selected.`
                                                    : 'Select a time to continue.'}
                                            </p>
                                            <button
                                                type="button"
                                                disabled={!data.startsAt}
                                                className="inline-flex items-center justify-center gap-[8px] rounded-[10px] bg-bion-text px-[16px] py-[10px] text-[13px] font-semibold text-white disabled:opacity-45"
                                                onClick={() => setStep('details')}
                                            >
                                                Continue
                                                <svg className="h-[15px] w-[15px] fill-none stroke-current [stroke-width:1.8]">
                                                    <use href="#i-arrow-right" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-[24px] p-[24px] max-[900px]:grid-cols-1">
                                        <div>
                                            <div className="mb-[20px]">
                                                <div className="mb-[8px] inline-flex items-center gap-[7px] rounded-full bg-bion-bg px-[10px] py-[5px] text-[11px] font-semibold uppercase text-bion-text-muted [letter-spacing:0.04em]">
                                                    <span className="h-[6px] w-[6px] rounded-full bg-bion-accent" />
                                                    Step 2
                                                </div>
                                                <h2 className="mb-[6px] text-[24px] font-semibold leading-[1.1]">
                                                    Your details
                                                </h2>
                                                <p className="max-w-[520px] text-[13px] leading-[1.6] text-bion-text-muted">
                                                    Add your contact details so the team can prepare for the meeting.
                                                </p>
                                            </div>

                                            <div className="space-y-[15px]">
                                                <div className="grid grid-cols-2 gap-[12px] max-[560px]:grid-cols-1">
                                                    <Field label="First name" error={fieldErrors.first_name}>
                                                        <input
                                                            value={data.firstName}
                                                            onChange={(event) =>
                                                                setData('firstName', event.target.value)
                                                            }
                                                            className={FIELD_INPUT}
                                                        />
                                                    </Field>
                                                    <Field label="Last name" error={fieldErrors.last_name}>
                                                        <input
                                                            value={data.lastName}
                                                            onChange={(event) =>
                                                                setData('lastName', event.target.value)
                                                            }
                                                            className={FIELD_INPUT}
                                                        />
                                                    </Field>
                                                </div>
                                                <Field label="Email" error={fieldErrors.email}>
                                                    <input
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(event) => setData('email', event.target.value)}
                                                        className={FIELD_INPUT}
                                                    />
                                                </Field>
                                                <Field label="Company" error={fieldErrors.company}>
                                                    <input
                                                        value={data.company}
                                                        onChange={(event) => setData('company', event.target.value)}
                                                        className={FIELD_INPUT}
                                                    />
                                                </Field>
                                                <Field label="Notes" error={fieldErrors.notes}>
                                                    <textarea
                                                        rows={4}
                                                        value={data.notes}
                                                        onChange={(event) => setData('notes', event.target.value)}
                                                        className={`${FIELD_INPUT} resize-none leading-[1.5]`}
                                                        placeholder="Anything helpful before the call?"
                                                    />
                                                </Field>

                                                {turnstileSiteKey ? (
                                                    <div>
                                                        <div id={TURNSTILE_CONTAINER_ID} />
                                                        {fieldErrors.turnstile_token ? (
                                                            <span className={FIELD_ERROR}>
                                                                {fieldErrors.turnstile_token}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                        <aside className="h-fit rounded-[12px] border border-bion-border bg-bion-bg p-[14px] shadow-[0_10px_28px_rgb(18_22_31/0.04)]">
                                            <div className="mb-[12px] flex items-center justify-between gap-[10px]">
                                                <div className="text-[12px] font-semibold uppercase text-bion-text-muted [letter-spacing:0.04em]">
                                                    Selected time
                                                </div>
                                                <button
                                                    type="button"
                                                    className="rounded-full bg-bion-surface px-[9px] py-[5px] text-[11.5px] font-semibold text-bion-accent hover:bg-bion-accent-soft"
                                                    onClick={() => setStep('time')}
                                                >
                                                    Change
                                                </button>
                                            </div>
                                            {selectedSlot && selectedSlotGroup ? (
                                                <div className="mb-[14px] rounded-[11px] border border-bion-border bg-bion-surface p-[14px]">
                                                    <div className="mb-[10px] flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-bion-accent-soft text-bion-accent">
                                                        <svg className="h-[16px] w-[16px] fill-none stroke-current [stroke-width:1.9]">
                                                            <use href="#i-calendar" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-[15px] font-semibold text-bion-text">
                                                        {selectedSlotGroup.label}
                                                    </div>
                                                    <div className="mt-[5px] font-mono text-[13px] text-bion-text-muted">
                                                        {selectedSlot.time} {bookingLink.timezone}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-[14px] rounded-[11px] border border-dashed border-bion-border px-[13px] py-[12px] text-[13px] text-bion-text-muted">
                                                    No slot selected.
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-[10px]">
                                                <button
                                                    type="submit"
                                                    disabled={processing || !data.startsAt}
                                                    className="inline-flex items-center justify-center gap-[8px] rounded-[10px] bg-bion-accent px-[16px] py-[12px] text-[14px] font-semibold text-bion-accent-text shadow-[0_10px_24px_rgb(199_127_31/0.20)] disabled:opacity-60"
                                                >
                                                    <svg className="h-[16px] w-[16px] fill-none stroke-current [stroke-width:1.8]">
                                                        <use href="#i-check" />
                                                    </svg>
                                                    {processing ? 'Booking...' : 'Confirm booking'}
                                                </button>
                                            </div>
                                        </aside>
                                    </div>
                                )}
                            </form>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

function StepIndicator({
    step,
    hasSelectedSlot,
}: {
    step: BookingStep;
    hasSelectedSlot: boolean;
}) {
    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[10px] max-[620px]:grid-cols-1">
            <StepItem
                number="1"
                label="Date & time"
                active={step === 'time'}
                complete={hasSelectedSlot}
            />
            <div className="h-px w-[46px] bg-bion-border max-[620px]:hidden" />
            <StepItem
                number="2"
                label="Your details"
                active={step === 'details'}
                complete={false}
            />
        </div>
    );
}

function StepItem({
    number,
    label,
    active,
    complete,
}: {
    number: string;
    label: string;
    active: boolean;
    complete: boolean;
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-[10px] rounded-[11px] border px-[12px] py-[9px] [transition:background_0.15s_ease,border-color_0.15s_ease,color_0.15s_ease]',
                active || complete
                    ? 'border-bion-accent bg-bion-surface text-bion-accent shadow-[0_8px_24px_rgb(199_127_31/0.08)]'
                    : 'border-bion-border bg-bion-bg text-bion-text-muted',
            )}
        >
            <span
                className={cn(
                    'flex h-[28px] w-[28px] items-center justify-center rounded-full text-[12px] font-semibold',
                    active || complete
                        ? 'bg-bion-accent text-bion-accent-text'
                        : 'bg-bion-surface text-bion-text-muted',
                )}
            >
                {number}
            </span>
            <span className="text-[13px] font-semibold">{label}</span>
        </div>
    );
}

function SelectedSlotPill({ date, time }: { date: string; time: string }) {
    return (
        <div className="inline-flex items-center gap-[8px] rounded-full border border-bion-accent bg-bion-surface px-[12px] py-[7px] text-[12px] font-semibold text-bion-accent shadow-[0_8px_20px_rgb(199_127_31/0.10)]">
            <svg className="h-[14px] w-[14px] fill-none stroke-current [stroke-width:1.8]">
                <use href="#i-calendar" />
            </svg>
            {date} · {time}
        </div>
    );
}

function SlotGrid({
    group,
    selected,
    onSelect,
}: {
    group: PublicBookingSlotGroup | undefined;
    selected: string;
    onSelect: (slot: PublicBookingSlot) => void;
}) {
    if (!group) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 content-start gap-[10px] max-[560px]:grid-cols-1">
            {group.slots.map((slot) => (
                <button
                    key={slot.startsAt}
                    type="button"
                    className={cn(
                        'rounded-[10px] border px-[12px] py-[13px] text-[14px] font-semibold [transition:background_0.15s_ease,border-color_0.15s_ease,box-shadow_0.15s_ease,color_0.15s_ease]',
                        slot.startsAt === selected
                            ? 'border-bion-accent bg-bion-accent text-bion-accent-text shadow-[0_10px_24px_rgb(199_127_31/0.20)]'
                            : 'border-bion-border bg-bion-surface text-bion-text hover:border-bion-accent hover:shadow-[0_8px_20px_rgb(18_22_31/0.06)]',
                    )}
                    onClick={() => onSelect(slot)}
                >
                    {slot.time}
                </button>
            ))}
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className={FIELD_LABEL}>{label}</span>
            {children}
            {error ? <span className={FIELD_ERROR}>{error}</span> : null}
        </label>
    );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-[10px] rounded-[10px] border border-bion-border bg-bion-bg px-[12px] py-[10px]">
            <span className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-bion-surface text-bion-accent">
                <svg className="h-[14px] w-[14px] fill-none stroke-current [stroke-width:1.8]">
                    <use href={`#${icon}`} />
                </svg>
            </span>
            <span className="flex min-w-0 items-center justify-between gap-[12px]">
                <span>{label}</span>
                <span className="truncate font-mono text-bion-text">{value}</span>
            </span>
        </div>
    );
}
