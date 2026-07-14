import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Globe, ReceiptText, X } from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import FrontendNavbar from '@/components/frontend-navbar';
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

    .landing-scrollbar::-webkit-scrollbar {
        width: 4px;
    }

    .landing-scrollbar::-webkit-scrollbar-track {
        background: var(--bion-bg);
    }

    .landing-scrollbar::-webkit-scrollbar-thumb {
        background: var(--bion-border);
        border-radius: 9999px;
    }
`;

const landingImages = {
    hero: '/landing/dashboard.png',
    platform: '/landing/flow.png',
    lead: '/landing/lead-capture.png',
    proposal: '/landing/draft-proposal.png',
    execution: '/landing/project-execution.png',
    invoice: '/landing/invoice-tracking.png',
} as const;

const earlyAccessHighlights = [
    'Lead, proposal, project, task, invoice, and reminder workflow in one workspace.',
    'Invoices can include your own payment link, bank details, or payment instructions.',
    'Manual invoice status tracking for deposits, partial payments, and final payments.',
] as const;

const goodFitItems = [
    'Freelancers and small agencies who manage clients from inquiry to delivery.',
    'Service businesses that need a simple workspace for leads, proposals, projects, invoices, and follow-ups.',
    'Teams that already use their own payment link, bank transfer, Wise, Stripe, or other direct payment method.',
    'Operators who want visibility into invoice status without asking Biondesk to process the money.',
] as const;

const notFitItems = [
    'Teams that need Biondesk to collect, route, escrow, or automatically reconcile client payments.',
    'Large sales teams looking for a heavy enterprise CRM with complex sales operations.',
    'Businesses that only need accounting software and do not manage leads, projects, or client requests.',
    'Marketplaces that expect Biondesk to find clients or become the platform between you and the client.',
] as const;

const faqs = [
    {
        question: 'Does Biondesk process client payments?',
        answer: 'No. Your client pays you directly. Biondesk helps you create invoices, add your own payment link or bank instructions, and manually track the invoice status.',
    },
    {
        question: 'Can I add my own payment link to an invoice?',
        answer: 'Yes. You can include your own payment link, bank transfer details, or payment instructions so the client knows exactly how to pay you.',
    },
    {
        question: 'Is Biondesk mainly an invoicing product?',
        answer: 'No. Invoice tracking is part of the workflow, but the core idea is one workspace for lead capture, opportunities, proposals, projects, tasks, documents, reminders, and invoice follow-up.',
    },
    {
        question: 'Are paid plans available now?',
        answer: 'Not yet. Biondesk is currently positioned for early access, so interested users can start using it while the product direction is still being refined.',
    },
    {
        question: 'Who is building Biondesk?',
        answer: 'Biondesk is built by Hilmi Hidayat for independent operators who want a calmer way to run client work without stitching too many tools together.',
    },
] as const;

const siteUrl = 'https://biondesk.com';
const seoTitle = 'Biondesk | Workflow Workspace for Freelancers and Agencies';
const seoDescription =
    'Biondesk helps freelancers and small agencies manage client workflow from lead capture to proposals, projects, invoices, reminders, and manual payment tracking.';
const ogImageUrl = `${siteUrl}/landing/og-image.png`;
const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            name: 'Biondesk',
            url: siteUrl,
            founder: {
                '@type': 'Person',
                name: 'Hilmi Hidayat',
            },
        },
        {
            '@type': 'WebSite',
            name: 'Biondesk',
            url: siteUrl,
            description: seoDescription,
            potentialAction: {
                '@type': 'RegisterAction',
                target: `${siteUrl}/register`,
                name: 'Join Biondesk early access',
            },
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Biondesk',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            url: siteUrl,
            description: seoDescription,
            creator: {
                '@type': 'Person',
                name: 'Hilmi Hidayat',
            },
            audience: {
                '@type': 'Audience',
                audienceType: 'Freelancers and small agencies',
            },
            featureList: [
                'Lead capture',
                'Opportunity pipeline',
                'Proposal and quote management',
                'Project and task management',
                'Invoice creation',
                'Manual payment tracking',
                'Reminder workflow',
            ],
        },
        {
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                },
            })),
        },
    ],
} as const;

export default function Welcome() {
    const { auth, currentTeam } = usePage<any>().props;
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

        root.classList.remove('dark');
        body.classList.remove('dark');
        body.style.backgroundColor = '#f6f7f9';
        body.style.color = '#12161f';

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
            if (rootHadDark) {
                root.classList.add('dark');
            }

            if (bodyHadDark) {
                body.classList.add('dark');
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
            <Head title={seoTitle}>
                <meta name="description" content={seoDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={siteUrl} />

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Biondesk" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:url" content={siteUrl} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:image:secure_url" content={ogImageUrl} />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:width" content="1536" />
                <meta property="og:image:height" content="1024" />
                <meta
                    property="og:image:alt"
                    content="Biondesk workflow workspace preview"
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={ogImageUrl} />
                <meta
                    name="twitter:image:alt"
                    content="Biondesk workflow workspace preview"
                />

                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>
            <style>{landingStyles}</style>

            <div className="landing-scrollbar min-h-screen scroll-smooth bg-bion-bg font-sans text-bion-text selection:bg-bion-accent selection:text-bion-accent-text">
                <FrontendNavbar />

                <main className="relative flex flex-col items-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
                    <div className="pointer-events-none absolute top-0 h-[600px] w-full bg-[radial-gradient(circle_at_50%_0%,rgba(199,127,31,0.08)_0%,transparent_60%)]" />

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
                                Workflow-first workspace
                            </span>
                        </div>

                        <h1 className="mb-6 text-5xl leading-[1.05] font-bold tracking-tight text-bion-text md:text-7xl">
                            Your freelance workflow,
                            <br />
                            <span className="text-bion-text-muted">
                                from lead to invoice.
                            </span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-bion-text-muted md:text-xl">
                            Capture leads, draft proposals, run projects, send
                            invoices, and manually track payment status while
                            your client pays you directly.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <Link
                                href={primaryCtaHref}
                                className="fluid-transition inline-flex items-center gap-2 rounded-lg bg-bion-accent px-8 py-3.5 text-sm font-semibold text-bion-accent-text shadow-bion-glow hover:opacity-90"
                            >
                                {auth.user
                                    ? 'Open your workspace'
                                    : 'Join early access'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="app-reveal-container z-20 mx-auto mt-20 w-full max-w-[1200px] px-4">
                        <div
                            data-app-mockup
                            className="app-mockup relative aspect-video w-full overflow-hidden rounded-2xl border border-bion-border bg-bion-surface shadow-bion-panel"
                        >
                            <img
                                src={landingImages.hero}
                                alt="Biondesk dashboard preview showing the workflow workspace"
                                className="h-full w-full object-cover"
                                loading="eager"
                            />
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
                                    Built for independent workflows.
                                </h2>
                                <p className="mb-8 text-lg leading-relaxed text-bion-text-muted">
                                    Biondesk gives freelancers and small
                                    agencies one place to keep every client step
                                    moving, from inquiry and proposal to
                                    delivery, invoice follow-up, and manual
                                    payment tracking.
                                </p>

                                <ul className="space-y-6">
                                    <FeatureListItem
                                        icon={
                                            <Globe className="size-5 text-bion-text" />
                                        }
                                        title="Bring Your Own Pipeline"
                                        description="Log opportunities from Upwork, LinkedIn, direct referrals, or your public lead form. Everything lands in the same operating workspace."
                                    />
                                    <FeatureListItem
                                        icon={
                                            <ReceiptText className="size-5 text-bion-text" />
                                        }
                                        title="Invoice Tracking Without Payment Processing"
                                        description="Add your own payment link, bank details, or instructions to each invoice. Your client pays you directly, then you update the invoice status manually."
                                    />
                                </ul>
                            </div>

                            <div
                                data-fade-up
                                className="fade-up relative aspect-video overflow-hidden rounded-2xl border border-bion-border bg-bion-bg shadow-bion-raised delay-200"
                            >
                                <img
                                    src={landingImages.platform}
                                    alt="Biondesk workflow overview from lead capture to invoice tracking"
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
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
                            <div className="py-24 lg:w-5/12 lg:py-[30vh]">
                                <div className="space-y-24 lg:space-y-[30vh]">
                                    <WorkflowStep
                                        step="1"
                                        eyebrow="01 / Lead Capture"
                                        title="Capture without friction."
                                        description={
                                            <>
                                                Share your personal{' '}
                                                <code className="rounded border border-bion-border bg-bion-surface px-1.5 py-0.5 text-sm text-bion-text">
                                                    biondesk.com/p/your-name
                                                </code>{' '}
                                                link. Custom forms bypass the
                                                back-and-forth and drop
                                                qualified leads directly into
                                                your opportunity board.
                                            </>
                                        }
                                    />
                                    <WorkflowStep
                                        step="2"
                                        eyebrow="02 / Proposal Drafting"
                                        title="Turn inquiries into clear offers."
                                        description="Move from discovery notes to proposals and quotes without losing the client context that started the conversation."
                                    />
                                    <WorkflowStep
                                        step="3"
                                        eyebrow="03 / Project Execution"
                                        title="Keep delivery connected."
                                        description="Track project statuses, task breakdowns, client requests, and reminders in the same workspace where the opportunity began."
                                    />
                                    <WorkflowStep
                                        step="4"
                                        eyebrow="04 / Invoice Tracking"
                                        title="Invoice clearly. Track manually."
                                        description="Share invoices with your own payment link or bank instructions. Your client pays you directly, and Biondesk helps you record deposits, partial payments, and final status updates."
                                    />
                                </div>
                            </div>

                            <div className="relative hidden lg:block lg:w-7/12">
                                <div className="sticky top-0 flex h-screen items-center justify-center pl-12">
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-bion-border bg-bion-surface shadow-bion-raised">
                                        <WorkflowVisual
                                            step="1"
                                            src={landingImages.lead}
                                            alt="Biondesk lead capture workflow screen"
                                            isActive
                                        />
                                        <WorkflowVisual
                                            step="2"
                                            src={landingImages.proposal}
                                            alt="Biondesk proposal drafting workflow screen"
                                        />
                                        <WorkflowVisual
                                            step="3"
                                            src={landingImages.execution}
                                            alt="Biondesk project execution workflow screen"
                                        />
                                        <WorkflowVisual
                                            step="4"
                                            src={landingImages.invoice}
                                            alt="Biondesk invoice tracking workflow screen"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="founder"
                    className="relative border-b border-bion-border bg-bion-surface py-28"
                >
                    <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <div data-fade-up className="fade-up">
                            <div className="mb-4 inline-flex rounded-full border border-bion-border bg-bion-bg px-3 py-1 text-[10px] font-bold tracking-widest text-bion-text-muted uppercase">
                                Founder Note
                            </div>
                            <h2 className="text-3xl font-bold md:text-4xl">
                                A word from Hilmi.
                            </h2>
                        </div>

                        <blockquote
                            data-fade-up
                            className="fade-up rounded-2xl border border-bion-border bg-bion-bg p-8 shadow-bion-raised delay-100 md:p-10"
                        >
                            <p className="text-xl leading-relaxed font-medium text-bion-text md:text-2xl">
                                &quot;I am building Biondesk because client work
                                often breaks in the handoff between tools. A
                                lead starts in one place, the proposal lives
                                somewhere else, project tasks drift into chats,
                                and invoice follow-up becomes a manual memory
                                game. Biondesk is my attempt to make that
                                workflow calmer, clearer, and easier to run from
                                one workspace.&quot;
                            </p>
                            <footer className="mt-8 flex items-center gap-4 border-t border-bion-border pt-6">
                                <div className="flex size-11 items-center justify-center rounded-full border border-bion-border bg-bion-surface-raised text-sm font-bold text-bion-accent">
                                    HH
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-bion-text">
                                        Hilmi Hidayat
                                    </div>
                                    <div className="text-xs text-bion-text-muted">
                                        Founder of Biondesk
                                    </div>
                                </div>
                            </footer>
                        </blockquote>
                    </div>
                </section>

                <section id="fit" className="relative bg-bion-bg py-32">
                    <div className="mx-auto max-w-7xl px-6">
                        <div
                            data-fade-up
                            className="fade-up mx-auto mb-14 max-w-3xl text-center"
                        >
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Who it&apos;s for, and who it&apos;s not for.
                            </h2>
                            <p className="text-lg leading-relaxed text-bion-text-muted">
                                Biondesk is intentionally focused. It works best
                                when you want to run the full client workflow,
                                not when you want Biondesk to become a payment
                                processor or marketplace.
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <AudienceCard
                                title="Biondesk is for"
                                description="Independent operators who want one operating layer for client work."
                                items={goodFitItems}
                                icon="check"
                            />
                            <AudienceCard
                                title="Biondesk is not for"
                                description="Teams looking for payment custody, escrow, or enterprise-heavy sales software."
                                items={notFitItems}
                                icon="x"
                            />
                        </div>
                    </div>
                </section>

                <section
                    id="faq"
                    className="relative border-y border-bion-border bg-bion-surface py-32"
                >
                    <div className="mx-auto max-w-5xl px-6">
                        <div data-fade-up className="fade-up mb-14 max-w-2xl">
                            <div className="mb-4 inline-flex rounded-full border border-bion-border bg-bion-bg px-3 py-1 text-[10px] font-bold tracking-widest text-bion-text-muted uppercase">
                                FAQ
                            </div>
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Clear answers before you join.
                            </h2>
                            <p className="text-lg leading-relaxed text-bion-text-muted">
                                Especially around invoices and payments, the
                                product promise is simple: Biondesk supports
                                your workflow, while your client pays you
                                directly.
                            </p>
                        </div>

                        <div
                            data-fade-up
                            className="fade-up grid gap-4 delay-100"
                        >
                            {faqs.map((faq) => (
                                <FaqItem
                                    key={faq.question}
                                    question={faq.question}
                                    answer={faq.answer}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="early-access"
                    className="relative bg-bion-bg py-32"
                >
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2
                            data-fade-up
                            className="fade-up mb-4 text-3xl font-bold md:text-4xl"
                        >
                            Start with early access.
                        </h2>
                        <p
                            data-fade-up
                            className="fade-up mx-auto mb-12 max-w-2xl text-lg text-bion-text-muted delay-100"
                        >
                            Biondesk is opening for freelancers and small
                            agencies who want one workflow for leads, proposals,
                            projects, invoices, reminders, and manual payment
                            tracking.
                        </p>

                        <article
                            data-fade-up
                            className="fade-up rounded-2xl border border-bion-border bg-bion-surface p-8 text-left shadow-bion-raised delay-200 md:p-10"
                        >
                            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="mb-3 inline-flex rounded-full border border-bion-accent/30 bg-bion-accent/10 px-3 py-1 text-[10px] font-bold tracking-widest text-bion-accent uppercase">
                                        Early Access
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold">
                                        Workflow before billing plans.
                                    </h3>
                                    <p className="max-w-xl text-sm leading-relaxed text-bion-text-muted">
                                        We are not selling paid public plans
                                        yet. The focus is helping interested
                                        users run their client workflow from
                                        first inquiry to invoice follow-up.
                                    </p>
                                </div>

                                <Link
                                    href={primaryCtaHref}
                                    className="fluid-transition inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-bion-accent px-6 py-3 text-sm font-semibold text-bion-accent-text shadow-bion-glow hover:opacity-90"
                                >
                                    {auth.user
                                        ? 'Open workspace'
                                        : 'Join early access'}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>

                            <ul className="grid gap-4 md:grid-cols-3">
                                {earlyAccessHighlights.map((highlight) => (
                                    <li
                                        key={highlight}
                                        className="rounded-xl border border-bion-border bg-bion-bg p-4 text-sm leading-relaxed text-bion-text-muted"
                                    >
                                        <Check className="mb-4 size-4 text-bion-accent" />
                                        {highlight}
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-8 border-t border-bion-border pt-6 text-xs leading-relaxed text-bion-text-muted">
                                Biondesk does not process, route, or hold your
                                client payments. Bring your own payment link or
                                bank instructions, and let your client pay you
                                directly.
                            </p>
                        </article>
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

                        <p className="text-center text-xs text-bion-text-muted md:text-left">
                            Workflow workspace for freelancers and small
                            agencies.
                        </p>

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

function AudienceCard({
    title,
    description,
    items,
    icon,
}: {
    title: string;
    description: string;
    items: readonly string[];
    icon: 'check' | 'x';
}) {
    const isPositive = icon === 'check';

    return (
        <article
            data-fade-up
            className="fade-up rounded-2xl border border-bion-border bg-bion-surface p-8 shadow-bion-raised"
        >
            <div className="mb-8">
                <div
                    className={
                        isPositive
                            ? 'mb-4 inline-flex rounded-full border border-bion-accent/30 bg-bion-accent/10 px-3 py-1 text-[10px] font-bold tracking-widest text-bion-accent uppercase'
                            : 'mb-4 inline-flex rounded-full border border-bion-border bg-bion-bg px-3 py-1 text-[10px] font-bold tracking-widest text-bion-text-muted uppercase'
                    }
                >
                    {isPositive ? 'Good Fit' : 'Not The Focus'}
                </div>
                <h3 className="mb-3 text-2xl font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-bion-text-muted">
                    {description}
                </p>
            </div>

            <ul className="space-y-4">
                {items.map((item) => (
                    <li
                        key={item}
                        className="flex gap-3 text-sm leading-relaxed"
                    >
                        <span
                            className={
                                isPositive
                                    ? 'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-bion-accent/15 text-bion-accent'
                                    : 'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-bion-bg text-bion-text-muted'
                            }
                        >
                            {isPositive ? (
                                <Check className="size-3.5" />
                            ) : (
                                <X className="size-3.5" />
                            )}
                        </span>
                        <span className="text-bion-text-muted">{item}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <article className="rounded-2xl border border-bion-border bg-bion-bg p-6">
            <h3 className="mb-3 text-base font-semibold text-bion-text">
                {question}
            </h3>
            <p className="text-sm leading-relaxed text-bion-text-muted">
                {answer}
            </p>
        </article>
    );
}

function WorkflowVisual({
    step,
    src,
    alt,
    isActive = false,
}: {
    step: string;
    src: string;
    alt: string;
    isActive?: boolean;
}) {
    return (
        <div
            data-step-visual
            data-step={step}
            className={`step-visual bg-bion-bg ${isActive ? 'is-active' : ''}`}
        >
            <img
                src={src}
                alt={alt}
                className="h-full w-full object-cover"
                loading="lazy"
            />
        </div>
    );
}
