import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { dashboard, login, register } from '@/routes';

const navItems = [
    { section: 'platform', label: 'Platform' },
    { section: 'workflow', label: 'Workflow' },
    { href: '/blog', label: 'Insights' },
    { section: 'fit', label: 'Fit' },
    { section: 'faq', label: 'FAQ' },
    { section: 'early-access', label: 'Early Access' },
] as const;

export default function FrontendNavbar() {
    const page = usePage<any>();
    const { auth, currentTeam } = page.props;
    const workspaceHref = currentTeam ? dashboard(currentTeam.slug) : login();
    const primaryCtaHref = auth?.user ? workspaceHref : register();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isHomePage = page.url.split('?')[0] === '/';
    const sectionHref = (section: string): string =>
        `${isHomePage ? '' : '/'}#${section}`;
    const navHref = (item: (typeof navItems)[number]): string =>
        'href' in item ? item.href : sectionHref(item.section);

    return (
        <header className="fixed top-0 z-50 w-full border-b border-bion-border/50 bg-bion-bg/60 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex size-6 items-center justify-center rounded-md border border-bion-border bg-bion-surface">
                            <div className="size-1.5 rounded-full bg-bion-accent" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide text-bion-text">Biondesk</span>
                    </Link>
                </div>

                <nav className="hidden items-center gap-6 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={navHref(item)}
                            className="fluid-transition text-xs font-medium text-bion-text-muted hover:text-bion-text"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {!auth?.user ? (
                        <Link
                            href={login()}
                            className="fluid-transition hidden text-xs font-medium text-bion-text-muted hover:text-bion-text sm:block"
                        >
                            Sign in
                        </Link>
                    ) : null}

                    <Link
                        href={primaryCtaHref}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fluid-transition inline-flex items-center rounded bg-bion-text px-4 py-1.5 text-xs font-semibold text-bion-bg hover:bg-bion-text-muted"
                    >
                        {auth?.user ? 'Open Workspace' : 'Join Early Access'}
                    </Link>

                    <button
                        type="button"
                        className="fluid-transition inline-flex size-9 items-center justify-center rounded border border-bion-border bg-bion-surface text-bion-text-muted hover:text-bion-text md:hidden"
                        aria-controls="mobile-landing-menu"
                        aria-expanded={isMobileMenuOpen}
                        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        onClick={() => setIsMobileMenuOpen((v) => !v)}
                    >
                        {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                    </button>
                </div>
            </div>

            <div
                id="mobile-landing-menu"
                className={`border-t border-bion-border/50 bg-bion-bg/95 px-6 py-4 shadow-bion-raised backdrop-blur-xl md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
            >
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={navHref(item)}
                            className="fluid-transition rounded-lg px-3 py-3 text-sm font-medium text-bion-text-muted hover:bg-bion-surface hover:text-bion-text"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-4 grid gap-3 border-t border-bion-border pt-4">
                    {!auth?.user ? (
                        <Link
                            href={login()}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fluid-transition rounded-lg border border-bion-border px-4 py-3 text-center text-sm font-semibold text-bion-text hover:bg-bion-surface"
                        >
                            Sign in
                        </Link>
                    ) : null}

                    <Link
                        href={primaryCtaHref}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fluid-transition rounded-lg bg-bion-accent px-4 py-3 text-center text-sm font-semibold text-bion-accent-text shadow-bion-glow hover:opacity-90"
                    >
                        {auth?.user ? 'Open workspace' : 'Join early access'}
                    </Link>
                </div>
            </div>
        </header>
    );
}
