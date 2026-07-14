import { Head } from '@inertiajs/react';
import Pagination from '@/components/biondesk/pagination';
import { dashboard as opsDashboard } from '@/routes/ops';
import { index as opsActivityLogs } from '@/routes/ops/activity-logs';
import type { OpsActivityLog, Paginated } from '@/types';

const TH_CLS =
    'border-b border-bion-border px-[16px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]';
const TD_CLS = 'border-b border-bion-border px-[16px] py-[14px] text-[13px]';

export default function OpsActivityLogsIndex({
    activities,
}: {
    activities: Paginated<OpsActivityLog>;
}) {
    return (
        <>
            <Head title="Ops — Activity Logs" />

            <p className="mb-[16px] text-[12.5px] text-bion-text-muted">
                Team isn't shown per row — resolving it would require
                cross-referencing 6 different subject types, not done for v1.
            </p>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-[5] bg-bion-surface">
                            <tr>
                                <th className={TH_CLS}>Subject</th>
                                <th className={TH_CLS}>Event</th>
                                <th className={TH_CLS}>Causer</th>
                                <th className={TH_CLS}>Description</th>
                                <th className={TH_CLS}>When</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child_td]:border-b-0">
                            {activities.data.map((activity) => (
                                <tr key={activity.id}>
                                    <td className={TD_CLS}>
                                        {activity.subjectType
                                            ? `${activity.subjectType} #${activity.subjectId}`
                                            : '—'}
                                    </td>
                                    <td className={TD_CLS}>
                                        {activity.event ?? '—'}
                                    </td>
                                    <td className={TD_CLS}>
                                        {activity.causerName ?? '—'}
                                    </td>
                                    <td className={TD_CLS}>
                                        {activity.description}
                                    </td>
                                    <td className={TD_CLS}>
                                        {activity.createdAt}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {activities.data.length === 0 ? (
                        <div className="flex min-h-[220px] items-center justify-center px-[20px] py-[40px] text-center text-[13px] text-bion-text-muted">
                            No activity recorded yet.
                        </div>
                    ) : null}
                </div>
            </div>

            <Pagination meta={activities} baseUrl={opsActivityLogs().url} />
        </>
    );
}

OpsActivityLogsIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Dashboard', href: opsDashboard() },
        { title: 'Activity Logs', href: opsActivityLogs() },
    ],
});
