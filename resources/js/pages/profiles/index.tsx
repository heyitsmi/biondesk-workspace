import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as profileCreate, edit as profileEdit, index as profiles } from '@/routes/profiles';
import type { ProfileCategory, ProfileItem, ProfilesPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');

const PILL_BASE =
    'inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-medium whitespace-nowrap';

const CATEGORY_ICON_WRAP: Record<ProfileCategory, string> = {
    company: 'bg-bion-info-soft text-bion-info',
    team: 'bg-bion-success-soft text-bion-success',
    case: 'bg-bion-accent-soft text-bion-accent',
    asset: 'bg-bion-surface-raised text-bion-text-muted',
};

const CATEGORY_PILL: Record<ProfileCategory, string> = {
    company: cn(PILL_BASE, 'bg-bion-info-soft text-bion-info'),
    team: cn(PILL_BASE, 'bg-bion-success-soft text-bion-success'),
    case: cn(PILL_BASE, 'bg-bion-accent-soft text-bion-accent'),
    asset: cn(PILL_BASE, 'border border-bion-border bg-bion-surface-raised text-bion-text-muted'),
};

const CATEGORY_DOT: Record<ProfileCategory, string> = {
    company: 'bg-bion-info',
    team: 'bg-bion-success',
    case: 'bg-bion-accent',
    asset: 'bg-bion-text-muted',
};

const TABS: Array<{ key: 'all' | ProfileCategory; label: string }> = [
    { key: 'all', label: 'All Profiles' },
    { key: 'company', label: 'Company Info' },
    { key: 'team', label: 'Team Bios' },
    { key: 'case', label: 'Case Studies' },
];

export default function ProfilesPage({ profiles: initialProfiles }: ProfilesPageProps) {
    const { currentTeam } = usePage().props;
    const [items, setItems] = useState<ProfileItem[]>(initialProfiles);
    const [activeTab, setActiveTab] = useState<'all' | ProfileCategory>('all');

    const visibleItems = useMemo(() => {
        if (activeTab === 'all') {
            return items;
        }

        return items.filter((item) => item.category === activeTab);
    }, [items, activeTab]);

    const visitCreate = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(profileCreate(currentTeam.slug));
    };

    const duplicateProfile = (profile: ProfileItem): void => {
        const nextId = Math.max(...items.map((item) => item.id), 0) + 1;

        setItems((current) => [
            ...current,
            { ...profile, id: nextId, title: `${profile.title} (Copy)`, updatedAt: 'Updated just now' },
        ]);
    };

    const deleteProfile = (profileId: number): void => {
        setItems((current) => current.filter((item) => item.id !== profileId));
    };

    return (
        <>
            <Head title="Profile Library" />

            <div className="mb-[16px] flex flex-wrap items-center justify-between gap-[16px]">
                <p className="text-[13px] text-bion-text-muted">
                    Manage reusable company profiles, team bios, and case studies for your proposals.
                </p>
                <button type="button" className={BTN_PRIMARY} onClick={visitCreate}>
                    <svg className={ICON_SM_CLS}>
                        <use href="#i-plus" />
                    </svg>
                    Create Profile
                </button>
            </div>

            <div className="mb-[24px] flex gap-[32px] overflow-x-auto border-b border-bion-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TABS.map((tab) => (
                    <div
                        key={tab.key}
                        role="button"
                        tabIndex={0}
                        className={cn(
                            'relative cursor-pointer pb-[16px] text-[14px] font-medium whitespace-nowrap text-bion-text-muted [transition:color_0.12s_ease] hover:text-bion-text',
                            activeTab === tab.key &&
                                'text-bion-text! font-semibold! after:absolute after:-bottom-px after:left-0 after:right-0 after:h-[2px] after:rounded-t-[2px] after:bg-bion-accent after:content-[""]',
                        )}
                        onClick={() => setActiveTab(tab.key)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setActiveTab(tab.key);
                            }
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            <div className="grid gap-[20px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                {visibleItems.map((item) => (
                    <div
                        key={item.id}
                        className="relative flex flex-col rounded-[12px] border border-bion-border bg-bion-surface p-[20px] [transition:border-color_0.15s_ease,box-shadow_0.15s_ease] hover:border-bion-accent hover:shadow-bion-raised"
                    >
                        <div className="mb-[12px] flex items-start justify-between">
                            <div
                                className={cn(
                                    'flex h-[40px] w-[40px] items-center justify-center rounded-[8px]',
                                    CATEGORY_ICON_WRAP[item.category],
                                )}
                            >
                                <svg className="h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                    <use href={`#${item.icon}`} />
                                </svg>
                            </div>
                            <div className="flex gap-[4px]">
                                {currentTeam ? (
                                    <Link
                                        href={profileEdit({ current_team: currentTeam.slug, profile: item.id })}
                                        title="Edit"
                                        className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:border hover:border-bion-border hover:bg-bion-surface-raised hover:text-bion-text"
                                    >
                                        <svg className={ICON_SM_CLS}>
                                            <use href="#i-edit" />
                                        </svg>
                                    </Link>
                                ) : null}
                                <button
                                    type="button"
                                    title="Duplicate"
                                    className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:border hover:border-bion-border hover:bg-bion-surface-raised hover:text-bion-text"
                                    onClick={() => duplicateProfile(item)}
                                >
                                    <svg className={ICON_SM_CLS}>
                                        <use href="#i-copy" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    title="Delete"
                                    className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:border hover:border-bion-border hover:bg-bion-surface-raised hover:text-bion-text"
                                    onClick={() => deleteProfile(item.id)}
                                >
                                    <svg className={ICON_SM_CLS}>
                                        <use href="#i-trash" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <h3 className="mb-[6px] text-[15px] leading-[1.4] font-semibold text-bion-text">
                            {item.title}
                        </h3>
                        <p className="mb-[16px] flex-1 overflow-hidden text-[13px] leading-normal text-bion-text-muted [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box]">
                            {item.description}
                        </p>
                        <div className="mt-auto flex items-center justify-between border-t border-bion-border pt-[16px]">
                            <span className={CATEGORY_PILL[item.category]}>
                                <span className={cn('h-[6px] w-[6px] rounded-full', CATEGORY_DOT[item.category])} />
                                {item.categoryLabel}
                            </span>
                            <div className="flex items-center gap-[6px] font-mono text-[12px] text-bion-text-muted">
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-clock" />
                                </svg>
                                {item.updatedAt}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

ProfilesPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Profile Library',
            href: props.currentTeam ? profiles(props.currentTeam.slug) : '/',
        },
    ],
});
