import { Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { dashboard as opsDashboard } from '@/routes/ops';
import type { OpsDashboardPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const statIconMap = ['i-users', 'i-layers', 'i-sparkles'] as const;

export default function OpsDashboard({
    stats,
    recentSignups,
}: OpsDashboardPageProps) {
    return (
        <>
            <Head title="Ops — Dashboard" />

            <div className="mb-[28px] grid grid-cols-3 gap-[14px] max-[1024px]:grid-cols-2 max-[760px]:grid-cols-1">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="rounded-[12px] border border-bion-border bg-bion-surface p-[18px]"
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
                        {stat.change ? (
                            <div
                                className={cn(
                                    'text-[12px] text-bion-text-muted',
                                    stat.tone === 'success' &&
                                        'text-bion-success',
                                    stat.tone === 'danger' &&
                                        'text-bion-danger',
                                )}
                            >
                                {stat.change}
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>

            <div className="rounded-[12px] border border-bion-border bg-bion-surface">
                <div className="border-b border-bion-border px-[20px] py-[14px] text-[13.5px] font-semibold">
                    Recent signups
                </div>
                {recentSignups.length === 0 ? (
                    <div className="px-[20px] py-[32px] text-center text-[13px] text-bion-text-muted">
                        No users yet.
                    </div>
                ) : (
                    <div>
                        {recentSignups.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between border-b border-bion-border px-[20px] py-[12px] text-[13px] last:border-b-0"
                            >
                                <div>
                                    <div className="font-medium">
                                        {user.name}
                                    </div>
                                    <div className="text-bion-text-muted">
                                        {user.email}
                                    </div>
                                </div>
                                <span className="text-[12px] text-bion-text-muted">
                                    {user.joinedAt}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

OpsDashboard.layout = () => ({
    breadcrumbs: [{ title: 'Dashboard', href: opsDashboard() }],
});
