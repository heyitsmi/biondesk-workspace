import { Head } from '@inertiajs/react';
import Pagination from '@/components/biondesk/pagination';
import { dashboard as opsDashboard } from '@/routes/ops';
import { index as opsUsers } from '@/routes/ops/users';
import type { OpsUser, Paginated } from '@/types';

const TH_CLS =
    'border-b border-bion-border px-[20px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]';
const TD_CLS = 'border-b border-bion-border px-[20px] py-[14px] text-[13.5px]';

export default function OpsUsersIndex({
    users,
}: {
    users: Paginated<OpsUser>;
}) {
    return (
        <>
            <Head title="Ops — Users" />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-[5] bg-bion-surface">
                            <tr>
                                <th className={TH_CLS}>Name</th>
                                <th className={TH_CLS}>Email</th>
                                <th className={TH_CLS}>Teams</th>
                                <th className={TH_CLS}>Verified</th>
                                <th className={TH_CLS}>Admin</th>
                                <th className={TH_CLS}>Joined</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child_td]:border-b-0">
                            {users.data.map((user) => (
                                <tr key={user.id}>
                                    <td className={TD_CLS}>{user.name}</td>
                                    <td className={TD_CLS}>{user.email}</td>
                                    <td className={TD_CLS}>
                                        {user.teamsCount}
                                    </td>
                                    <td className={TD_CLS}>
                                        {user.emailVerified ? (
                                            <span className="inline-flex items-center gap-[6px] rounded-full bg-bion-success-soft px-[10px] py-[3px] text-[11.5px] font-medium text-bion-success">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-[6px] rounded-full border border-bion-border bg-bion-surface-raised px-[10px] py-[3px] text-[11.5px] font-medium text-bion-text-muted">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className={TD_CLS}>
                                        {user.isSuperAdmin ? (
                                            <span className="inline-flex items-center gap-[6px] rounded-full bg-bion-accent-soft px-[10px] py-[3px] text-[11.5px] font-medium text-bion-accent">
                                                Admin
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className={TD_CLS}>{user.joinedAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.data.length === 0 ? (
                        <div className="flex min-h-[220px] items-center justify-center px-[20px] py-[40px] text-center text-[13px] text-bion-text-muted">
                            No users yet.
                        </div>
                    ) : null}
                </div>
            </div>

            <Pagination meta={users} baseUrl={opsUsers().url} />
        </>
    );
}

OpsUsersIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Dashboard', href: opsDashboard() },
        { title: 'Users', href: opsUsers() },
    ],
});
