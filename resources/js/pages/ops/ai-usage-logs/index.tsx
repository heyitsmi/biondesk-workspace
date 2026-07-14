import { Head } from '@inertiajs/react';
import Pagination from '@/components/biondesk/pagination';
import { dashboard as opsDashboard } from '@/routes/ops';
import { index as opsAiUsageLogs } from '@/routes/ops/ai-usage-logs';
import type { OpsAiUsageLog, Paginated } from '@/types';

const TH_CLS =
    'border-b border-bion-border px-[16px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]';
const TD_CLS = 'border-b border-bion-border px-[16px] py-[14px] text-[13px]';

export default function OpsAiUsageLogsIndex({
    logs,
    summary,
}: {
    logs: Paginated<OpsAiUsageLog>;
    summary: { totalCostFormatted: string; totalTokens: number };
}) {
    return (
        <>
            <Head title="Ops — AI Usage Logs" />

            <div className="mb-[16px] grid grid-cols-2 gap-[14px] max-[640px]:grid-cols-1">
                <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[18px]">
                    <div className="mb-[6px] text-[12px] font-medium [letter-spacing:0.03em] text-bion-text-muted uppercase">
                        Total Cost
                    </div>
                    <div className="font-mono text-[22px] font-semibold">
                        {summary.totalCostFormatted}
                    </div>
                </div>
                <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[18px]">
                    <div className="mb-[6px] text-[12px] font-medium [letter-spacing:0.03em] text-bion-text-muted uppercase">
                        Total Tokens
                    </div>
                    <div className="font-mono text-[22px] font-semibold">
                        {summary.totalTokens.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-[5] bg-bion-surface">
                            <tr>
                                <th className={TH_CLS}>Team</th>
                                <th className={TH_CLS}>User</th>
                                <th className={TH_CLS}>Provider</th>
                                <th className={TH_CLS}>Model</th>
                                <th className={TH_CLS}>Input</th>
                                <th className={TH_CLS}>Output</th>
                                <th className={TH_CLS}>Cost</th>
                                <th className={TH_CLS}>When</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child_td]:border-b-0">
                            {logs.data.map((log) => (
                                <tr key={log.id}>
                                    <td className={TD_CLS}>
                                        {log.teamName ?? '—'}
                                    </td>
                                    <td className={TD_CLS}>
                                        {log.userName ?? '—'}
                                    </td>
                                    <td className={TD_CLS}>{log.provider}</td>
                                    <td className={TD_CLS}>{log.model}</td>
                                    <td className={TD_CLS}>
                                        {log.inputTokens.toLocaleString()}
                                    </td>
                                    <td className={TD_CLS}>
                                        {log.outputTokens.toLocaleString()}
                                    </td>
                                    <td className={TD_CLS}>
                                        {log.costFormatted}
                                    </td>
                                    <td className={TD_CLS}>{log.createdAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {logs.data.length === 0 ? (
                        <div className="flex min-h-[220px] items-center justify-center px-[20px] py-[40px] text-center text-[13px] text-bion-text-muted">
                            No AI usage recorded yet.
                        </div>
                    ) : null}
                </div>
            </div>

            <Pagination meta={logs} baseUrl={opsAiUsageLogs().url} />
        </>
    );
}

OpsAiUsageLogsIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Dashboard', href: opsDashboard() },
        { title: 'AI Usage Logs', href: opsAiUsageLogs() },
    ],
});
