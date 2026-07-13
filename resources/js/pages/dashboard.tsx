import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as calendarIndex } from '@/routes/calendar';
import { show as invoiceShow } from '@/routes/invoices';
import { index as opportunitiesIndex } from '@/routes/opportunities';
import { show as projectShow } from '@/routes/projects';
import { show as quotationShow } from '@/routes/quotations';
import type {
    DashboardInvitation,
    DashboardPageProps,
    DashboardPriorityAction,
    DashboardUpcomingEvent,
} from '@/types';

type Props = DashboardPageProps & {
    pendingInvitations?: DashboardInvitation[];
};

const statIconMap = ['i-trend', 'i-wallet', 'i-briefcase', 'i-target'] as const;

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const PILL_BASE =
    'inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-medium whitespace-nowrap';

const pillClasses: Record<string, string> = {
    accent: 'bg-bion-accent-soft text-bion-accent',
    success: 'bg-bion-success-soft text-bion-success',
    danger: 'bg-bion-danger-soft text-bion-danger',
    muted: 'border border-bion-border bg-bion-surface-raised text-bion-text-muted',
};

const dotClasses: Record<string, string> = {
    accent: 'bg-bion-accent',
    success: 'bg-bion-success',
    danger: 'bg-bion-danger',
    muted: 'bg-bion-text-muted',
};

export default function Dashboard({
    stats,
    priorityActions,
    recentOpportunities,
    activityFeed,
    upcomingEvents,
    pendingInvitations = [],
}: Props) {
    const { auth, currentTeam } = usePage().props;
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const [completedActions, setCompletedActions] = useState<number[]>([]);

    const greetingName = auth.user.name.split(' ')[0];
    const dateLine = useMemo(() => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });

        return `${formatter.format(new Date())} · Here's what needs your attention today.`;
    }, []);

    const markActionDone = (action: DashboardPriorityAction): void => {
        setCompletedActions((current) => {
            if (current.includes(action.id)) {
                return current;
            }

            return [...current, action.id];
        });
    };

    const visitUpcomingEvent = (item: DashboardUpcomingEvent): void => {
        if (!currentTeam) {
            return;
        }

        switch (item.kind) {
            case 'invoice':
                router.visit(
                    invoiceShow({
                        current_team: currentTeam.slug,
                        invoice: item.recordId,
                    }),
                );
                break;
            case 'quote':
                router.visit(
                    quotationShow({
                        current_team: currentTeam.slug,
                        quotation: item.recordId,
                    }),
                );
                break;
            case 'project':
                router.visit(
                    projectShow({
                        current_team: currentTeam.slug,
                        project: item.recordId,
                    }),
                );
                break;
            case 'opportunity':
                router.visit(opportunitiesIndex(currentTeam.slug));
                break;
            default:
                router.visit(calendarIndex(currentTeam.slug));
        }
    };

    return (
        <>
            <Head title="Dashboard" />

            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px] max-[760px]:flex-col max-[760px]:items-start">
                <div>
                    <h1 className="mb-[4px] font-display text-[24px] font-bold">
                        Good morning, {greetingName}
                    </h1>
                    <p className="text-[13.5px] text-bion-text-muted">
                        {dateLine}
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-[7px] rounded-[8px] bg-bion-accent px-[16px] py-[9px] text-[13.5px] font-semibold text-bion-accent-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:opacity-[0.88] active:scale-[0.97]"
                >
                    <svg className={ICON_SM_CLS}>
                        <use href="#i-plus" />
                    </svg>
                    New Opportunity
                </button>
            </div>

            <div className="mb-[28px] grid grid-cols-4 gap-[14px] max-[1024px]:grid-cols-2 max-[760px]:grid-cols-1">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="rounded-[12px] border border-bion-border bg-bion-surface p-[18px] [transition:border-color_0.15s_ease,transform_0.15s_ease] hover:-translate-y-[2px] hover:border-bion-accent"
                    >
                        <div className="mb-[14px] flex items-center justify-between">
                            <span className="text-[12px] font-medium [letter-spacing:0.03em] text-bion-text-muted uppercase">
                                {stat.label}
                            </span>
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-bion-border bg-bion-surface-raised text-bion-accent">
                                <svg className={ICON_SM_CLS}>
                                    <use href={`#${statIconMap[index]}`} />
                                </svg>
                            </div>
                        </div>
                        <div className="mb-[6px] font-mono text-[26px] font-semibold">
                            {stat.value}
                        </div>
                        <div
                            className={cn(
                                'flex items-center gap-[6px] text-[12px] text-bion-text-muted',
                                stat.tone === 'success' && 'text-bion-success',
                                stat.tone === 'danger' && 'text-bion-danger',
                            )}
                        >
                            {stat.tone === 'success' ? '↑ ' : null}
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-[20px] rounded-[12px] border border-bion-border bg-bion-surface">
                <div className="flex items-center justify-between border-b border-bion-border px-[18px] py-[16px]">
                    <h2 className="text-[14.5px] font-semibold">
                        Priority actions
                    </h2>
                    <button
                        type="button"
                        className="flex items-center gap-[4px] text-[12.5px] text-bion-text-muted hover:text-bion-accent"
                    >
                        View all
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-arrow-up-right" />
                        </svg>
                    </button>
                </div>
                <div className="p-[6px]">
                    {priorityActions.length === 0 ? (
                        <div className="py-[32px] text-center">
                            <div className="mx-auto mb-[12px] flex h-[40px] w-[40px] items-center justify-center rounded-[12px] border border-bion-border bg-bion-bg text-bion-text-muted">
                                <svg className="h-[18px] w-[18px] fill-none stroke-current [stroke-width:1.8] [stroke-linecap:round] [stroke-linejoin:round]">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="mb-[2px] text-[13.5px] font-medium">
                                You're all caught up!
                            </h3>
                            <p className="text-[12.5px] text-bion-text-muted">
                                No pending actions need your attention right
                                now.
                            </p>
                        </div>
                    ) : (
                        priorityActions.map((action, index) => {
                            const done = completedActions.includes(action.id);

                            return (
                                <div
                                    key={action.id}
                                    className={cn(
                                        'flex items-center gap-[14px] rounded-[9px] p-[12px] hover:bg-bion-bg',
                                        index > 0 && 'mt-[2px]',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]',
                                            action.tone === 'danger'
                                                ? 'bg-bion-danger-soft text-bion-danger'
                                                : 'bg-bion-accent-soft text-bion-accent',
                                        )}
                                    >
                                        <svg className={ICON_SM_CLS}>
                                            <use
                                                href={
                                                    action.tone === 'danger'
                                                        ? '#i-alert'
                                                        : '#i-clock'
                                                }
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-[2px] text-[13.5px] font-medium">
                                            {action.title}
                                        </div>
                                        <div className="text-[12px] text-bion-text-muted">
                                            {action.company} ·{' '}
                                            <span className="font-mono font-medium text-bion-text">
                                                {action.amount}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={cn(
                                            'shrink-0 rounded-[7px] border border-bion-border bg-bion-surface-raised px-[13px] py-[6px] text-[12px] font-semibold text-bion-text [transition:background_0.12s_ease] hover:border-bion-accent hover:bg-bion-accent hover:text-bion-accent-text',
                                            done &&
                                                'pointer-events-none border-transparent bg-bion-success-soft text-bion-success hover:border-transparent hover:bg-bion-success-soft hover:text-bion-success',
                                        )}
                                        onClick={() => markActionDone(action)}
                                    >
                                        {done
                                            ? `${action.actionLabel} ✓`
                                            : action.actionLabel}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="grid grid-cols-[1.1fr_0.9fr] gap-[20px] max-[1024px]:grid-cols-1">
                <div className="rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="flex items-center justify-between border-b border-bion-border px-[18px] py-[16px]">
                        <h2 className="text-[14.5px] font-semibold">
                            Recent opportunities
                        </h2>
                        <button
                            type="button"
                            className="flex items-center gap-[4px] text-[12.5px] text-bion-text-muted hover:text-bion-accent"
                        >
                            View all
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-arrow-up-right" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-[6px]">
                        {recentOpportunities.map((opportunity) => (
                            <div
                                key={opportunity.id}
                                className="flex items-center gap-[12px] rounded-[9px] p-[11px_12px] hover:bg-bion-bg"
                            >
                                <span
                                    className={cn(
                                        PILL_BASE,
                                        pillClasses[opportunity.tone] ??
                                            pillClasses.muted,
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-[6px] w-[6px] rounded-full',
                                            dotClasses[opportunity.tone] ??
                                                dotClasses.muted,
                                        )}
                                    />
                                    {opportunity.stageLabel}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-[3px] overflow-hidden text-[13.5px] font-medium text-ellipsis whitespace-nowrap">
                                        {opportunity.title}
                                    </div>
                                    <div className="text-[12px] text-bion-text-muted">
                                        {opportunity.client}
                                    </div>
                                </div>
                                <span className="font-mono text-[13px] font-medium">
                                    {opportunity.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="flex items-center justify-between border-b border-bion-border px-[18px] py-[16px]">
                        <h2 className="text-[14.5px] font-semibold">
                            Recent activity
                        </h2>
                    </div>
                    <div className="p-[6px]">
                        {activityFeed.map((item, index) => (
                            <div
                                key={`${item.title}-${item.when}`}
                                className="flex gap-[12px] p-[11px_12px]"
                            >
                                <div className="flex shrink-0 flex-col items-center pt-[3px]">
                                    <div
                                        className={cn(
                                            'h-[7px] w-[7px] rounded-full bg-bion-border',
                                            item.tone === 'accent' &&
                                                'bg-bion-accent',
                                            item.tone === 'success' &&
                                                'bg-bion-success',
                                        )}
                                    />
                                    {index !== activityFeed.length - 1 ? (
                                        <div className="mt-[4px] w-px flex-1 bg-bion-border" />
                                    ) : null}
                                </div>
                                <div>
                                    <div className="mb-[2px] text-[13px]">
                                        {item.title}
                                    </div>
                                    <div className="text-[11.5px] text-bion-text-muted">
                                        {item.when}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-[20px] rounded-[12px] border border-bion-border bg-bion-surface">
                <div className="flex items-center justify-between border-b border-bion-border px-[18px] py-[16px]">
                    <h2 className="text-[14.5px] font-semibold">
                        Upcoming events
                    </h2>
                    <button
                        type="button"
                        className="flex items-center gap-[4px] text-[12.5px] text-bion-text-muted hover:text-bion-accent"
                        onClick={() =>
                            currentTeam &&
                            router.visit(calendarIndex(currentTeam.slug))
                        }
                    >
                        View calendar
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-arrow-up-right" />
                        </svg>
                    </button>
                </div>
                <div className="p-[6px]">
                    {upcomingEvents.length === 0 ? (
                        <div className="py-[32px] text-center">
                            <div className="mx-auto mb-[12px] flex h-[40px] w-[40px] items-center justify-center rounded-[12px] border border-bion-border bg-bion-bg text-bion-text-muted">
                                <svg className="h-[18px] w-[18px] fill-none stroke-current [stroke-width:1.8] [stroke-linecap:round] [stroke-linejoin:round]">
                                    <use href="#i-calendar" />
                                </svg>
                            </div>
                            <h3 className="mb-[2px] text-[13.5px] font-medium">
                                Nothing on the calendar
                            </h3>
                            <p className="text-[12.5px] text-bion-text-muted">
                                No events or deadlines in the next 14 days.
                            </p>
                        </div>
                    ) : (
                        upcomingEvents.map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    'flex cursor-pointer items-center gap-[12px] rounded-[9px] p-[11px_12px] hover:bg-bion-bg',
                                    index > 0 && 'mt-[2px]',
                                )}
                                onClick={() => visitUpcomingEvent(item)}
                            >
                                <span
                                    className={cn(
                                        PILL_BASE,
                                        pillClasses[item.tone] ??
                                            pillClasses.muted,
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-[6px] w-[6px] rounded-full',
                                            dotClasses[item.tone] ??
                                                dotClasses.muted,
                                        )}
                                    />
                                    {item.dateLabel}
                                </span>
                                <div className="min-w-0 flex-1 overflow-hidden text-[13.5px] font-medium text-ellipsis whitespace-nowrap">
                                    {item.title}
                                    {item.recurring ? (
                                        <span className="ml-[6px] text-[11px] font-normal text-bion-text-muted">
                                            (recurring)
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
