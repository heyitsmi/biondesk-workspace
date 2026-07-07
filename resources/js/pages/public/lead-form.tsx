import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
import { home } from '@/routes';
import type { PublicLeadFormPageProps } from '@/types';

export default function PublicLeadFormPage({
    team,
    hero,
    highlights,
}: PublicLeadFormPageProps) {
    return (
        <>
            <Head title={`${team.name} lead form`} />

            <div className="min-h-screen bg-bion-bg px-6 py-10 text-bion-text">
                <div className="mx-auto max-w-6xl">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 text-sm text-bion-text-muted transition-colors hover:text-bion-text"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Biondesk
                    </Link>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                        <section className="rounded-[1.75rem] border border-bion-border bg-bion-surface p-8 shadow-xs">
                            <div className="inline-flex items-center gap-2 rounded-full border border-bion-border bg-bion-surface-raised px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-bion-text uppercase">
                                <span className="size-2 rounded-full bg-bion-accent" />
                                {hero.bannerLabel}
                            </div>

                            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-bion-text">
                                {hero.title}
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-bion-text-muted">
                                {hero.description}
                            </p>

                            <div className="mt-8 space-y-3">
                                {highlights.map((highlight) => (
                                    <div
                                        key={highlight}
                                        className="rounded-2xl border border-bion-border bg-bion-surface-raised px-4 py-4 text-sm leading-6 text-bion-text-muted"
                                    >
                                        {highlight}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[1.75rem] border border-bion-border bg-bion-surface p-8 shadow-xs">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-bion-text-muted uppercase">
                                Future public inquiry form
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold text-bion-text">
                                /p/{team.slug}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-bion-text-muted">
                                This foundation page is intentionally read-only
                                for now. The next phase can add branded form
                                content, Turnstile verification, dedupe rules,
                                and actual Contact + Opportunity creation without
                                reworking the route or overall page structure.
                            </p>

                            <div className="mt-8 space-y-4">
                                {['Your name', 'Email address', 'What do you need help with?'].map(
                                    (label) => (
                                        <div key={label} className="space-y-2">
                                            <label className="text-sm font-medium text-bion-text-muted">
                                                {label}
                                            </label>
                                            <div className="rounded-2xl border border-bion-border bg-bion-surface-raised px-4 py-3 text-sm text-bion-text-muted">
                                                Placeholder input
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            <button
                                type="button"
                                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-bion-accent px-4 py-3 text-sm font-semibold text-bion-accent-text shadow-bion-glow opacity-90"
                            >
                                <Send className="size-4" />
                                Submission flow comes next
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
