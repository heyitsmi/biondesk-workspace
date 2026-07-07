import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { dashboard } from '@/routes';
import type {
    DashboardInvitation,
    DashboardPageProps,
    DashboardPriorityAction,
} from '@/types';

type Props = DashboardPageProps & {
    pendingInvitations?: DashboardInvitation[];
};

const statIconMap = ['i-trend', 'i-wallet', 'i-briefcase', 'i-target'] as const;

export default function Dashboard({
    stats,
    priorityActions,
    recentOpportunities,
    activityFeed,
    pendingInvitations = [],
}: Props) {
    const { auth } = usePage().props;
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

    return (
        <>
            <Head title="Dashboard" />

            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <div className="page-header">
                <div>
                    <h1>Good morning, {greetingName}</h1>
                    <p>{dateLine}</p>
                </div>
                <button type="button" className="btn btn-primary">
                    <svg className="icon icon-sm">
                        <use href="#i-plus" />
                    </svg>
                    New Opportunity
                </button>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={stat.label} className="stat-card">
                        <div className="stat-head">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-icon">
                                <svg className="icon icon-sm">
                                    <use href={`#${statIconMap[index]}`} />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div
                            className={[
                                'stat-meta',
                                stat.tone === 'success'
                                    ? 'positive'
                                    : stat.tone === 'danger'
                                      ? 'warn'
                                      : '',
                            ].join(' ')}
                        >
                            {stat.tone === 'success' ? '↑ ' : null}
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="panel">
                <div className="panel-head">
                    <h2>Priority actions</h2>
                    <button type="button" className="panel-link">
                        View all
                        <svg className="icon icon-sm">
                            <use href="#i-arrow-up-right" />
                        </svg>
                    </button>
                </div>
                <div className="panel-body">
                    {priorityActions.map((action) => {
                        const done = completedActions.includes(action.id);

                        return (
                            <div key={action.id} className="action-row">
                                <div
                                    className={`action-icon ${action.tone === 'danger' ? 'warn' : 'wait'}`}
                                >
                                    <svg className="icon icon-sm">
                                        <use
                                            href={
                                                action.tone === 'danger'
                                                    ? '#i-alert'
                                                    : '#i-clock'
                                            }
                                        />
                                    </svg>
                                </div>
                                <div className="action-text">
                                    <div className="action-title">
                                        {action.title}
                                    </div>
                                    <div className="action-sub">
                                        {action.company} ·{' '}
                                        <span className="amount">
                                            {action.amount}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={`btn-action ${done ? 'done' : ''}`}
                                    onClick={() => markActionDone(action)}
                                >
                                    {done
                                        ? `${action.actionLabel} ✓`
                                        : action.actionLabel}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="split-grid">
                <div className="panel" style={{ marginBottom: 0 }}>
                    <div className="panel-head">
                        <h2>Recent opportunities</h2>
                        <button type="button" className="panel-link">
                            View all
                            <svg className="icon icon-sm">
                                <use href="#i-arrow-up-right" />
                            </svg>
                        </button>
                    </div>
                    <div className="panel-body">
                        {recentOpportunities.map((opportunity) => (
                            <div key={opportunity.id} className="opp-row">
                                <span
                                    className={`pill ${
                                        opportunity.tone === 'accent'
                                            ? 'pill-accent'
                                            : opportunity.tone === 'success'
                                              ? 'pill-success'
                                              : opportunity.tone === 'danger'
                                                ? 'pill-danger'
                                                : 'pill-muted'
                                    }`}
                                >
                                    <span className="dot" />
                                    {opportunity.stageLabel}
                                </span>
                                <div className="opp-info">
                                    <div className="opp-title">
                                        {opportunity.title}
                                    </div>
                                    <div className="opp-client">
                                        {opportunity.client}
                                    </div>
                                </div>
                                <span className="opp-value">
                                    {opportunity.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panel" style={{ marginBottom: 0 }}>
                    <div className="panel-head">
                        <h2>Recent activity</h2>
                    </div>
                    <div className="panel-body">
                        {activityFeed.map((item, index) => (
                            <div key={`${item.title}-${item.when}`} className="feed-item">
                                <div className="feed-dot-wrap">
                                    <div
                                        className={`feed-dot ${
                                            item.tone === 'accent'
                                                ? 'accent'
                                                : item.tone === 'success'
                                                  ? 'success'
                                                  : ''
                                        }`}
                                    />
                                    {index !== activityFeed.length - 1 ? (
                                        <div className="feed-line" />
                                    ) : null}
                                </div>
                                <div>
                                    <div className="feed-text">{item.title}</div>
                                    <div className="feed-time">{item.when}</div>
                                </div>
                            </div>
                        ))}
                    </div>
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
