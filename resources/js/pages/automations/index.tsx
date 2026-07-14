import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as createAutomation,
    destroy as destroyAutomation,
    edit as editAutomation,
    index as automations,
    toggle as toggleAutomation,
} from '@/routes/automations';
import type {
    BiondeskTone,
    WorkflowAutomationItem,
    WorkflowAutomationRun,
    WorkflowAutomationsPageProps,
} from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.7] [stroke-linecap:round] [stroke-linejoin:round]';

export default function WorkflowAutomationsPage({
    automations: automationItems,
    templates,
    recentRuns,
}: WorkflowAutomationsPageProps) {
    const { currentTeam } = usePage().props;
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const summary = useMemo(
        () => ({
            total: automationItems.length,
            active: automationItems.filter((automation) => automation.isActive).length,
            runs: recentRuns.length,
        }),
        [automationItems, recentRuns],
    );

    const teamSlug = currentTeam?.slug ?? '';

    const onToggle = (automation: WorkflowAutomationItem): void => {
        if (!teamSlug) {
            return;
        }

        router.patch(toggleAutomation({ current_team: teamSlug, automation: automation.id }).url, {}, {
            preserveScroll: true,
        });
    };

    const onDelete = (automation: WorkflowAutomationItem): void => {
        if (!teamSlug || !window.confirm(`Delete automation "${automation.name}"?`)) {
            return;
        }

        setDeletingId(automation.id);
        router.delete(destroyAutomation({ current_team: teamSlug, automation: automation.id }).url, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <>
            <Head title="Automations" />

            <div className="mb-[24px] flex flex-wrap items-start justify-between gap-[16px]">
                <div>
                    <p className="text-[13px] text-bion-text-muted">
                        Template-based internal workflow rules for tasks, statuses, calendar follow-ups, and activity
                        notes.
                    </p>
                </div>
                <Link
                    href={teamSlug ? createAutomation(teamSlug).url : '#'}
                    className="inline-flex items-center gap-[8px] rounded-[8px] bg-bion-accent px-[14px] py-[9px] text-[13px] font-semibold text-bion-accent-text"
                >
                    <svg className={ICON_SM_CLS}>
                        <use href="#i-plus" />
                    </svg>
                    New automation
                </Link>
            </div>

            <div className="mb-[24px] grid grid-cols-3 gap-[16px] max-[760px]:grid-cols-1">
                <MetricCard label="Automations" value={summary.total} icon="i-sparkles" />
                <MetricCard label="Active" value={summary.active} icon="i-check" />
                <MetricCard label="Recent runs" value={summary.runs} icon="i-clock" />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-[24px] max-[1080px]:grid-cols-1">
                <div className="flex min-w-0 flex-col gap-[24px]">
                    <section className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                        <div className="border-b border-bion-border px-[18px] py-[16px]">
                            <h2 className="text-[15px] font-semibold text-bion-text">Active Rules</h2>
                        </div>

                        {automationItems.length === 0 ? (
                            <EmptyState message="No automations yet. Start from one of the templates below." />
                        ) : (
                            <div className="divide-y divide-bion-border">
                                {automationItems.map((automation) => (
                                    <div
                                        key={automation.id}
                                        className="flex flex-wrap items-center justify-between gap-[16px] px-[18px] py-[16px]"
                                    >
                                        <div className="min-w-[220px] flex-1">
                                            <div className="mb-[6px] flex flex-wrap items-center gap-[8px]">
                                                <h3 className="text-[14px] font-semibold text-bion-text">
                                                    {automation.name}
                                                </h3>
                                                <StatusPill
                                                    label={automation.isActive ? 'Active' : 'Paused'}
                                                    tone={automation.isActive ? 'success' : 'muted'}
                                                />
                                            </div>
                                            <p className="text-[12.5px] text-bion-text-muted">
                                                {automation.triggerLabel} · Last run {automation.lastRunAt}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-[8px]">
                                            <button
                                                type="button"
                                                className="rounded-[8px] border border-bion-border px-[12px] py-[8px] text-[13px] font-semibold text-bion-text hover:border-bion-accent"
                                                onClick={() => onToggle(automation)}
                                            >
                                                {automation.isActive ? 'Pause' : 'Enable'}
                                            </button>
                                            <Link
                                                href={
                                                    teamSlug
                                                        ? editAutomation({
                                                              current_team: teamSlug,
                                                              automation: automation.id,
                                                          }).url
                                                        : '#'
                                                }
                                                className="rounded-[8px] border border-bion-border px-[12px] py-[8px] text-[13px] font-semibold text-bion-text hover:border-bion-accent"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                disabled={deletingId === automation.id}
                                                className="rounded-[8px] border border-bion-danger px-[12px] py-[8px] text-[13px] font-semibold text-bion-danger disabled:opacity-60"
                                                onClick={() => onDelete(automation)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-[12px] border border-bion-border bg-bion-surface p-[18px]">
                        <div className="mb-[16px]">
                            <h2 className="text-[15px] font-semibold text-bion-text">Templates</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-[12px] max-[900px]:grid-cols-1">
                            {templates.map((template) => (
                                <Link
                                    key={template.key}
                                    href={
                                        teamSlug
                                            ? createAutomation(teamSlug, { query: { template: template.key } }).url
                                            : '#'
                                    }
                                    className="rounded-[10px] border border-bion-border bg-bion-bg p-[14px] [transition:border-color_0.12s_ease,background_0.12s_ease] hover:border-bion-accent hover:bg-bion-surface-raised"
                                >
                                    <div className="mb-[8px] text-[13.5px] font-semibold text-bion-text">
                                        {template.name}
                                    </div>
                                    <p className="mb-[10px] text-[12.5px] leading-[1.55] text-bion-text-muted">
                                        {template.description}
                                    </p>
                                    <div className="text-[12px] font-medium text-bion-accent">{template.summary}</div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <section className="h-fit rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="border-b border-bion-border px-[18px] py-[16px]">
                        <h2 className="text-[15px] font-semibold text-bion-text">Recent Runs</h2>
                    </div>
                    {recentRuns.length === 0 ? (
                        <EmptyState message="No automation runs yet." />
                    ) : (
                        <div className="divide-y divide-bion-border">
                            {recentRuns.map((run) => (
                                <RunRow key={run.id} run={run} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: string }) {
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

function RunRow({ run }: { run: WorkflowAutomationRun }) {
    return (
        <div className="px-[18px] py-[14px]">
            <div className="mb-[6px] flex items-center justify-between gap-[12px]">
                <div className="min-w-0 truncate text-[13px] font-semibold text-bion-text">{run.automationName}</div>
                <StatusPill label={run.statusLabel} tone={run.statusTone} />
            </div>
            <p className="mb-[6px] text-[12.5px] leading-[1.5] text-bion-text-muted">{run.message}</p>
            <div className="font-mono text-[11.5px] text-bion-text-muted">{run.ranAt}</div>
        </div>
    );
}

function StatusPill({ label, tone }: { label: string; tone: BiondeskTone }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-[6px] rounded-full px-[9px] py-[3px] text-[12px] font-semibold',
                tone === 'success' && 'bg-bion-success-soft text-bion-success',
                tone === 'danger' && 'bg-bion-danger-soft text-bion-danger',
                tone === 'accent' && 'bg-bion-accent-soft text-bion-accent',
                tone === 'muted' && 'bg-bion-surface-raised text-bion-text-muted',
            )}
        >
            <span className="h-[6px] w-[6px] rounded-full bg-current" />
            {label}
        </span>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="px-[18px] py-[32px] text-center text-[13px] text-bion-text-muted">
            {message}
        </div>
    );
}

WorkflowAutomationsPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Automations',
            href: props.currentTeam ? automations(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName: 'flex-1 overflow-y-auto px-[32px] py-[28px] max-[760px]:px-[16px]',
});
