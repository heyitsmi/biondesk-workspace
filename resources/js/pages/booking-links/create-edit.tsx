import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { dashboard } from '@/routes';
import {
    index as bookingLinks,
    store as storeBookingLink,
    update as updateBookingLink,
} from '@/routes/booking-links';
import type {
    BookingAvailability,
    BookingAvailabilityWindow,
    BookingLinkFormPageProps,
} from '@/types';

type BookingLinkForm = {
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    duration_minutes: string;
    buffer_before_minutes: string;
    buffer_after_minutes: string;
    timezone: string;
    availability: BookingAvailability;
    min_notice_minutes: string;
    max_days_ahead: string;
    location: string;
};

const WEEKDAYS = [
    ['monday', 'Monday'],
    ['tuesday', 'Tuesday'],
    ['wednesday', 'Wednesday'],
    ['thursday', 'Thursday'],
    ['friday', 'Friday'],
    ['saturday', 'Saturday'],
    ['sunday', 'Sunday'],
] as const;

const FIELD_LABEL =
    'text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]';
const FIELD_INPUT =
    'rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[10px] text-[14px] text-bion-text outline-none focus:border-bion-accent';

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function BookingLinkCreateEditPage({
    mode,
    bookingLink,
    defaults,
}: BookingLinkFormPageProps) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const initialAvailability = useMemo(
        () => bookingLink?.availability ?? defaults.availability,
        [bookingLink?.availability, defaults.availability],
    );

    const { data, setData, post, put, processing, errors } =
        useForm<BookingLinkForm>({
            name: bookingLink?.name ?? '',
            slug: bookingLink?.slug ?? '',
            description: bookingLink?.description ?? '',
            is_active: bookingLink?.isActive ?? true,
            duration_minutes: String(
                bookingLink?.durationMinutes ?? defaults.durationMinutes,
            ),
            buffer_before_minutes: String(
                bookingLink?.bufferBeforeMinutes ?? defaults.bufferBeforeMinutes,
            ),
            buffer_after_minutes: String(
                bookingLink?.bufferAfterMinutes ?? defaults.bufferAfterMinutes,
            ),
            timezone: bookingLink?.timezone ?? defaults.timezone,
            availability: initialAvailability,
            min_notice_minutes: String(
                bookingLink?.minNoticeMinutes ?? defaults.minNoticeMinutes,
            ),
            max_days_ahead: String(
                bookingLink?.maxDaysAhead ?? defaults.maxDaysAhead,
            ),
            location: bookingLink?.location ?? '',
        });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!teamSlug) {
            return;
        }

        if (mode === 'edit' && bookingLink) {
            put(
                updateBookingLink({
                    current_team: teamSlug,
                    bookingLink: bookingLink.id,
                }).url,
            );

            return;
        }

        post(storeBookingLink(teamSlug).url);
    };

    const setDayActive = (day: string, active: boolean): void => {
        const next = { ...data.availability };
        next[day] = active ? [{ start: '09:00', end: '17:00' }] : [];
        setData('availability', next);
    };

    const setDayWindow = (
        day: string,
        key: keyof BookingAvailabilityWindow,
        value: string,
    ): void => {
        const current = data.availability[day]?.[0] ?? {
            start: '09:00',
            end: '17:00',
        };

        setData('availability', {
            ...data.availability,
            [day]: [{ ...current, [key]: value }],
        });
    };

    const onNameChange = (value: string): void => {
        setData((current) => ({
            ...current,
            name: value,
            slug:
                mode === 'create' || current.slug === toSlug(current.name)
                    ? toSlug(value)
                    : current.slug,
        }));
    };

    return (
        <>
            <Head title={mode === 'edit' ? 'Edit Booking Link' : 'New Booking Link'} />

            <div className="mb-[24px] flex items-start justify-between gap-[16px]">
                <p className="text-[13px] text-bion-text-muted">
                    Configure the public booking page, weekly availability, and calendar event behavior.
                </p>
                <Link
                    href={teamSlug ? bookingLinks(teamSlug).url : '#'}
                    className="inline-flex items-center gap-[8px] rounded-[8px] border border-bion-border px-[12px] py-[8px] text-[13px] font-semibold text-bion-text hover:border-bion-accent"
                >
                    <svg className="h-[15px] w-[15px] fill-none stroke-current [stroke-width:1.7]">
                        <use href="#i-arrow-left" />
                    </svg>
                    Back
                </Link>
            </div>

            <form
                onSubmit={submit}
                className="grid grid-cols-[minmax(0,1fr)_360px] gap-[24px] max-[1080px]:grid-cols-1"
            >
                <section className="rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="border-b border-bion-border px-[18px] py-[16px]">
                        <h2 className="text-[15px] font-semibold text-bion-text">Availability</h2>
                    </div>
                    <div className="divide-y divide-bion-border">
                        {WEEKDAYS.map(([day, label]) => {
                            const window = data.availability[day]?.[0];
                            const active = Boolean(window);

                            return (
                                <div
                                    key={day}
                                    className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-[16px] px-[18px] py-[14px] max-[720px]:grid-cols-1"
                                >
                                    <label className="flex items-center gap-[10px]">
                                        <input
                                            type="checkbox"
                                            checked={active}
                                            className="h-[16px] w-[16px] accent-bion-accent"
                                            onChange={(event) =>
                                                setDayActive(day, event.target.checked)
                                            }
                                        />
                                        <span className="text-[13px] font-semibold text-bion-text">
                                            {label}
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-[10px]">
                                        <input
                                            type="time"
                                            disabled={!active}
                                            value={window?.start ?? '09:00'}
                                            className={FIELD_INPUT}
                                            onChange={(event) =>
                                                setDayWindow(day, 'start', event.target.value)
                                            }
                                        />
                                        <span className="text-[12px] text-bion-text-muted">to</span>
                                        <input
                                            type="time"
                                            disabled={!active}
                                            value={window?.end ?? '17:00'}
                                            className={FIELD_INPUT}
                                            onChange={(event) =>
                                                setDayWindow(day, 'end', event.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {errors.availability ? (
                        <div className="border-t border-bion-border px-[18px] py-[12px] text-[12px] text-bion-danger">
                            {errors.availability}
                        </div>
                    ) : null}
                </section>

                <aside className="h-fit rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="border-b border-bion-border px-[18px] py-[16px]">
                        <h2 className="text-[15px] font-semibold text-bion-text">
                            {mode === 'edit' ? 'Edit Link' : 'Create Link'}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-[16px] p-[18px]">
                        <Field label="Name" error={errors.name}>
                            <input
                                value={data.name}
                                onChange={(event) => onNameChange(event.target.value)}
                                className={FIELD_INPUT}
                                placeholder="Discovery Call"
                            />
                        </Field>

                        <Field label="Slug" error={errors.slug}>
                            <input
                                value={data.slug}
                                onChange={(event) => setData('slug', toSlug(event.target.value))}
                                className={FIELD_INPUT}
                                placeholder="discovery-call"
                            />
                        </Field>

                        <Field label="Description" error={errors.description}>
                            <textarea
                                value={data.description}
                                rows={3}
                                onChange={(event) => setData('description', event.target.value)}
                                className={`${FIELD_INPUT} resize-none leading-[1.5]`}
                                placeholder="A quick call to understand your project."
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-[12px]">
                            <Field label="Duration" error={errors.duration_minutes}>
                                <input
                                    type="number"
                                    min={15}
                                    max={240}
                                    value={data.duration_minutes}
                                    onChange={(event) =>
                                        setData('duration_minutes', event.target.value)
                                    }
                                    className={FIELD_INPUT}
                                />
                            </Field>
                            <Field label="Max days" error={errors.max_days_ahead}>
                                <input
                                    type="number"
                                    min={1}
                                    max={180}
                                    value={data.max_days_ahead}
                                    onChange={(event) =>
                                        setData('max_days_ahead', event.target.value)
                                    }
                                    className={FIELD_INPUT}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-[12px]">
                            <Field label="Buffer before" error={errors.buffer_before_minutes}>
                                <input
                                    type="number"
                                    min={0}
                                    value={data.buffer_before_minutes}
                                    onChange={(event) =>
                                        setData('buffer_before_minutes', event.target.value)
                                    }
                                    className={FIELD_INPUT}
                                />
                            </Field>
                            <Field label="Buffer after" error={errors.buffer_after_minutes}>
                                <input
                                    type="number"
                                    min={0}
                                    value={data.buffer_after_minutes}
                                    onChange={(event) =>
                                        setData('buffer_after_minutes', event.target.value)
                                    }
                                    className={FIELD_INPUT}
                                />
                            </Field>
                        </div>

                        <Field label="Minimum notice" error={errors.min_notice_minutes}>
                            <input
                                type="number"
                                min={0}
                                value={data.min_notice_minutes}
                                onChange={(event) =>
                                    setData('min_notice_minutes', event.target.value)
                                }
                                className={FIELD_INPUT}
                            />
                        </Field>

                        <Field label="Timezone" error={errors.timezone}>
                            <input
                                value={data.timezone}
                                onChange={(event) => setData('timezone', event.target.value)}
                                className={FIELD_INPUT}
                            />
                        </Field>

                        <Field label="Location" error={errors.location}>
                            <input
                                value={data.location}
                                onChange={(event) => setData('location', event.target.value)}
                                className={FIELD_INPUT}
                                placeholder="Google Meet, Zoom, office address..."
                            />
                        </Field>

                        <label className="flex items-center gap-[10px] rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[10px]">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) =>
                                    setData('is_active', event.target.checked)
                                }
                                className="h-[16px] w-[16px] accent-bion-accent"
                            />
                            <span className="text-[13px] font-medium text-bion-text">
                                Booking link is active
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-[8px] rounded-[8px] bg-bion-accent px-[14px] py-[10px] text-[13px] font-semibold text-bion-accent-text disabled:opacity-60"
                        >
                            <svg className="h-[15px] w-[15px] fill-none stroke-current [stroke-width:1.7]">
                                <use href="#i-check" />
                            </svg>
                            {processing
                                ? 'Saving...'
                                : mode === 'edit'
                                  ? 'Save booking link'
                                  : 'Create booking link'}
                        </button>
                    </div>
                </aside>
            </form>
        </>
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
        <label className="flex flex-col gap-[7px]">
            <span className={FIELD_LABEL}>{label}</span>
            {children}
            {error ? <span className="text-[12px] text-bion-danger">{error}</span> : null}
        </label>
    );
}

BookingLinkCreateEditPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Booking Links',
            href: props.currentTeam ? bookingLinks(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName: 'flex-1 overflow-y-auto px-[32px] py-[28px] max-[760px]:px-[16px]',
});
