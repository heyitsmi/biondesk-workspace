import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as createBookingLink,
    destroy as destroyBookingLink,
    edit as editBookingLink,
    index as bookingLinks,
    toggle as toggleBookingLink,
} from '@/routes/booking-links';
import type { BookingLinkItem, BookingLinksPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.7] [stroke-linecap:round] [stroke-linejoin:round]';

export default function BookingLinksIndexPage({
    bookingLinks: items,
}: BookingLinksPageProps) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [busyId, setBusyId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const summary = useMemo(
        () => ({
            total: items.length,
            active: items.filter((item) => item.isActive).length,
            bookings: items.reduce((total, item) => total + item.bookingsCount, 0),
        }),
        [items],
    );

    const copyPublicUrl = async (item: BookingLinkItem): Promise<void> => {
        const absoluteUrl = new URL(item.publicUrl, window.location.origin).toString();

        await navigator.clipboard.writeText(absoluteUrl);
        setCopiedId(item.id);
        window.setTimeout(() => setCopiedId(null), 1600);
    };

    const toggle = (item: BookingLinkItem): void => {
        if (!teamSlug) {
            return;
        }

        setBusyId(item.id);
        router.patch(
            toggleBookingLink({ current_team: teamSlug, bookingLink: item.id }).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyId(null),
            },
        );
    };

    const remove = (item: BookingLinkItem): void => {
        if (!teamSlug || !window.confirm(`Delete booking link "${item.name}"?`)) {
            return;
        }

        setBusyId(item.id);
        router.delete(
            destroyBookingLink({
                current_team: teamSlug,
                bookingLink: item.id,
            }).url,
            {
                preserveScroll: true,
                onFinish: () => setBusyId(null),
            },
        );
    };

    return (
        <>
            <Head title="Booking Links" />

            <div className="mb-[24px] flex flex-wrap items-start justify-between gap-[16px]">
                <p className="max-w-[720px] text-[13px] leading-[1.6] text-bion-text-muted">
                    Create public scheduling links for discovery calls, audits, and client check-ins. Successful bookings
                    create a calendar event, contact, opportunity, and booking history automatically.
                </p>
                <Link
                    href={teamSlug ? createBookingLink(teamSlug).url : '#'}
                    className="inline-flex items-center gap-[8px] rounded-[8px] bg-bion-accent px-[14px] py-[9px] text-[13px] font-semibold text-bion-accent-text"
                >
                    <svg className={ICON_SM_CLS}>
                        <use href="#i-plus" />
                    </svg>
                    New booking link
                </Link>
            </div>

            <div className="mb-[24px] grid grid-cols-3 gap-[16px] max-[760px]:grid-cols-1">
                <MetricCard label="Booking links" value={summary.total} icon="i-calendar" />
                <MetricCard label="Active" value={summary.active} icon="i-check" />
                <MetricCard label="Bookings" value={summary.bookings} icon="i-users" />
            </div>

            {items.length === 0 ? (
                <section className="rounded-[12px] border border-dashed border-bion-border bg-bion-surface p-[28px] text-center">
                    <h2 className="mb-[8px] text-[16px] font-semibold text-bion-text">No booking links yet</h2>
                    <p className="mb-[18px] text-[13px] text-bion-text-muted">
                        Start with a simple weekly availability window and share the public link.
                    </p>
                    <Link
                        href={teamSlug ? createBookingLink(teamSlug).url : '#'}
                        className="inline-flex items-center justify-center rounded-[8px] bg-bion-accent px-[14px] py-[9px] text-[13px] font-semibold text-bion-accent-text"
                    >
                        Create booking link
                    </Link>
                </section>
            ) : (
                <section className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="border-b border-bion-border px-[18px] py-[16px]">
                        <h2 className="text-[15px] font-semibold text-bion-text">Links</h2>
                    </div>
                    <div className="divide-y divide-bion-border">
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[18px] px-[18px] py-[16px] max-[900px]:grid-cols-1"
                            >
                                <div className="min-w-0">
                                    <div className="mb-[8px] flex flex-wrap items-center gap-[8px]">
                                        <h3 className="text-[14.5px] font-semibold text-bion-text">{item.name}</h3>
                                        <StatusPill label={item.isActive ? 'Active' : 'Paused'} active={item.isActive} />
                                        <span className="rounded-full bg-bion-bg px-[9px] py-[4px] font-mono text-[11px] text-bion-text-muted">
                                            {item.durationMinutes} min
                                        </span>
                                    </div>
                                    <p className="mb-[10px] max-w-[820px] text-[12.5px] leading-[1.55] text-bion-text-muted">
                                        {item.description || 'No description.'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-[8px] text-[12px] text-bion-text-muted">
                                        <span className="font-mono">{item.publicUrl}</span>
                                        <span>·</span>
                                        <span>{item.timezone}</span>
                                        <span>·</span>
                                        <span>{item.bookingsCount} bookings</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-[8px]">
                                    <button
                                        type="button"
                                        className="rounded-[8px] border border-bion-border px-[12px] py-[8px] text-[13px] font-semibold text-bion-text hover:border-bion-accent"
                                        onClick={() => copyPublicUrl(item)}
                                    >
                                        {copiedId === item.id ? 'Copied' : 'Copy link'}
                                    </button>
                                    <a
                                        href={item.publicUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-[8px] border border-bion-border px-[12px] py-[8px] text-[13px] font-semibold text-bion-text hover:border-bion-accent"
                                    >
                                        Open
                                    </a>
                                    <button
                                        type="button"
                                        disabled={busyId === item.id}
                                        className="rounded-[8px] border border-bion-border px-[12px] py-[8px] text-[13px] font-semibold text-bion-text hover:border-bion-accent disabled:opacity-60"
                                        onClick={() => toggle(item)}
                                    >
                                        {item.isActive ? 'Pause' : 'Enable'}
                                    </button>
                                    <Link
                                        href={
                                            teamSlug
                                                ? editBookingLink({
                                                      current_team: teamSlug,
                                                      bookingLink: item.id,
                                                  }).url
                                                : '#'
                                        }
                                        className="rounded-[8px] border border-bion-border px-[12px] py-[8px] text-[13px] font-semibold text-bion-text hover:border-bion-accent"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        disabled={busyId === item.id}
                                        className="rounded-[8px] border border-bion-danger px-[12px] py-[8px] text-[13px] font-semibold text-bion-danger disabled:opacity-60"
                                        onClick={() => remove(item)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

function MetricCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: string;
}) {
    return (
        <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[18px]">
            <div className="mb-[16px] flex items-center justify-between text-bion-text-muted">
                <span className="text-[12px] font-semibold uppercase [letter-spacing:0.04em]">{label}</span>
                <span className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-bion-border text-bion-accent">
                    <svg className={ICON_SM_CLS}>
                        <use href={`#${icon}`} />
                    </svg>
                </span>
            </div>
            <div className="font-mono text-[28px] font-semibold text-bion-text">{value}</div>
        </div>
    );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-[6px] rounded-full px-[9px] py-[4px] text-[11.5px] font-semibold',
                active ? 'bg-bion-success-soft text-bion-success' : 'bg-bion-bg text-bion-text-muted',
            )}
        >
            <span className="h-[6px] w-[6px] rounded-full bg-current" />
            {label}
        </span>
    );
}

BookingLinksIndexPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
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
