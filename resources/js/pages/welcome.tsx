import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Check,
    CreditCard,
    FolderKanban,
    Globe,
    Inbox,
    KanbanSquare,
    LayoutDashboard,
    Linkedin,
    Mail,
    MessageCircle,
    MessageSquare,
    ReceiptText,
    Sparkles,
    X,
} from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { dashboard, login, register } from '@/routes';

const landingStyles = `
    .fluid-transition {
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .app-reveal-container {
        perspective: 2000px;
    }

    .app-mockup {
        transform: rotateX(15deg) scale(0.9) translateY(40px);
        opacity: 0;
        transform-style: preserve-3d;
        transition:
            transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 1.2s ease-out;
        will-change: transform, opacity;
    }

    .app-mockup.revealed {
        transform: rotateX(0deg) scale(1) translateY(0);
        opacity: 1;
    }

    .fade-up {
        opacity: 0;
        transform: translateY(30px);
        transition:
            opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .fade-up.is-visible {
        opacity: 1;
        transform: translateY(0);
    }

    .delay-100 {
        transition-delay: 100ms;
    }

    .delay-200 {
        transition-delay: 200ms;
    }

    .delay-300 {
        transition-delay: 300ms;
    }

    .step-text {
        opacity: 0.3;
        transition: opacity 0.5s ease;
    }

    .step-text.is-active {
        opacity: 1;
    }

    .step-visual {
        position: absolute;
        inset: 0;
        opacity: 0;
        transform: scale(0.96) translateY(10px);
        transition:
            opacity 0.6s ease,
            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
    }

    .step-visual.is-active {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: auto;
        z-index: 10;
    }

    .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
    }

    .pill-dot {
        width: 6px;
        height: 6px;
        border-radius: 9999px;
    }

    .landing-scrollbar::-webkit-scrollbar {
        width: 4px;
    }

    .landing-scrollbar::-webkit-scrollbar-track {
        background: #0b0e14;
    }

    .landing-scrollbar::-webkit-scrollbar-thumb {
        background: #232838;
        border-radius: 9999px;
    }
`;

const pricingPlans = [
    {
        name: 'Core',
        description: 'For the solo freelancer establishing process.',
        price: 'Rp0',
        suffix: '/month',
        features: [
            '3 Active Projects',
            'Basic Proposal Editor',
            'Manual Invoice Tracking',
        ],
        cta: 'Create Free Account',
        highlighted: false,
    },
    {
        name: 'Professional',
        description: 'The complete suite for high-volume independents.',
        price: 'Rp79k',
        suffix: '/month',
        features: [
            'Unlimited Projects',
            'Profile Library AI Generation',
            'Custom Public Lead Form',
            'Automated Reminder Rules',
        ],
        cta: 'Upgrade to Pro',
        highlighted: true,
    },
] as const;

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const workspaceHref = currentTeam ? dashboard(currentTeam.slug) : login();
    const primaryCtaHref = auth.user ? workspaceHref : register();
    const year = new Date().getFullYear();

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        const rootHadDark = root.classList.contains('dark');
        const bodyHadDark = body.classList.contains('dark');
        const previousBodyBackgroundColor = body.style.backgroundColor;
        const previousBodyColor = body.style.color;

        root.classList.add('dark');
        body.classList.add('dark');
        body.style.backgroundColor = '#0b0e14';
        body.style.color = '#edeff3';

        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const mockup = document.querySelector<HTMLElement>('[data-app-mockup]');
        const fadeElements = Array.from(
            document.querySelectorAll<HTMLElement>('[data-fade-up]'),
        );
        const stepTriggers = Array.from(
            document.querySelectorAll<HTMLElement>('[data-step-trigger]'),
        );
        const stepVisuals = Array.from(
            document.querySelectorAll<HTMLElement>('[data-step-visual]'),
        );

        let activeStep = '1';
        let revealTimeout: number | null = null;
        let fadeObserver: IntersectionObserver | null = null;
        let scrollObserver: IntersectionObserver | null = null;

        const activateStep = (step: string): void => {
            activeStep = step;

            stepTriggers.forEach((trigger) => {
                const isActive = trigger.dataset.step === step;

                trigger.classList.toggle('is-active', isActive);
                trigger.classList.toggle('opacity-100', isActive);

                if (window.innerWidth >= 1024) {
                    trigger.classList.toggle('opacity-30', !isActive);
                }
            });

            stepVisuals.forEach((visual) => {
                visual.classList.toggle(
                    'is-active',
                    visual.dataset.step === step,
                );
            });
        };

        stepTriggers.forEach((trigger, index) => {
            trigger.classList.add('transition-opacity', 'duration-500');

            if (index === 0) {
                trigger.classList.add('is-active', 'opacity-100');
            } else {
                trigger.classList.add('opacity-30');
            }
        });

        if (mockup) {
            if (prefersReducedMotion) {
                mockup.style.transition = 'none';
                mockup.classList.add('revealed');
            } else {
                revealTimeout = window.setTimeout(() => {
                    mockup.classList.add('revealed');
                }, 100);
            }
        }

        if (prefersReducedMotion) {
            fadeElements.forEach((element) => {
                element.style.transition = 'none';
                element.classList.add('is-visible');
            });
        } else {
            fadeObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add('is-visible');
                        fadeObserver?.unobserve(entry.target);
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px',
                },
            );

            fadeElements.forEach((element) => {
                fadeObserver?.observe(element);
            });
        }

        scrollObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const step = entry.target.getAttribute('data-step');

                    if (step) {
                        activateStep(step);
                    }
                });
            },
            {
                rootMargin: '-40% 0px -40% 0px',
                threshold: 0,
            },
        );

        const syncStepObservers = (): void => {
            if (!scrollObserver) {
                return;
            }

            if (window.innerWidth >= 1024) {
                activateStep(activeStep);
                stepTriggers.forEach((trigger) => {
                    scrollObserver?.observe(trigger);
                });
            } else {
                stepTriggers.forEach((trigger) => {
                    scrollObserver?.unobserve(trigger);
                    trigger.classList.remove('opacity-30');
                    trigger.classList.add('opacity-100');
                });
            }
        };

        syncStepObservers();
        window.addEventListener('resize', syncStepObservers);

        return () => {
            if (!rootHadDark) {
                root.classList.remove('dark');
            }

            if (!bodyHadDark) {
                body.classList.remove('dark');
            }

            body.style.backgroundColor = previousBodyBackgroundColor;
            body.style.color = previousBodyColor;

            if (revealTimeout) {
                window.clearTimeout(revealTimeout);
            }

            fadeObserver?.disconnect();
            scrollObserver?.disconnect();
            window.removeEventListener('resize', syncStepObservers);
        };
    }, []);

    return (
        <>
            <Head title="Biondesk | The Independent's Command Center" />
            <style>{landingStyles}</style>

            <div className="landing-scrollbar dark min-h-screen scroll-smooth bg-bion-bg font-sans text-bion-text selection:bg-bion-accent selection:text-bion-accent-text">
                <header className="fixed top-0 z-50 w-full border-b border-bion-border/50 bg-bion-bg/60 backdrop-blur-xl">
                    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-6 items-center justify-center rounded-md border border-bion-border bg-bion-surface">
                                <div className="size-1.5 rounded-full bg-bion-accent" />
                            </div>
                            <span className="text-sm font-semibold tracking-wide text-bion-text">
                                Biondesk
                            </span>
                        </div>

                        <nav className="hidden items-center gap-8 md:flex">
                            <a
                                href="#platform"
                                className="fluid-transition text-xs font-medium text-bion-text-muted hover:text-bion-text"
                            >
                                Platform
                            </a>
                            <a
                                href="#workflow"
                                className="fluid-transition text-xs font-medium text-bion-text-muted hover:text-bion-text"
                            >
                                Workflow
                            </a>
                            <a
                                href="#pricing"
                                className="fluid-transition text-xs font-medium text-bion-text-muted hover:text-bion-text"
                            >
                                Pricing
                            </a>
                        </nav>

                        <div className="flex items-center gap-4">
                            {!auth.user ? (
                                <Link
                                    href={login()}
                                    className="fluid-transition hidden text-xs font-medium text-bion-text-muted hover:text-bion-text sm:block"
                                >
                                    Sign in
                                </Link>
                            ) : null}

                            <Link
                                href={primaryCtaHref}
                                className="fluid-transition inline-flex items-center rounded bg-bion-text px-4 py-1.5 text-xs font-semibold text-bion-bg hover:bg-bion-text-muted"
                            >
                                {auth.user ? 'Open Workspace' : 'Get Access'}
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="relative flex flex-col items-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
                    <div className="pointer-events-none absolute top-0 h-[600px] w-full bg-[radial-gradient(circle_at_50%_0%,rgba(232,163,61,0.08)_0%,transparent_60%)]" />

                    <div
                        data-fade-up
                        className="fade-up is-visible z-10 mx-auto max-w-4xl px-6 text-center"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-bion-border bg-bion-surface px-3 py-1">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bion-accent opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-bion-accent" />
                            </span>
                            <span className="text-[11px] font-medium tracking-widest text-bion-text uppercase">
                                Biondesk Core v1.0
                            </span>
                        </div>

                        <h1 className="mb-6 text-5xl leading-[1.05] font-bold tracking-tight text-bion-text md:text-7xl">
                            The independent&apos;s
                            <br />
                            <span className="text-bion-text-muted">
                                command center.
                            </span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-bion-text-muted md:text-xl">
                            Manage your entire cycle, from external leads and
                            active projects to proposals and final invoices,
                            without being locked to a single platform.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <Link
                                href={primaryCtaHref}
                                className="fluid-transition inline-flex items-center gap-2 rounded-lg bg-bion-accent px-8 py-3.5 text-sm font-semibold text-bion-accent-text shadow-bion-glow hover:opacity-90"
                            >
                                {auth.user
                                    ? 'Open your workspace'
                                    : 'Start your workspace'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="app-reveal-container z-20 mx-auto mt-20 w-full max-w-[1200px] px-4">
                        <div
                            data-app-mockup
                            className="app-mockup relative flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border border-bion-border bg-bion-bg shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)] md:h-[700px]"
                        >
                            <div className="flex h-12 shrink-0 items-center justify-between border-b border-bion-border bg-bion-surface px-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="size-3 rounded-full border border-bion-border bg-bion-surface-raised" />
                                        <div className="size-3 rounded-full border border-bion-border bg-bion-surface-raised" />
                                        <div className="size-3 rounded-full border border-bion-border bg-bion-surface-raised" />
                                    </div>
                                    <div className="h-4 w-px bg-bion-border" />
                                    <span className="text-xs font-medium text-bion-text-muted">
                                        <LayoutDashboard className="mr-1 inline size-3" />
                                        Studio Workflow
                                    </span>
                                </div>
                                <div className="hidden h-7 w-64 items-center rounded border border-bion-border bg-bion-bg px-3 text-xs text-bion-text-muted md:flex">
                                    Search commands...
                                    <span className="ml-auto rounded bg-bion-surface-raised px-1 font-mono text-[10px]">
                                        ⌘K
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                <div className="flex w-16 shrink-0 flex-col items-center gap-6 border-r border-bion-border bg-bion-surface py-4">
                                    <div className="flex size-8 items-center justify-center rounded-lg border border-bion-border bg-bion-surface-raised">
                                        <div className="size-2 rounded-full bg-bion-accent" />
                                    </div>

                                    <div className="flex w-full flex-col items-center gap-4 text-bion-text-muted">
                                        <Inbox className="size-5" />
                                        <div className="relative">
                                            <KanbanSquare className="size-5 text-bion-text" />
                                            <div className="absolute -top-1 -right-1 size-2 rounded-full bg-bion-accent" />
                                        </div>
                                        <FolderKanban className="size-5" />
                                        <ReceiptText className="size-5" />
                                    </div>
                                </div>

                                <div className="flex flex-1 gap-4 overflow-hidden bg-bion-bg p-6">
                                    <div className="flex w-[300px] shrink-0 flex-col">
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-sm font-semibold">
                                                Active Projects
                                            </span>
                                            <span className="font-mono text-xs text-bion-text-muted">
                                                2
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="rounded-lg border border-bion-border bg-bion-surface p-4">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <span className="text-sm font-medium">
                                                        Fintech Brand Identity
                                                    </span>
                                                    <StatusPill
                                                        className="bg-bion-accent/10 text-bion-accent"
                                                        dotClassName="bg-bion-accent"
                                                        label="In Progress"
                                                    />
                                                </div>
                                                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-bion-surface-raised">
                                                    <div className="h-full w-3/4 rounded-full bg-bion-accent" />
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-bion-text-muted">
                                                        Nexus Corp
                                                    </span>
                                                    <span className="font-mono font-medium text-bion-text">
                                                        $8,500
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-bion-border bg-bion-surface p-4 opacity-75">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <span className="text-sm font-medium">
                                                        E-commerce Backend
                                                    </span>
                                                    <StatusPill
                                                        className="border border-bion-danger/20 bg-bion-danger/10 text-bion-danger"
                                                        dotClassName="bg-bion-danger"
                                                        label="Blocked"
                                                    />
                                                </div>
                                                <div className="mb-4 flex items-center gap-2">
                                                    <MessageSquare className="size-3 text-bion-text-muted" />
                                                    <span className="text-[10px] text-bion-text-muted">
                                                        Awaiting API keys from
                                                        client
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-bion-text-muted">
                                                        Retail Co
                                                    </span>
                                                    <span className="font-mono font-medium text-bion-text">
                                                        $12,000
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex w-[300px] shrink-0 flex-col">
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-sm font-semibold">
                                                In Review
                                            </span>
                                            <span className="font-mono text-xs text-bion-text-muted">
                                                1
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="-translate-y-1 rounded-lg border border-bion-accent bg-bion-surface p-4 shadow-bion-raised">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <span className="text-sm font-medium">
                                                        Landing Page Redesign
                                                    </span>
                                                    <StatusPill
                                                        className="bg-bion-text/10 text-bion-text"
                                                        dotClassName="bg-bion-text"
                                                        label="In Review"
                                                    />
                                                </div>
                                                <div className="mb-4 flex items-center gap-2 rounded border border-bion-border bg-bion-bg p-2">
                                                    <div className="size-1.5 rounded-full bg-bion-danger" />
                                                    <span className="text-[10px] font-medium text-bion-text-muted">
                                                        1 Active Request Log
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-bion-text-muted">
                                                        Wayne Ent
                                                    </span>
                                                    <span className="font-mono font-medium text-bion-text">
                                                        $4,200
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-12 right-0 bottom-0 flex w-[400px] origin-right translate-x-4 scale-95 flex-col border-l border-bion-border bg-bion-surface opacity-90 shadow-2xl">
                                    <div className="flex items-center justify-between border-b border-bion-border p-5">
                                        <div>
                                            <div className="mb-1 text-[10px] tracking-wider text-bion-text-muted uppercase">
                                                Request Log
                                            </div>
                                            <h3 className="text-sm font-semibold">
                                                Landing Page Redesign
                                            </h3>
                                        </div>
                                        <X className="size-4 text-bion-text-muted" />
                                    </div>

                                    <div className="flex-1 space-y-4 overflow-y-auto p-5">
                                        <div className="rounded border border-bion-border bg-bion-bg p-3">
                                            <div className="mb-2 flex justify-between text-xs">
                                                <span className="font-medium">
                                                    Client Note
                                                </span>
                                                <span className="font-mono text-bion-text-muted">
                                                    Today, 09:41
                                                </span>
                                            </div>
                                            <p className="text-xs leading-relaxed text-bion-text-muted">
                                                &quot;Can we change the hero
                                                section color to match our new
                                                brand guidelines? Also, the logo
                                                needs to be slightly larger on
                                                mobile.&quot;
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="flex-1 rounded border border-bion-border bg-bion-surface-raised py-1.5 text-xs font-medium hover:text-bion-text"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 rounded bg-bion-text py-1.5 text-xs font-semibold text-bion-bg hover:bg-bion-text-muted"
                                            >
                                                Convert to Task
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <section
                    id="platform"
                    className="relative z-10 border-y border-bion-border bg-bion-surface py-32"
                >
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid items-center gap-16 lg:grid-cols-2">
                            <div data-fade-up className="fade-up">
                                <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                                    Built for the borderless independent.
                                </h2>
                                <p className="mb-8 text-lg leading-relaxed text-bion-text-muted">
                                    We don&apos;t care where you found your
                                    client or how they prefer to pay. Biondesk
                                    is platform-agnostic, giving you a
                                    centralized source of truth regardless of
                                    origin.
                                </p>

                                <ul className="space-y-6">
                                    <FeatureListItem
                                        icon={
                                            <Globe className="size-5 text-bion-text" />
                                        }
                                        title="Bring Your Own Pipeline"
                                        description="Log opportunities from Upwork, LinkedIn, or direct referrals. Create custom public forms that feed directly into your inbox."
                                    />
                                    <FeatureListItem
                                        icon={
                                            <CreditCard className="size-5 text-bion-text" />
                                        }
                                        title="Agnostic Invoicing"
                                        description="Bill in any currency. Provide your own Stripe link, Wise details, or bank transfer instructions. Track multiple partial payments per invoice."
                                    />
                                </ul>
                            </div>

                            <div
                                data-fade-up
                                className="fade-up relative h-[400px] overflow-hidden rounded-2xl border border-bion-border bg-bion-bg delay-200"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,163,61,0.08)_0%,transparent_60%)] opacity-50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute size-24 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-bion-accent/30" />
                                    <div className="absolute size-48 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-bion-accent/20" />

                                    <div className="relative z-10 flex size-16 items-center justify-center rounded-xl border border-bion-accent bg-bion-surface shadow-bion-glow">
                                        <div className="size-3 rounded-full bg-bion-accent" />
                                    </div>

                                    <div className="absolute top-1/4 left-1/4 flex size-10 items-center justify-center rounded-lg border border-bion-border bg-bion-surface-raised">
                                        <Mail className="size-4 text-bion-text-muted" />
                                    </div>
                                    <div className="absolute right-1/4 bottom-1/3 flex size-10 items-center justify-center rounded-lg border border-bion-border bg-bion-surface-raised">
                                        <MessageCircle className="size-4 text-bion-text-muted" />
                                    </div>
                                    <div className="absolute top-1/3 right-1/3 flex size-10 items-center justify-center rounded-lg border border-bion-border bg-bion-surface-raised">
                                        <Linkedin className="size-4 text-bion-text-muted" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="workflow"
                    className="relative border-b border-bion-border bg-bion-bg"
                >
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="relative flex flex-col lg:flex-row">
                            <div className="py-[20vh] lg:w-5/12 lg:py-[30vh]">
                                <div className="space-y-[30vh]">
                                    <WorkflowStep
                                        step="1"
                                        eyebrow="01 / Lead Capture"
                                        title="Capture without friction."
                                        description={
                                            <>
                                                Share your personal{' '}
                                                <code>
                                                    biondesk.com/p/your-name
                                                </code>{' '}
                                                link. Custom forms bypass the
                                                back-and-forth and drop highly
                                                qualified leads directly into
                                                your Opportunity board.
                                            </>
                                        }
                                    />
                                    <WorkflowStep
                                        step="2"
                                        eyebrow="02 / AI Proposal"
                                        title="Proposals that sound like you."
                                        description="Generate proposals instantly from discovery calls. Our AI doesn't use generic templates—it reads from your personal Profile Library of past portfolios and testimonials."
                                    />
                                    <WorkflowStep
                                        step="3"
                                        eyebrow="03 / Execution"
                                        title="Project management is core."
                                        description="Unlike other billing tools, task management isn't an afterthought here. Track project statuses, manage task breakdowns, and log ad-hoc client requests in one place."
                                    />
                                    <WorkflowStep
                                        step="4"
                                        eyebrow="04 / Billing"
                                        title="Get paid. Track everything."
                                        description="Convert accepted terms directly into invoices. Set automated rules for overdue reminders, and track deposits and final payments on the same document."
                                    />
                                </div>
                            </div>

                            <div className="relative hidden lg:block lg:w-7/12">
                                <div className="sticky top-0 flex h-screen items-center justify-center pl-12">
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-bion-border bg-bion-surface shadow-bion-raised">
                                        <div
                                            data-step-visual
                                            data-step="1"
                                            className="step-visual is-active flex flex-col bg-bion-bg"
                                        >
                                            <div className="flex h-10 shrink-0 items-center justify-center border-b border-bion-border bg-bion-surface px-4">
                                                <span className="text-xs text-bion-text-muted">
                                                    biondesk.com/p/studio
                                                </span>
                                            </div>
                                            <div className="flex flex-1 items-center justify-center p-8">
                                                <div className="w-full max-w-sm rounded-lg border border-bion-border bg-bion-surface p-6">
                                                    <div className="mb-4 size-12 rounded border border-bion-border bg-bion-surface-raised" />
                                                    <h4 className="mb-1 text-sm font-semibold">
                                                        Project Inquiry
                                                    </h4>
                                                    <p className="mb-6 text-[10px] text-bion-text-muted">
                                                        Let&apos;s build
                                                        something great
                                                        together.
                                                    </p>
                                                    <div className="space-y-3">
                                                        <div className="h-8 rounded border border-bion-border bg-bion-bg" />
                                                        <div className="h-20 rounded border border-bion-border bg-bion-bg" />
                                                        <div className="mt-4 flex h-8 items-center justify-center rounded bg-bion-accent">
                                                            <span className="text-[10px] font-bold text-bion-accent-text">
                                                                Submit Form
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            data-step-visual
                                            data-step="2"
                                            className="step-visual flex flex-col p-6"
                                        >
                                            <div className="mb-6 flex items-center gap-2">
                                                <Sparkles className="size-4 text-bion-accent" />
                                                <span className="text-sm font-semibold">
                                                    Generating Proposal...
                                                </span>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-1/3 space-y-2">
                                                    <div className="mb-2 text-[10px] text-bion-text-muted uppercase">
                                                        Sources
                                                    </div>
                                                    <div className="rounded border border-bion-border bg-bion-surface-raised p-2 text-xs text-bion-text-muted">
                                                        Discovery Call.txt
                                                    </div>
                                                    <div className="rounded border border-bion-border bg-bion-surface-raised p-2 text-xs text-bion-text-muted">
                                                        Profile: Web Portfolio
                                                    </div>
                                                </div>
                                                <div className="relative flex-1 overflow-hidden rounded border border-bion-border bg-bion-bg p-4">
                                                    <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-bion-bg" />
                                                    <div className="mb-3 h-3 w-1/2 rounded bg-bion-surface-raised" />
                                                    <div className="mb-2 h-2 w-full rounded bg-bion-surface-raised" />
                                                    <div className="mb-2 h-2 w-5/6 rounded bg-bion-surface-raised" />
                                                    <div className="mb-6 h-2 w-4/6 rounded bg-bion-surface-raised" />
                                                    <div className="mb-3 h-3 w-1/3 rounded bg-bion-surface-raised" />
                                                    <div className="mb-2 h-2 w-full rounded bg-bion-surface-raised" />
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            data-step-visual
                                            data-step="3"
                                            className="step-visual flex flex-col bg-bion-bg"
                                        >
                                            <div className="flex items-center justify-between border-b border-bion-border bg-bion-surface p-4">
                                                <span className="text-sm font-semibold">
                                                    Development Tasks
                                                </span>
                                                <StatusPill
                                                    className="bg-bion-accent/10 text-bion-accent"
                                                    dotClassName="bg-bion-accent"
                                                    label="Active"
                                                />
                                            </div>
                                            <div className="space-y-2 p-4">
                                                <TaskRow
                                                    icon={
                                                        <Check className="size-3 text-bion-success" />
                                                    }
                                                    iconWrapperClassName="border border-bion-success bg-bion-success/20"
                                                    label="Database Schema"
                                                    labelClassName="text-xs text-bion-text-muted line-through"
                                                    meta="Done"
                                                    metaClassName="text-bion-text-muted"
                                                />
                                                <TaskRow
                                                    icon={null}
                                                    iconWrapperClassName="border border-bion-border"
                                                    label="API Endpoints"
                                                    meta="In Progress"
                                                    metaClassName="text-bion-accent"
                                                />
                                                <TaskRow
                                                    icon={
                                                        <AlertCircle className="size-3 text-bion-danger" />
                                                    }
                                                    rowClassName="border-bion-danger/30 bg-bion-danger/5"
                                                    iconWrapperClassName="bg-bion-danger/20"
                                                    label="Client Request: Add SSO login"
                                                    labelClassName="text-xs text-bion-danger"
                                                    meta="Log"
                                                    metaClassName="text-bion-danger"
                                                />
                                            </div>
                                        </div>

                                        <div
                                            data-step-visual
                                            data-step="4"
                                            className="step-visual flex flex-col items-center justify-center bg-bion-surface p-8"
                                        >
                                            <div className="w-full max-w-sm rounded bg-white p-6 text-[#12161f] shadow-lg">
                                                <div className="mb-8 flex justify-between">
                                                    <div className="text-xl font-bold">
                                                        INVOICE
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-mono text-xs text-gray-500">
                                                            INV-0045
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">
                                                            Due: Aug 15, 2026
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-6 border-t border-gray-200 pt-4">
                                                    <div className="mb-2 flex justify-between text-xs">
                                                        <span>
                                                            Phase 1 Delivery
                                                        </span>
                                                        <span className="font-mono">
                                                            $2,000.00
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between border-t border-gray-200 pt-4">
                                                    <div className="flex items-center gap-2 rounded-full bg-[#1f8a5f]/10 px-2 py-1 text-[10px] font-bold text-[#1f8a5f]">
                                                        <div className="size-1.5 rounded-full bg-[#1f8a5f]" />
                                                        Fully Paid
                                                    </div>
                                                    <div className="font-mono text-xl font-bold">
                                                        $2,000.00
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="relative bg-bion-bg py-32">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2
                            data-fade-up
                            className="fade-up mb-4 text-3xl font-bold md:text-4xl"
                        >
                            Clear, independent pricing.
                        </h2>
                        <p
                            data-fade-up
                            className="fade-up mb-16 text-lg text-bion-text-muted delay-100"
                        >
                            Zero cuts taken from your client payments. You bring
                            your own payment methods.
                        </p>

                        <div
                            data-fade-up
                            className="fade-up grid gap-6 delay-200 md:grid-cols-2"
                        >
                            {pricingPlans.map((plan) => (
                                <article
                                    key={plan.name}
                                    className={
                                        plan.highlighted
                                            ? 'relative flex flex-col rounded-2xl border border-bion-accent bg-bion-surface p-8 text-left shadow-bion-glow'
                                            : 'flex flex-col rounded-2xl border border-bion-border bg-bion-surface p-8 text-left'
                                    }
                                >
                                    {plan.highlighted ? (
                                        <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-bion-accent px-3 py-1 text-[10px] font-bold tracking-widest text-bion-accent-text uppercase">
                                            Pro
                                        </div>
                                    ) : null}

                                    <h3
                                        className={
                                            plan.highlighted
                                                ? 'mb-2 text-lg font-semibold text-bion-accent'
                                                : 'mb-2 text-lg font-semibold'
                                        }
                                    >
                                        {plan.name}
                                    </h3>
                                    <p className="mb-8 text-xs text-bion-text-muted">
                                        {plan.description}
                                    </p>
                                    <div className="mb-8">
                                        <span className="font-mono text-4xl font-medium">
                                            {plan.price}
                                        </span>
                                        <span className="text-sm text-bion-text-muted">
                                            {plan.suffix}
                                        </span>
                                    </div>
                                    <ul className="mb-10 flex-1 space-y-4 text-sm">
                                        {plan.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-center gap-3"
                                            >
                                                <Check
                                                    className={
                                                        plan.highlighted
                                                            ? 'size-4 text-bion-text'
                                                            : 'size-4 text-bion-text-muted'
                                                    }
                                                />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={primaryCtaHref}
                                        className={
                                            plan.highlighted
                                                ? 'w-full rounded bg-bion-accent py-2.5 text-center text-sm font-semibold text-bion-accent-text transition-opacity hover:opacity-90'
                                                : 'w-full rounded border border-bion-border py-2.5 text-center text-sm font-semibold transition-colors hover:bg-bion-surface-raised'
                                        }
                                    >
                                        {plan.cta}
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="border-t border-bion-border bg-bion-surface py-12">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
                        <div className="flex items-center gap-3">
                            <div className="flex size-5 items-center justify-center rounded border border-bion-border bg-bion-surface-raised">
                                <div className="size-1 rounded-full bg-bion-accent" />
                            </div>
                            <span className="text-xs font-semibold text-bion-text">
                                Biondesk
                            </span>
                        </div>

                        <div className="flex gap-6 text-xs text-bion-text-muted">
                            <a
                                href="#"
                                className="transition-colors hover:text-bion-text"
                            >
                                Changelog
                            </a>
                            <a
                                href="#"
                                className="transition-colors hover:text-bion-text"
                            >
                                Twitter
                            </a>
                            <a
                                href="#"
                                className="transition-colors hover:text-bion-text"
                            >
                                Terms
                            </a>
                        </div>

                        <div className="font-mono text-[10px] text-bion-text-muted">
                            System OK - &copy; {year}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureListItem({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <li className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded border border-bion-border bg-bion-surface-raised">
                {icon}
            </div>
            <div>
                <h4 className="mb-1 text-sm font-semibold">{title}</h4>
                <p className="text-xs leading-relaxed text-bion-text-muted">
                    {description}
                </p>
            </div>
        </li>
    );
}

function WorkflowStep({
    step,
    eyebrow,
    title,
    description,
}: {
    step: string;
    eyebrow: string;
    title: string;
    description: ReactNode;
}) {
    return (
        <div
            data-step-trigger
            data-step={step}
            className="step-trigger step-text"
        >
            <div
                className={`mb-3 text-[10px] font-bold tracking-widest uppercase ${
                    step === '1' ? 'text-bion-accent' : 'text-bion-text'
                }`}
            >
                {eyebrow}
            </div>
            <h3 className="mb-4 text-3xl font-bold">{title}</h3>
            <p className="text-lg leading-relaxed text-bion-text-muted">
                {description}
            </p>
        </div>
    );
}

function StatusPill({
    className,
    dotClassName,
    label,
}: {
    className: string;
    dotClassName: string;
    label: string;
}) {
    return (
        <span className={`status-pill ${className}`}>
            <span className={`pill-dot ${dotClassName}`} />
            {label}
        </span>
    );
}

function TaskRow({
    rowClassName = 'border border-bion-border bg-bion-surface',
    iconWrapperClassName,
    icon,
    label,
    labelClassName = 'text-xs',
    meta,
    metaClassName,
}: {
    rowClassName?: string;
    iconWrapperClassName: string;
    icon: ReactNode;
    label: string;
    labelClassName?: string;
    meta: string;
    metaClassName: string;
}) {
    return (
        <div
            className={`flex items-center justify-between rounded p-3 ${rowClassName}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex size-4 items-center justify-center rounded ${iconWrapperClassName}`}
                >
                    {icon}
                </div>
                <span className={labelClassName}>{label}</span>
            </div>
            <span className={`font-mono text-[10px] ${metaClassName}`}>
                {meta}
            </span>
        </div>
    );
}
