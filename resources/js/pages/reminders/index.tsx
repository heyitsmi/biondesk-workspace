import { Head, Link, usePage } from '@inertiajs/react';
import {  useMemo, useState } from 'react';
import type {KeyboardEvent} from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { show as contactShow } from '@/routes/contacts';
import { show as invoiceShow } from '@/routes/invoices';
import { show as projectShow } from '@/routes/projects';
import { index as proposalsIndex } from '@/routes/proposals';
import { index as reminders } from '@/routes/reminders';
import type { ReminderBucket, ReminderItem, ReminderLink, RemindersPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');

const FILTER_ITEM_BASE =
    'flex cursor-pointer items-center justify-between rounded-[8px] px-[12px] py-[8px] font-medium [transition:background_0.12s_ease] hover:bg-bion-surface-raised hover:text-bion-text';
const FILTER_BADGE_BASE =
    'rounded-[4px] border border-bion-border bg-bion-surface-raised px-[6px] py-[2px] font-mono text-[12px]';

const LINK_ICON_MAP: Record<ReminderLink['kind'], string> = {
    proposal: 'i-file',
    project: 'i-briefcase',
    contact: 'i-users',
    invoice: 'i-receipt',
};

const BUCKET_LABEL: Record<ReminderBucket, string> = {
    overdue: 'Overdue',
    today: 'Today',
    upcoming: 'Upcoming',
};

const BUCKET_ORDER: ReminderBucket[] = ['overdue', 'today', 'upcoming'];

type FilterKey = 'all' | ReminderBucket | 'completed';

let nextClientId = -1;

export default function RemindersPage({ reminders: initialReminders }: RemindersPageProps) {
    const { currentTeam } = usePage().props;
    const [items, setItems] = useState<ReminderItem[]>(initialReminders);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
    const [newTitle, setNewTitle] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

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
            case 'proposal':
                return proposalsIndex(currentTeam.slug).url;
            case 'project':
                return link.id !== null
                    ? projectShow({ current_team: currentTeam.slug, project: link.id }).url
                    : null;
            case 'contact':
                return link.id !== null
                    ? contactShow({ current_team: currentTeam.slug, contact: link.id }).url
                    : null;
            case 'invoice':
                return link.id !== null
                    ? invoiceShow({ current_team: currentTeam.slug, invoice: link.id }).url
                    : null;
            default:
                return null;
        }
    };

    const toggleCompleted = (id: number): void => {
        setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
        );
    };

    const deleteReminder = (id: number): void => {
        setItems((current) => current.filter((item) => item.id !== id));
    };

    const startEditing = (item: ReminderItem): void => {
        setEditingId(item.id);
        setEditingTitle(item.title);
    };

    const saveEditing = (): void => {
        const trimmed = editingTitle.trim();

        if (editingId === null || trimmed === '') {
            setEditingId(null);

            return;
        }

        setItems((current) =>
            current.map((item) => (item.id === editingId ? { ...item, title: trimmed } : item)),
        );
        setEditingId(null);
    };

    const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') {
            saveEditing();
        }

        if (event.key === 'Escape') {
            setEditingId(null);
        }
    };

    const addReminder = (): void => {
        const trimmed = newTitle.trim();

        if (trimmed === '') {
            return;
        }

        setItems((current) => [
            ...current,
            {
                id: nextClientId--,
                title: trimmed,
                bucket: 'upcoming',
                dueLabel: 'No date set',
                dueSort: Number.MAX_SAFE_INTEGER,
                completed: false,
                link: null,
            },
        ]);
        setNewTitle('');
    };

    const handleNewKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') {
            addReminder();
        }
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
                Keep track of follow-ups, invoice due dates, and important tasks.
            </p>

            <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr] gap-[24px] max-[1024px]:grid-cols-[240px_1fr] max-[760px]:flex max-[760px]:flex-col">
                <div className="flex flex-col gap-[16px] max-[760px]:order-[-1]">
                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="flex flex-col gap-[4px] max-[760px]:flex-row max-[760px]:overflow-x-auto max-[760px]:pb-[8px]">
                            {filters.map((filter, index) => (
                                <div
                                    key={filter.key}
                                    role="button"
                                    tabIndex={0}
                                    className={cn(
                                        FILTER_ITEM_BASE,
                                        'max-[760px]:flex-none',
                                        filter.key === 'overdue' ? 'text-bion-danger' : 'text-bion-text-muted',
                                        activeFilter === filter.key && 'bg-bion-accent-soft! text-bion-accent!',
                                        index === filters.length - 1 &&
                                            'mt-[12px] rounded-none! border-t border-bion-border pt-[16px]',
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
                    <div className="flex items-center gap-[12px] border-b border-bion-border bg-bion-surface-raised px-[20px] py-[16px]">
                        <input
                            type="text"
                            className="flex-1 rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] placeholder:text-bion-text-muted focus:border-bion-accent"
                            placeholder="I need to remember to..."
                            value={newTitle}
                            onChange={(event) => setNewTitle(event.target.value)}
                            onKeyDown={handleNewKeyDown}
                        />
                        <button
                            type="button"
                            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[8px] border border-bion-border bg-bion-surface text-bion-text-muted [transition:border-color_0.15s_ease] hover:border-bion-text-muted hover:text-bion-text"
                            title="Set Date & Time"
                        >
                            <svg className="h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                <use href="#i-calendar" />
                            </svg>
                        </button>
                        <button type="button" className={BTN_PRIMARY} onClick={addReminder}>
                            Add
                        </button>
                    </div>

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
                                    const href = item.link ? resolveHref(item.link) : null;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-[16px] border-b border-bion-border px-[20px] py-[16px] [transition:background_0.12s_ease] last:border-b-0 hover:bg-bion-surface-raised"
                                        >
                                            <div className="pt-[2px]">
                                                <button
                                                    type="button"
                                                    title={item.completed ? 'Mark incomplete' : 'Mark complete'}
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
                                                <div className="mb-[4px] flex items-start justify-between gap-[12px]">
                                                    {editingId === item.id ? (
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            className="flex-1 rounded-[6px] border border-bion-accent bg-bion-bg px-[8px] py-[4px] text-[14.5px] text-bion-text outline-none"
                                                            value={editingTitle}
                                                            onChange={(event) => setEditingTitle(event.target.value)}
                                                            onKeyDown={handleEditKeyDown}
                                                            onBlur={saveEditing}
                                                        />
                                                    ) : (
                                                        <div
                                                            className={cn(
                                                                'text-[14.5px] leading-[1.4] font-medium break-words text-bion-text [transition:color_0.15s_ease]',
                                                                item.completed && 'text-bion-text-muted line-through',
                                                            )}
                                                        >
                                                            {item.title}
                                                        </div>
                                                    )}
                                                    <div className="flex shrink-0 gap-[4px]">
                                                        {!item.completed ? (
                                                            <button
                                                                type="button"
                                                                title="Edit"
                                                                className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-surface hover:text-bion-text"
                                                                onClick={() => startEditing(item)}
                                                            >
                                                                <svg className={ICON_SM_CLS}>
                                                                    <use href="#i-edit" />
                                                                </svg>
                                                            </button>
                                                        ) : null}
                                                        <button
                                                            type="button"
                                                            title="Delete"
                                                            className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-surface hover:text-bion-danger"
                                                            onClick={() => deleteReminder(item.id)}
                                                        >
                                                            <svg className={ICON_SM_CLS}>
                                                                <use href="#i-trash" />
                                                            </svg>
                                                        </button>
                                                    </div>
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
                                                    {item.link && href ? (
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
