import { Link, usePage, type InertiaLinkProps } from '@inertiajs/react';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import {
    dashboard,
    home,
    logout,
} from '@/routes';
import { index as contacts } from '@/routes/contacts';
import { index as invoices } from '@/routes/invoices';
import { index as opportunities } from '@/routes/opportunities';
import { edit as profile } from '@/routes/profile';
import { index as profileLibrary } from '@/routes/profiles';
import { index as projects } from '@/routes/projects';
import { index as proposals } from '@/routes/proposals';
import { index as quotations } from '@/routes/quotations';
import { index as reminders } from '@/routes/reminders';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { BreadcrumbItem } from '@/types';

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

const ICON_CLS =
    'h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';
const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

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
    { section: 'Quick actions', label: 'New Opportunity', icon: 'i-plus', highlighted: true },
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

const iconSprite = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></symbol>
      <symbol id="i-kanban" viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/></symbol>
      <symbol id="i-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></symbol>
      <symbol id="i-briefcase" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M3 12h18"/></symbol>
      <symbol id="i-file" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M14 2v5h5"/><path d="M8 13h8M8 17h8M8 9h3"/></symbol>
      <symbol id="i-trend" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></symbol>
      <symbol id="i-wallet" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M16 12h3"/></symbol>
      <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></symbol>
      <symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></symbol>
      <symbol id="i-quote" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3V2a1 1 0 011-1h4a1 1 0 011 1v1"/><path d="M9 10l1.5 1.5L14 8"/><path d="M8 15h8"/></symbol>
      <symbol id="i-receipt" viewBox="0 0 24 24"><path d="M6 2h12v19l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V2z"/><path d="M9 7h6M9 11h6M9 15h4"/></symbol>
      <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="8.5" r="2.6"/><path d="M15.8 12.3c2.6.4 4.7 2.4 4.7 5.4"/></symbol>
      <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z"/><path d="M10 19a2 2 0 004 0"/></symbol>
      <symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></symbol>
      <symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.6 7.6 0 000-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 00-1.7-1L14.8 3h-3.6l-.5 2.6a7.4 7.4 0 00-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 000 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.5 2.6h3.6l.5-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6z"/></symbol>
      <symbol id="i-chevron-left" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>
      <symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="M5 9l7 7 7-7"/></symbol>
      <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.3-4.3"/></symbol>
      <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></symbol>
      <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z"/></symbol>
      <symbol id="i-monitor" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="13" rx="1.5"/><path d="M8 20h8M12 17v3"/></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
      <symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></symbol>
      <symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></symbol>
      <symbol id="i-eye" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></symbol>
      <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></symbol>
      <symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
      <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>
      <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></symbol>
      <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></symbol>
      <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7"/></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></symbol>
      <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></symbol>
      <symbol id="i-check-square" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/></symbol>
      <symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></symbol>
      <symbol id="i-upload" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></symbol>
      <symbol id="i-bold" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z"/></symbol>
      <symbol id="i-italic" viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></symbol>
      <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></symbol>
      <symbol id="i-message-circle" viewBox="0 0 24 24"><path d="M21 12a8 8 0 11-3.5-6.6L21 4l-1 4.5A7.9 7.9 0 0121 12z"/></symbol>
      <symbol id="i-send" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></symbol>
      <symbol id="i-phone" viewBox="0 0 24 24"><path d="M4 4h4l2 6-3 2a13 13 0 006 6l2-3 6 2v4a2 2 0 01-2 2C10 23 1 14 1 4a2 2 0 012-2z"/></symbol>
      <symbol id="i-sparkles" viewBox="0 0 24 24"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></symbol>
      <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></symbol>
      <symbol id="i-edit" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></symbol>
      <symbol id="i-paperclip" viewBox="0 0 24 24"><path d="M21 12.5l-8.5 8.5a4 4 0 01-5.7-5.7l9-9a2.7 2.7 0 013.8 3.8l-8.5 8.5a1.3 1.3 0 01-1.9-1.9l7.9-7.9"/></symbol>
      <symbol id="i-tag" viewBox="0 0 24 24"><path d="M12 2H4a1 1 0 00-1 1v8l10 10 9-9L12 2z"/><circle cx="7" cy="7" r="1.3"/></symbol>
      <symbol id="i-align-left" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h13"/></symbol>
    </defs>
  </svg>
`;

export default function BiondeskAppShell({
    children,
    breadcrumbs = [],
    mainClassName = DEFAULT_MAIN_CLS,
}: Props) {
    const page = usePage();
    const { auth, currentTeam, sidebarOpen } = page.props;
    const { appearance, updateAppearance } = useAppearance();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const initials = useInitials();
    const [desktopCollapsed, setDesktopCollapsed] = useState(!(sidebarOpen ?? true));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement | null>(null);
    const userRef = useRef<HTMLDivElement | null>(null);

    const currentPageTitle =
        breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Workspace';

    const propsBag = page.props as Record<string, unknown>;
    const opportunityCount = Array.isArray(propsBag.opportunities)
        ? String(propsBag.opportunities.length)
        : '6';
    const projectCount = Array.isArray(propsBag.projects)
        ? String(propsBag.projects.length)
        : '4';
    const proposalCount = Array.isArray(propsBag.documents)
        ? String(propsBag.documents.length)
        : '2';
    const invoiceCount = Array.isArray(propsBag.invoices)
        ? String(propsBag.invoices.length)
        : '4';
    const quotationCount = Array.isArray(propsBag.quotations)
        ? String(propsBag.quotations.length)
        : '4';
    const contactsCount =
        typeof propsBag.contactsCount === 'number' ||
        typeof propsBag.contactsCount === 'string'
            ? String(propsBag.contactsCount)
            : Array.isArray(propsBag.contacts)
              ? String(propsBag.contacts.length)
              : '5';
    const remindersSummary = propsBag.summary as { allCount?: number } | undefined;
    const remindersCount =
        typeof remindersSummary?.allCount === 'number'
            ? String(remindersSummary.allCount)
            : '8';
    const profilesCount = Array.isArray(propsBag.profiles)
        ? String(propsBag.profiles.length)
        : '5';

    const navSections = useMemo<NavSection[]>(() => {
        if (!currentTeam) {
            return [];
        }

        return [
            {
                items: [
                    { title: 'Dashboard', icon: 'i-grid', href: dashboard(currentTeam.slug) },
                    { title: 'Opportunities', icon: 'i-kanban', href: opportunities(currentTeam.slug), badge: opportunityCount },
                    { title: 'Projects', icon: 'i-briefcase', href: projects(currentTeam.slug), badge: projectCount },
                ],
            },
            {
                label: 'Documents',
                items: [
                    { title: 'Proposals', icon: 'i-file', href: proposals(currentTeam.slug), badge: proposalCount },
                    { title: 'Quotations', icon: 'i-quote', href: quotations(currentTeam.slug), badge: quotationCount },
                    { title: 'Invoices', icon: 'i-receipt', href: invoices(currentTeam.slug), badge: invoiceCount },
                    { title: 'Contacts', icon: 'i-users', href: contacts(currentTeam.slug), badge: contactsCount },
                ],
            },
            {
                label: 'Workspace',
                items: [
                    { title: 'Reminders', icon: 'i-bell', href: reminders(currentTeam.slug), badge: remindersCount },
                    { title: 'Profile Library', icon: 'i-layers', href: profileLibrary(currentTeam.slug), badge: profilesCount },
                ],
            },
        ];
    }, [currentTeam, opportunityCount, projectCount, proposalCount, invoiceCount, quotationCount, contactsCount, remindersCount, profilesCount]);

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
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
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
            <div dangerouslySetInnerHTML={{ __html: iconSprite }} />

            <aside
                className={cn(
                    'group/sidebar relative flex shrink-0 flex-col border-r border-bion-border bg-bion-surface [transition:width_0.2s_ease]',
                    '[&:not(.collapsed)]:w-[240px] min-[761px]:[&.collapsed]:w-[68px] max-[760px]:w-[240px]',
                    'max-[760px]:fixed max-[760px]:z-[60] max-[760px]:h-screen max-[760px]:-left-[240px]',
                    'max-[760px]:[transition:left_0.2s_ease] max-[760px]:[&.mobile-open]:left-0!',
                    desktopCollapsed && 'collapsed',
                    mobileOpen && 'mobile-open',
                )}
            >
                <div className="flex h-[60px] shrink-0 items-center gap-[10px] border-b border-bion-border px-[18px]">
                    <Link
                        href={currentTeam ? dashboard(currentTeam.slug) : home()}
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
                    title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
                                <div className="pt-[14px] px-[10px] pb-[6px] text-[11px] text-bion-text-muted uppercase [letter-spacing:0.06em] group-[.collapsed]/sidebar:hidden">
                                    {section.label}
                                </div>
                            ) : null}

                            {section.items.map((item) => (
                                <SidebarNavLink
                                    key={item.title}
                                    item={item}
                                    active={item.href ? isCurrentOrParentUrl(item.href) : false}
                                />
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="shrink-0 border-t border-bion-border px-[12px] py-[10px]">
                    <Link
                        href={profile()}
                        prefetch
                        className={cn(NAV_ITEM_BASE, 'text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text')}
                    >
                        <IconUse icon="i-settings" />
                        <span className="group-[.collapsed]/sidebar:hidden">Settings</span>
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
                        <span className="text-[13.5px] font-semibold text-bion-text">{currentPageTitle}</span>
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
                                    'absolute top-[calc(100%+8px)] right-0 z-50 w-[260px] rounded-[10px] border border-bion-border bg-bion-surface-raised p-[6px] opacity-0 pointer-events-none shadow-bion-raised [transform:translateY(-6px)_scale(0.98)] [transition:opacity_0.14s_ease,transform_0.14s_ease]',
                                    '[&.open]:opacity-100! [&.open]:pointer-events-auto! [&.open]:[transform:translateY(0)_scale(1)]!',
                                    notificationsOpen && 'open',
                                )}
                            >
                                <div className="mb-[4px] border-b border-bion-border px-[10px] py-[8px] text-[12.5px] font-semibold">
                                    Notifications
                                </div>
                                {notificationItems.map((item) => (
                                    <div key={item.title} className="rounded-[7px] p-[10px] hover:bg-bion-bg">
                                        <div className="mb-[2px] text-[12.5px] font-medium">{item.title}</div>
                                        <div className="text-[11.5px] text-bion-text-muted">{item.time}</div>
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
                                    'absolute top-[calc(100%+8px)] right-0 z-50 w-[260px] rounded-[10px] border border-bion-border bg-bion-surface-raised p-[6px] opacity-0 pointer-events-none shadow-bion-raised [transform:translateY(-6px)_scale(0.98)] [transition:opacity_0.14s_ease,transform_0.14s_ease]',
                                    '[&.open]:opacity-100! [&.open]:pointer-events-auto! [&.open]:[transform:translateY(0)_scale(1)]!',
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
                    'group/modal fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-[12vh] opacity-0 pointer-events-none [transition:opacity_0.15s_ease]',
                    '[&.open]:opacity-100! [&.open]:pointer-events-auto!',
                    commandOpen && 'open',
                )}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        setCommandOpen(false);
                    }
                }}
            >
                <div className="w-full max-w-[560px] rounded-[14px] border border-bion-border bg-bion-surface-raised shadow-[0_24px_60px_rgba(0,0,0,0.4)] [transform:translateY(-12px)_scale(0.98)] [transition:transform_0.15s_ease] group-[.open]/modal:[transform:translateY(0)_scale(1)]">
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
                        {Array.from(new Set(commandItems.map((item) => item.section))).map(
                            (section) => (
                                <div key={section}>
                                    <div className="px-[10px] pt-[10px] pb-[6px] text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em]">
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
                                                onClick={() => setCommandOpen(false)}
                                            >
                                                <IconUse icon={item.icon} />
                                                {item.label}
                                            </button>
                                        ))}
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarNavLink({
    item,
    active,
}: {
    item: NavItem;
    active: boolean;
}) {
    const content = (
        <>
            <IconUse icon={item.icon} />
            <span className="group-[.collapsed]/sidebar:hidden">{item.title}</span>
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
        <button type="button" className={cn(NAV_ITEM_BASE, stateClasses, 'w-full text-left')}>
            {content}
        </button>
    );
}

function IconUse({
    icon,
    small = false,
    className,
}: {
    icon: string;
    small?: boolean;
    className?: string;
}) {
    return (
        <svg className={cn(small ? ICON_SM_CLS : ICON_CLS, className)}>
            <use href={`#${icon}`} />
        </svg>
    );
}
