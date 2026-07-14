import { Link, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { IconSprite, IconUse } from '@/components/biondesk/icon-sprite';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard, home, logout } from '@/routes';
import { index as automations } from '@/routes/automations';
import { index as bionAi } from '@/routes/bion-ai';
import { index as calendar } from '@/routes/calendar';
import { index as contacts } from '@/routes/contacts';
import { index as invoices } from '@/routes/invoices';
import { index as opportunities } from '@/routes/opportunities';
import { dashboard as opsDashboard } from '@/routes/ops';
import { edit as profile } from '@/routes/profile';
import { index as profileLibrary } from '@/routes/profiles';
import { index as projects } from '@/routes/projects';
import { index as proposals } from '@/routes/proposals';
import { index as quotations } from '@/routes/quotations';
import { index as reminders } from '@/routes/reminders';
import type { BreadcrumbItem } from '@/types';
import type { Auth } from '@/types/auth';
import type { Team } from '@/types/teams';

type Props = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    mainClassName?: string;
};

const DEFAULT_MAIN_CLS =
    'flex-1 overflow-y-auto px-[32px] py-[28px] max-[760px]:px-[16px] max-[760px]:pt-[20px] max-[760px]:pb-[40px]';

type NavItem = {
    title: string;
    icon: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    badge?: string;
};

type NavSection = {
    label?: string;
    items: NavItem[];
};

type SidebarCounts = {
    opportunities: number;
    projects: number;
    proposals: number;
    quotations: number;
    invoices: number;
    contacts: number;
    reminders: number;
    automations: number;
    profileLibrary: number;
};

type AppShellPageProps = {
    auth: Auth;
    currentTeam: Team | null;
    sidebarOpen?: boolean;
    sidebarCounts: SidebarCounts | null;
};

const TOOLTIP_CLS = cn(
    'tooltip hidden group-[.collapsed]/sidebar:pointer-events-none group-[.collapsed]/sidebar:absolute',
    'group-[.collapsed]/sidebar:top-1/2 group-[.collapsed]/sidebar:left-full group-[.collapsed]/sidebar:z-40',
    'group-[.collapsed]/sidebar:ml-[10px] group-[.collapsed]/sidebar:-translate-y-1/2 group-[.collapsed]/sidebar:rounded-[6px]',
    'group-[.collapsed]/sidebar:border group-[.collapsed]/sidebar:border-bion-border group-[.collapsed]/sidebar:bg-bion-surface-raised',
    'group-[.collapsed]/sidebar:px-[10px] group-[.collapsed]/sidebar:py-[5px] group-[.collapsed]/sidebar:text-[12px]',
    'group-[.collapsed]/sidebar:whitespace-nowrap group-[.collapsed]/sidebar:opacity-0 group-[.collapsed]/sidebar:shadow-bion-raised',
    'group-[.collapsed]/sidebar:[transition:opacity_0.15s_ease]',
    'group-[.collapsed]/sidebar:group-hover/nav:opacity-100!',
    'group-[.collapsed]/sidebar:block!',
);

const NAV_ITEM_BASE =
    'nav-item group/nav relative flex items-center gap-[12px] rounded-[8px] px-[10px] py-[9px] text-[13.5px] font-medium whitespace-nowrap [transition:background_0.12s_ease,color_0.12s_ease] group-[.collapsed]/sidebar:justify-center';

const commandItems: Array<{
    section: string;
    label: string;
    icon: string;
    highlighted?: boolean;
}> = [
    {
        section: 'Quick actions',
        label: 'New Opportunity',
        icon: 'i-plus',
        highlighted: true,
    },
    { section: 'Quick actions', label: 'New Invoice', icon: 'i-file' },
    { section: 'Jump to', label: 'Opportunities', icon: 'i-kanban' },
    { section: 'Jump to', label: 'Projects', icon: 'i-briefcase' },
    { section: 'Jump to', label: 'Contacts', icon: 'i-users' },
];

const notificationItems = [
    { title: 'Invoice INV-0043 is now overdue', time: '2 hours ago' },
    { title: 'New lead via public form: Retail Co', time: 'Yesterday' },
    { title: 'Payment received for INV-0041', time: '2 days ago' },
] as const;

const countBadge = (count: number | undefined): string =>
    (count ?? 0).toLocaleString('en-US');

export default function BiondeskAppShell({
    children,
    breadcrumbs = [],
    mainClassName = DEFAULT_MAIN_CLS,
}: Props) {
    const page = usePage<AppShellPageProps>();
    const { auth, currentTeam, sidebarOpen } = page.props;
    const { appearance, updateAppearance } = useAppearance();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const initials = useInitials();
    const [desktopCollapsed, setDesktopCollapsed] = useState(
        !(sidebarOpen ?? true),
    );
    const [mobileOpen, setMobileOpen] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement | null>(null);
    const userRef = useRef<HTMLDivElement | null>(null);

    const currentPageTitle =
        breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Workspace';

    const sidebarCounts = page.props.sidebarCounts;

    const navSections = useMemo<NavSection[]>(() => {
        if (!currentTeam) {
            return [];
        }

        return [
            {
                items: [
                    {
                        title: 'Dashboard',
                        icon: 'i-grid',
                        href: dashboard(currentTeam.slug),
                    },
                    {
                        title: 'Calendar',
                        icon: 'i-calendar',
                        href: calendar(currentTeam.slug),
                    },
                    {
                        title: 'Opportunities',
                        icon: 'i-kanban',
                        href: opportunities(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.opportunities),
                    },
                    {
                        title: 'Projects',
                        icon: 'i-briefcase',
                        href: projects(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.projects),
                    },
                    {
                        title: 'BionAI',
                        icon: 'i-sparkles',
                        href: bionAi(currentTeam.slug),
                    },
                ],
            },
            {
                label: 'Documents',
                items: [
                    {
                        title: 'Proposals',
                        icon: 'i-file',
                        href: proposals(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.proposals),
                    },
                    {
                        title: 'Quotations',
                        icon: 'i-quote',
                        href: quotations(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.quotations),
                    },
                    {
                        title: 'Invoices',
                        icon: 'i-receipt',
                        href: invoices(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.invoices),
                    },
                    {
                        title: 'Contacts',
                        icon: 'i-users',
                        href: contacts(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.contacts),
                    },
                ],
            },
            {
                label: 'Workspace',
                items: [
                    {
                        title: 'Reminders',
                        icon: 'i-bell',
                        href: reminders(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.reminders),
                    },
                    {
                        title: 'Automations',
                        icon: 'i-sparkles',
                        href: automations(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.automations),
                    },
                    {
                        title: 'Profile Library',
                        icon: 'i-layers',
                        href: profileLibrary(currentTeam.slug),
                        badge: countBadge(sidebarCounts?.profileLibrary),
                    },
                ],
            },
        ];
    }, [currentTeam, sidebarCounts]);

    useEffect(() => {
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.style.overflow = previousBodyOverflow;
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent): void => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setCommandOpen((current) => !current);
            }

            if (event.key === 'Escape') {
                setCommandOpen(false);
                setNotificationsOpen(false);
                setUserOpen(false);
                setMobileOpen(false);
            }
        };

        const onDocumentClick = (event: MouseEvent): void => {
            const target = event.target as Node;

            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(target)
            ) {
                setNotificationsOpen(false);
            }

            if (userRef.current && !userRef.current.contains(target)) {
                setUserOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('click', onDocumentClick);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('click', onDocumentClick);
        };
    }, []);

    const toggleCollapsed = (): void => {
        const next = !desktopCollapsed;
        setDesktopCollapsed(next);
        document.cookie = `sidebar_state=${!next}; path=/; max-age=604800; SameSite=Lax`;
    };

    return (
        <div className="flex h-screen overflow-hidden bg-bion-bg font-display text-[14px] text-bion-text antialiased">
            <IconSprite />

            <aside
                className={cn(
                    'group/sidebar relative flex shrink-0 flex-col border-r border-bion-border bg-bion-surface [transition:width_0.2s_ease]',
                    'max-[760px]:w-[240px] min-[761px]:[&.collapsed]:w-[68px] [&:not(.collapsed)]:w-[240px]',
                    'max-[760px]:fixed max-[760px]:-left-[240px] max-[760px]:z-[60] max-[760px]:h-screen',
                    'max-[760px]:[transition:left_0.2s_ease] max-[760px]:[&.mobile-open]:left-0!',
                    desktopCollapsed && 'collapsed',
                    mobileOpen && 'mobile-open',
                )}
            >
                <div className="flex h-[60px] shrink-0 items-center gap-[10px] border-b border-bion-border px-[18px]">
                    <Link
                        href={
                            currentTeam ? dashboard(currentTeam.slug) : home()
                        }
                        className="flex items-center gap-[10px]"
                    >
                        <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] border border-bion-border bg-bion-surface-raised">
                            <span className="h-[7px] w-[7px] rounded-full bg-bion-accent" />
                        </div>
                        <span className="overflow-hidden text-[15px] font-semibold whitespace-nowrap group-[.collapsed]/sidebar:hidden">
                            Biondesk
                        </span>
                    </Link>
                </div>

                <button
                    type="button"
                    className="absolute top-[16px] -right-[14px] z-[35] flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-bion-border bg-bion-surface text-bion-text-muted shadow-bion-raised [transition:background_0.12s_ease,color_0.12s_ease,border-color_0.12s_ease] hover:border-bion-accent hover:text-bion-text max-[760px]:hidden"
                    title={
                        desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                    }
                    onClick={toggleCollapsed}
                >
                    <IconUse
                        icon="i-chevron-left"
                        small={true}
                        className="[transition:transform_0.2s_ease] group-[.collapsed]/sidebar:rotate-180"
                    />
                </button>

                <nav className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-[12px] py-[16px] group-[.collapsed]/sidebar:overflow-visible!">
                    {navSections.map((section, index) => (
                        <div key={section.label ?? `section-${index}`}>
                            {section.label ? (
                                <div className="px-[10px] pt-[14px] pb-[6px] text-[11px] [letter-spacing:0.06em] text-bion-text-muted uppercase group-[.collapsed]/sidebar:hidden">
                                    {section.label}
                                </div>
                            ) : null}

                            {section.items.map((item) => (
                                <SidebarNavLink
                                    key={item.title}
                                    item={item}
                                    active={
                                        item.href
                                            ? isCurrentOrParentUrl(item.href)
                                            : false
                                    }
                                />
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="shrink-0 border-t border-bion-border px-[12px] py-[10px]">
                    <Link
                        href={profile()}
                        prefetch
                        className={cn(
                            NAV_ITEM_BASE,
                            'text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text',
                        )}
                    >
                        <IconUse icon="i-settings" />
                        <span className="group-[.collapsed]/sidebar:hidden">
                            Settings
                        </span>
                        <span className={TOOLTIP_CLS}>Settings</span>
                    </Link>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-bion-border bg-bion-bg px-[24px] max-[760px]:px-[16px]">
                    <div className="flex items-center gap-[14px]">
                        <button
                            type="button"
                            className="relative hidden h-[34px] w-[34px] items-center justify-center rounded-[8px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text max-[760px]:flex"
                            onClick={() => setMobileOpen((current) => !current)}
                        >
                            <IconUse icon="i-menu" />
                        </button>
                        <span className="text-[13.5px] font-semibold text-bion-text">
                            {currentPageTitle}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="flex w-[280px] shrink-0 items-center gap-[10px] rounded-[8px] border border-bion-border bg-bion-surface px-[10px] py-[7px] text-[13px] text-bion-text-muted hover:border-bion-accent max-[1024px]:hidden"
                        onClick={() => setCommandOpen(true)}
                    >
                        <IconUse icon="i-search" small={true} />
                        <span>Search or jump to...</span>
                        <span className="ml-auto rounded-[4px] border border-bion-border bg-bion-surface-raised px-[6px] py-px font-mono text-[11px]">
                            ⌘K
                        </span>
                    </button>

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

                        <div className="relative" ref={notificationsRef}>
                            <button
                                type="button"
                                className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[8px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setNotificationsOpen((current) => !current);
                                    setUserOpen(false);
                                }}
                            >
                                <IconUse icon="i-bell" />
                                <span className="absolute top-[7px] right-[7px] h-[6px] w-[6px] rounded-full border-[1.5px] border-bion-bg bg-bion-danger" />
                            </button>
                            <div
                                className={cn(
                                    'pointer-events-none absolute top-[calc(100%+8px)] right-0 z-50 w-[260px] [transform:translateY(-6px)_scale(0.98)] rounded-[10px] border border-bion-border bg-bion-surface-raised p-[6px] opacity-0 shadow-bion-raised [transition:opacity_0.14s_ease,transform_0.14s_ease]',
                                    '[&.open]:pointer-events-auto! [&.open]:[transform:translateY(0)_scale(1)]! [&.open]:opacity-100!',
                                    notificationsOpen && 'open',
                                )}
                            >
                                <div className="mb-[4px] border-b border-bion-border px-[10px] py-[8px] text-[12.5px] font-semibold">
                                    Notifications
                                </div>
                                {notificationItems.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-[7px] p-[10px] hover:bg-bion-bg"
                                    >
                                        <div className="mb-[2px] text-[12.5px] font-medium">
                                            {item.title}
                                        </div>
                                        <div className="text-[11.5px] text-bion-text-muted">
                                            {item.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative" ref={userRef}>
                            <button
                                type="button"
                                className="flex items-center gap-[8px] rounded-[8px] py-[4px] pr-[8px] pl-[4px] hover:bg-bion-surface-raised"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setUserOpen((current) => !current);
                                    setNotificationsOpen(false);
                                }}
                            >
                                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-bion-accent text-[11px] font-bold text-bion-accent-text">
                                    {initials(auth.user.name)}
                                </div>
                                <IconUse
                                    icon="i-chevron-down"
                                    small={true}
                                    className="text-bion-text-muted"
                                />
                            </button>
                            <div
                                className={cn(
                                    'pointer-events-none absolute top-[calc(100%+8px)] right-0 z-50 w-[260px] [transform:translateY(-6px)_scale(0.98)] rounded-[10px] border border-bion-border bg-bion-surface-raised p-[6px] opacity-0 shadow-bion-raised [transition:opacity_0.14s_ease,transform_0.14s_ease]',
                                    '[&.open]:pointer-events-auto! [&.open]:[transform:translateY(0)_scale(1)]! [&.open]:opacity-100!',
                                    userOpen && 'open',
                                )}
                            >
                                <Link
                                    href={profile()}
                                    prefetch
                                    className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-text hover:bg-bion-bg"
                                >
                                    <IconUse icon="i-user" small={true} />
                                    Profile
                                </Link>
                                <Link
                                    href={profile()}
                                    prefetch
                                    className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-text hover:bg-bion-bg"
                                >
                                    <IconUse icon="i-settings" small={true} />
                                    Settings
                                </Link>
                                {auth.user.is_super_admin ? (
                                    <Link
                                        href={opsDashboard()}
                                        className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-text hover:bg-bion-bg"
                                    >
                                        <IconUse icon="i-layers" small={true} />
                                        Ops Portal
                                    </Link>
                                ) : null}
                                <Link
                                    href={logout()}
                                    as="button"
                                    className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-danger hover:bg-bion-bg"
                                >
                                    <IconUse icon="i-logout" small={true} />
                                    Log out
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <main className={mainClassName}>{children}</main>
            </div>

            <div
                className={cn(
                    'group/modal pointer-events-none fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-[12vh] opacity-0 [transition:opacity_0.15s_ease]',
                    '[&.open]:pointer-events-auto! [&.open]:opacity-100!',
                    commandOpen && 'open',
                )}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        setCommandOpen(false);
                    }
                }}
            >
                <div className="w-full max-w-[560px] [transform:translateY(-12px)_scale(0.98)] rounded-[14px] border border-bion-border bg-bion-surface-raised shadow-[0_24px_60px_rgba(0,0,0,0.4)] [transition:transform_0.15s_ease] group-[.open]/modal:[transform:translateY(0)_scale(1)]">
                    <div className="flex items-center gap-[10px] border-b border-bion-border px-[16px] py-[14px] text-bion-text-muted">
                        <IconUse icon="i-search" />
                        <input
                            autoFocus={commandOpen}
                            type="text"
                            placeholder="Search opportunities, projects, invoices..."
                            className="flex-1 border-none bg-transparent text-[14.5px] text-bion-text outline-none placeholder:text-bion-text-muted"
                        />
                        <span className="rounded-[4px] border border-bion-border bg-bion-bg px-[6px] py-[2px] font-mono text-[11px]">
                            Esc
                        </span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto p-[8px]">
                        {Array.from(
                            new Set(commandItems.map((item) => item.section)),
                        ).map((section) => (
                            <div key={section}>
                                <div className="px-[10px] pt-[10px] pb-[6px] text-[11px] [letter-spacing:0.05em] text-bion-text-muted uppercase">
                                    {section}
                                </div>
                                {commandItems
                                    .filter((item) => item.section === section)
                                    .map((item) => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            className={cn(
                                                'flex w-full items-center gap-[12px] rounded-[8px] p-[10px] text-left text-[13.5px] text-bion-text hover:bg-bion-accent-soft! hover:text-bion-accent!',
                                                '[&.hi]:bg-bion-accent-soft! [&.hi]:text-bion-accent!',
                                                item.highlighted && 'hi',
                                            )}
                                            onClick={() =>
                                                setCommandOpen(false)
                                            }
                                        >
                                            <IconUse icon={item.icon} />
                                            {item.label}
                                        </button>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarNavLink({ item, active }: { item: NavItem; active: boolean }) {
    const content = (
        <>
            <IconUse icon={item.icon} />
            <span className="group-[.collapsed]/sidebar:hidden">
                {item.title}
            </span>
            {item.badge ? (
                <span className="ml-auto font-mono text-[11px] text-bion-text-muted group-[.collapsed]/sidebar:hidden">
                    {item.badge}
                </span>
            ) : null}
            <span className={TOOLTIP_CLS}>{item.title}</span>
        </>
    );

    const stateClasses = active
        ? 'bg-bion-accent-soft text-bion-accent'
        : 'text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text';

    if (item.href) {
        return (
            <Link
                href={item.href}
                prefetch
                className={cn(NAV_ITEM_BASE, stateClasses)}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={cn(NAV_ITEM_BASE, stateClasses, 'w-full text-left')}
        >
            {content}
        </button>
    );
}
