import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { IconSprite, IconUse } from '@/components/biondesk/icon-sprite';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import { dashboard as opsDashboard } from '@/routes/ops';
import { index as opsActivityLogs } from '@/routes/ops/activity-logs';
import { index as opsAiUsageLogs } from '@/routes/ops/ai-usage-logs';
import { index as opsUsers } from '@/routes/ops/users';
import type { BreadcrumbItem } from '@/types';

type Props = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

const NAV_ITEMS = [
    { title: 'Dashboard', icon: 'i-grid', href: opsDashboard().url },
    { title: 'Users', icon: 'i-users', href: opsUsers().url },
    { title: 'AI Usage Logs', icon: 'i-sparkles', href: opsAiUsageLogs().url },
    { title: 'Activity Logs', icon: 'i-clock', href: opsActivityLogs().url },
] as const;

const NAV_ITEM_CLS =
    'flex items-center gap-[10px] rounded-[8px] px-[12px] py-[9px] text-[13.5px] font-medium text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text [&.active]:bg-bion-accent-soft! [&.active]:text-bion-accent!';

export default function OpsShell({ children, breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth, currentTeam } = page.props;
    const { appearance, updateAppearance } = useAppearance();
    const { isCurrentUrl } = useCurrentUrl();
    const initials = useInitials();

    const currentPageTitle =
        breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Ops';

    return (
        <div className="flex h-screen overflow-hidden bg-bion-bg font-display text-[14px] text-bion-text antialiased">
            <IconSprite />

            <aside className="flex w-[240px] shrink-0 flex-col border-r border-bion-border bg-bion-surface">
                <div className="flex items-center gap-[10px] border-b border-bion-border px-[18px] py-[18px]">
                    <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[7px] bg-bion-accent text-bion-accent-text">
                        <IconUse icon="i-layers" small={true} />
                    </div>
                    <span className="text-[14px] font-bold [letter-spacing:-0.01em]">
                        Ops
                    </span>
                </div>

                <nav className="flex flex-1 flex-col gap-[2px] p-[10px]">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                NAV_ITEM_CLS,
                                isCurrentUrl(item.href) && 'active',
                            )}
                        >
                            <IconUse icon={item.icon} small={true} />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                {currentTeam ? (
                    <div className="border-t border-bion-border p-[10px]">
                        <Link
                            href={dashboard(currentTeam.slug)}
                            className={NAV_ITEM_CLS}
                        >
                            <IconUse icon="i-arrow-left" small={true} />
                            My Workspace
                        </Link>
                    </div>
                ) : null}
            </aside>

            <div className="flex min-h-0 flex-1 flex-col">
                <header className="flex h-[60px] shrink-0 items-center justify-between gap-[16px] border-b border-bion-border px-[20px]">
                    <span className="text-[14.5px] font-semibold">
                        {currentPageTitle}
                    </span>

                    <div className="flex shrink-0 items-center gap-[8px]">
                        <div className="flex items-center gap-[2px] rounded-[8px] border border-bion-border bg-bion-surface p-[2px]">
                            <button
                                type="button"
                                className={cn(
                                    'flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted [&.active]:bg-bion-accent-soft! [&.active]:text-bion-accent!',
                                    appearance === 'light' && 'active',
                                )}
                                title="Light"
                                onClick={() => updateAppearance('light')}
                            >
                                <IconUse icon="i-sun" small={true} />
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted [&.active]:bg-bion-accent-soft! [&.active]:text-bion-accent!',
                                    appearance === 'dark' && 'active',
                                )}
                                title="Dark"
                                onClick={() => updateAppearance('dark')}
                            >
                                <IconUse icon="i-moon" small={true} />
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted [&.active]:bg-bion-accent-soft! [&.active]:text-bion-accent!',
                                    appearance === 'system' && 'active',
                                )}
                                title="System"
                                onClick={() => updateAppearance('system')}
                            >
                                <IconUse icon="i-monitor" small={true} />
                            </button>
                        </div>

                        <div className="flex items-center gap-[8px] rounded-[8px] py-[4px] pr-[8px] pl-[4px]">
                            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-bion-accent text-[11px] font-bold text-bion-accent-text">
                                {initials(auth.user.name)}
                            </div>
                            <span className="text-[13px] text-bion-text-muted">
                                {auth.user.name}
                            </span>
                            <Link
                                href={logout()}
                                as="button"
                                className="ml-[6px] flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-danger"
                                title="Log out"
                            >
                                <IconUse icon="i-logout" small={true} />
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="min-h-0 flex-1 overflow-y-auto p-[24px]">
                    {children}
                </main>
            </div>
        </div>
    );
}
