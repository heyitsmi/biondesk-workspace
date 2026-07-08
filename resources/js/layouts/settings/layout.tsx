import { Link, usePage } from '@inertiajs/react';
import { Briefcase, Link2, Shield, Sun, User } from 'lucide-react';
import type { ComponentType, PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editLeadForm } from '@/routes/lead-form';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { edit as editTeam } from '@/routes/teams';

type SettingsNavItem = {
    title: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
};

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { currentTeam } = usePage().props;

    const navItems: SettingsNavItem[] = [
        { title: 'Profile details', href: edit().url, icon: User },
        { title: 'Security & Password', href: editSecurity().url, icon: Shield },
        {
            title: 'Workspace info',
            href: currentTeam ? editTeam(currentTeam.slug).url : '#',
            icon: Briefcase,
        },
        { title: 'Public Lead Form', href: editLeadForm().url, icon: Link2 },
        { title: 'Appearance', href: editAppearance().url, icon: Sun },
    ];

    return (
        <div className="flex flex-1 flex-col px-[32px] py-[24px] max-[1024px]:px-[16px]">
            <h1 className="mb-[32px] text-[24px] font-bold text-bion-text">Settings</h1>

            <div className="flex gap-[32px] max-[1024px]:flex-col">
                <nav
                    className="sticky top-[24px] flex w-[240px] shrink-0 flex-col gap-[4px] max-[1024px]:static max-[1024px]:w-full max-[1024px]:flex-row max-[1024px]:overflow-x-auto max-[1024px]:border-b max-[1024px]:border-bion-border max-[1024px]:pb-[8px]"
                    aria-label="Settings"
                >
                    {navItems.map((item) => {
                        const active = isCurrentOrParentUrl(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex cursor-pointer items-center gap-[10px] rounded-[8px] px-[14px] py-[10px] text-[13.5px] font-medium whitespace-nowrap text-bion-text-muted [transition:all_0.12s_ease] hover:bg-bion-surface-raised hover:text-bion-text max-[1024px]:whitespace-nowrap',
                                    active && 'bg-bion-accent-soft! text-bion-accent!',
                                )}
                            >
                                <Icon className="h-[15px] w-[15px] shrink-0" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex min-w-0 max-w-[800px] flex-1 flex-col gap-[32px] pb-[60px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
