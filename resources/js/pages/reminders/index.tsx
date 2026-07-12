import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { show as invoiceShow } from '@/routes/invoices';
import { show as quotationShow } from '@/routes/quotations';
import { dismiss as dismissReminder, index as reminders } from '@/routes/reminders';
import type { ReminderBucket, ReminderItem, ReminderLink, RemindersPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const FILTER_ITEM_BASE =
    'flex cursor-pointer items-center justify-between rounded-[8px] px-[12px] py-[8px] font-medium [transition:background_0.12s_ease] hover:bg-bion-surface-raised hover:text-bion-text';
const FILTER_BADGE_BASE =
    'rounded-[4px] border border-bion-border bg-bion-surface-raised px-[6px] py-[2px] font-mono text-[12px]';

const LINK_ICON_MAP: Record<ReminderLink['kind'], string> = {
    invoice: 'i-receipt',
    quotation: 'i-file',
};

const BUCKET_LABEL: Record<ReminderBucket, string> = {
    overdue: 'Overdue',
    today: 'Today',
    upcoming: 'Upcoming',
};

const BUCKET_ORDER: ReminderBucket[] = ['overdue', 'today', 'upcoming'];

type FilterKey = 'all' | ReminderBucket | 'completed';

export default function RemindersPage({ reminders: initialReminders }: RemindersPageProps) {
    const { currentTeam } = usePage().props;
    const [items, setItems] = useState<ReminderItem[]>(initialReminders);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

    const counts = useMemo(
        () => ({
            all: items.length,
            today: items.filter((item) => item.bucket === 'today').length,
            upcoming: items.filter((item) => item.bucket === 'upcoming').length,
            overdue: items.filter((item) => item.bucket === 'overdue').length,
        }),
        [items],
    );

    const visibleItems = useMemo(() => {
        const sorted = [...items].sort((left, right) => left.dueSort - right.dueSort);

        if (activeFilter === 'all') {
            return sorted;
        }

        if (activeFilter === 'completed') {
            return sorted.filter((item) => item.completed);
        }

        return sorted.filter((item) => item.bucket === activeFilter);
    }, [items, activeFilter]);

    const groupedItems = useMemo(() => {
        if (activeFilter !== 'all') {
            return [{ bucket: null as ReminderBucket | null, items: visibleItems }];
        }

        return BUCKET_ORDER.map((bucket) => ({
            bucket,
            items: visibleItems.filter((item) => item.bucket === bucket),
        })).filter((group) => group.items.length > 0);
    }, [visibleItems, activeFilter]);

    const resolveHref = (link: ReminderLink): string | null => {
        if (!currentTeam) {
            return null;
        }

        switch (link.kind) {
            case 'invoice':
                return invoiceShow({ current_team: currentTeam.slug, invoice: link.id }).url;
            case 'quotation':
                return quotationShow({ current_team: currentTeam.slug, quotation: link.id }).url;
            default:
                return null;
        }
    };

    const toggleCompleted = (id: number): void => {
        if (!currentTeam) {
            return;
        }

        setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
        );

        router.patch(
            dismissReminder({ current_team: currentTeam.slug, reminder: id }).url,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const filters: Array<{ key: FilterKey; label: string; count?: number }> = [
        { key: 'all', label: 'All Reminders', count: counts.all },
        { key: 'today', label: 'Today', count: counts.today },
        { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
        { key: 'overdue', label: 'Overdue', count: counts.overdue },
        { key: 'completed', label: 'Completed' },
    ];

    return (
        <>
            <Head title="Reminders" />

            <p className="mb-[24px] shrink-0 text-[13px] text-bion-text-muted">
                Automatic follow-ups for invoices approaching or past their due date, and quotes awaiting a response.
            </p>

            <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr] gap-[24px] max-[1024px]:grid-cols-[240px_1fr] max-[760px]:flex max-[760px]:flex-col">
                <div className="flex flex-col gap-[16px] max-[760px]:order-[-1]">
                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="flex flex-col gap-[4px] max-[760px]:flex-row max-[760px]:overflow-x-auto max-[760px]:pb-[8px]">
                            {filters.map((filter) => (
                                <div
                                    key={filter.key}
                                    role="button"
                                    tabIndex={0}
                                    className={cn(
                                        FILTER_ITEM_BASE,
                                        'max-[760px]:flex-none',
                                        filter.key === 'overdue' ? 'text-bion-danger' : 'text-bion-text-muted',
                                        activeFilter === filter.key && 'bg-bion-accent-soft! text-bion-accent!',
                                    )}
                                    onClick={() => setActiveFilter(filter.key)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            setActiveFilter(filter.key);
                                        }
                                    }}
                                >
                                    <span>{filter.label}</span>
                                    {filter.count !== undefined ? (
                                        <span
                                            className={cn(
                                                FILTER_BADGE_BASE,
                                                filter.key === 'overdue' && 'text-bion-danger',
                                            )}
                                        >
                                            {filter.count}
                                        </span>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                        {groupedItems.length === 0 ? (
                            <div className="px-[20px] py-[40px] text-center text-[13px] text-bion-text-muted">
                                No reminders here.
                            </div>
                        ) : null}

                        {groupedItems.map((group) => (
                            <div key={group.bucket ?? 'flat'}>
                                {group.bucket ? (
                                    <div className="sticky top-0 z-10 border-b border-bion-border bg-bion-bg px-[20px] pt-[20px] pb-[10px] text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                        {BUCKET_LABEL[group.bucket]}
                                    </div>
                                ) : null}

                                {group.items.map((item) => {
                                    const href = resolveHref(item.link);

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-[16px] border-b border-bion-border px-[20px] py-[16px] [transition:background_0.12s_ease] last:border-b-0 hover:bg-bion-surface-raised"
                                        >
                                            <div className="pt-[2px]">
                                                <button
                                                    type="button"
                                                    title={item.completed ? 'Mark as active' : 'Mark as handled'}
                                                    className={cn(
                                                        'flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-[4px] border-2 [transition:all_0.15s_ease]',
                                                        item.completed
                                                            ? 'border-bion-success bg-bion-success'
                                                            : 'border-bion-text-muted hover:border-bion-accent',
                                                    )}
                                                    onClick={() => toggleCompleted(item.id)}
                                                >
                                                    {item.completed ? (
                                                        <svg
                                                            className="h-[12px] w-[12px] text-bion-surface"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <use href="#i-check" />
                                                        </svg>
                                                    ) : null}
                                                </button>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div
                                                    className={cn(
                                                        'mb-[4px] text-[14.5px] leading-[1.4] font-medium break-words text-bion-text [transition:color_0.15s_ease]',
                                                        item.completed && 'text-bion-text-muted line-through',
                                                    )}
                                                >
                                                    {item.title}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-[12px] text-[12.5px] text-bion-text-muted">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-[4px] font-mono font-medium',
                                                            item.bucket === 'overdue' && 'text-bion-danger',
                                                        )}
                                                    >
                                                        <svg className={ICON_SM_CLS}>
                                                            <use href="#i-calendar" />
                                                        </svg>
                                                        {item.dueLabel}
                                                    </span>
                                                    {href ? (
                                                        <Link
                                                            href={href}
                                                            className="inline-flex items-center gap-[4px] font-medium text-bion-info hover:underline"
                                                        >
                                                            <svg className={ICON_SM_CLS}>
                                                                <use href={`#${LINK_ICON_MAP[item.link.kind]}`} />
                                                            </svg>
                                                            {item.link.label}
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

RemindersPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Reminders',
            href: props.currentTeam ? reminders(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-y-auto px-[32px] py-[24px] max-[760px]:px-[16px]',
});
