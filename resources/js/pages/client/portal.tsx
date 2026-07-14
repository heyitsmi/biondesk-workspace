import { Form, Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { IconSprite, IconUse } from '@/components/biondesk/icon-sprite';
import { cn } from '@/lib/utils';
import { store as storeClientRequest } from '@/routes/client-portal/requests';
import type {
    BiondeskTone,
    ClientPortalDocument,
    ClientPortalPageProps,
    ClientPortalProject,
    ClientPortalRequest,
    ClientPortalTask,
} from '@/types';

const PILL_BASE =
    'inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-medium whitespace-nowrap';

const toneClassMap: Record<BiondeskTone, string> = {
    accent: cn(PILL_BASE, 'bg-bion-accent-soft text-bion-accent'),
    success: cn(PILL_BASE, 'bg-bion-success-soft text-bion-success'),
    danger: cn(PILL_BASE, 'bg-bion-danger-soft text-bion-danger'),
    muted: cn(PILL_BASE, 'border border-bion-border bg-bion-surface-raised text-bion-text-muted'),
};

const toneDotMap: Record<BiondeskTone, string> = {
    accent: 'bg-bion-accent',
    success: 'bg-bion-success',
    danger: 'bg-bion-danger',
    muted: 'bg-bion-text-muted',
};

const BTN_PRIMARY =
    'inline-flex items-center justify-center gap-[7px] rounded-[8px] bg-bion-accent px-[14px] py-[9px] text-[13.5px] font-semibold text-bion-accent-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:opacity-[0.88] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

const FIELD_LABEL =
    'mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]';

const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-surface px-[11px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none';

export default function ClientPortalPage({ portal }: ClientPortalPageProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        portal.projects[0]?.id ?? null,
    );

    const selectedProject = useMemo(
        () =>
            portal.projects.find((project) => project.id === selectedProjectId) ??
            portal.projects[0] ??
            null,
        [portal.projects, selectedProjectId],
    );

    const requestAction = selectedProject
        ? storeClientRequest({
              contact: portal.portalToken,
              project: selectedProject.id,
          }).url
        : '#';

    return (
        <>
            <Head title={`${portal.contact.name} Portal — Biondesk`} />

            <div className="min-h-screen bg-bion-bg font-display text-[14px] text-bion-text antialiased">
                <IconSprite />

                <header className="sticky top-0 z-30 hidden h-[60px] items-center justify-between border-b border-bion-border bg-bion-surface px-[18px] max-[760px]:flex">
                    <div className="flex items-center gap-[10px]">
                        <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] border border-bion-border bg-bion-surface-raised">
                            <span className="h-[8px] w-[8px] rounded-full bg-bion-accent" />
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold">
                                {portal.teamName}
                            </div>
                            <div className="text-[12px] text-bion-text-muted">
                                Client Portal
                            </div>
                        </div>
                    </div>
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-bion-accent-soft text-[12px] font-bold text-bion-accent">
                        {portal.contact.initials}
                    </div>
                </header>

                <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-[280px_1fr] max-[1024px]:grid-cols-[240px_1fr] max-[760px]:block">
                    <aside className="sticky top-0 flex h-screen flex-col border-r border-bion-border bg-bion-surface px-[18px] py-[20px] max-[760px]:hidden">
                        <Link href="/" className="mb-[28px] flex items-center gap-[10px]">
                            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-bion-border bg-bion-surface-raised">
                                <span className="h-[8px] w-[8px] rounded-full bg-bion-accent" />
                            </div>
                            <div>
                                <div className="text-[15px] font-semibold">
                                    {portal.teamName}
                                </div>
                                <div className="text-[12px] text-bion-text-muted">
                                    Client Portal
                                </div>
                            </div>
                        </Link>

                        <div className="mb-[22px] rounded-[12px] border border-bion-border bg-bion-bg p-[14px]">
                            <div className="mb-[12px] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-bion-accent-soft text-[16px] font-bold text-bion-accent">
                                {portal.contact.initials}
                            </div>
                            <div className="mb-[3px] font-semibold">
                                {portal.contact.name}
                            </div>
                            <div className="text-[12.5px] text-bion-text-muted">
                                {portal.contact.email ?? 'No email on file'}
                            </div>
                        </div>

                        <div className="mb-[8px] px-[2px] text-[11px] uppercase [letter-spacing:0.06em] text-bion-text-muted">
                            Projects
                        </div>
                        <div className="flex flex-col gap-[4px]">
                            {portal.projects.map((project) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    className={cn(
                                        'flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-left text-[13px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text',
                                        selectedProject?.id === project.id &&
                                            'bg-bion-accent-soft text-bion-accent',
                                    )}
                                    onClick={() => setSelectedProjectId(project.id)}
                                >
                                    <IconUse icon="i-briefcase" small={true} />
                                    <span className="min-w-0 flex-1 truncate">
                                        {project.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <main className="min-w-0 px-[32px] py-[28px] max-[1024px]:px-[22px] max-[760px]:px-[16px] max-[760px]:py-[20px]">
                        <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
                            <div>
                                <div className="mb-[6px] flex items-center gap-[8px] text-[12.5px] font-medium text-bion-text-muted">
                                    <IconUse icon="i-users" small={true} />
                                    {portal.contact.company ?? portal.contact.fullName}
                                </div>
                                <h1 className="text-[24px] font-semibold">
                                    Welcome, {portal.contact.fullName}
                                </h1>
                            </div>
                            <span className={toneClassMap.accent}>
                                <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap.accent)} />
                                Shared workspace
                            </span>
                        </div>

                        <div className="mb-[24px] grid grid-cols-3 gap-[14px] max-[760px]:grid-cols-1">
                            <StatCard label="Active Projects" value={portal.stats.activeProjects} icon="i-briefcase" />
                            <StatCard label="Documents" value={portal.stats.documents} icon="i-file" />
                            <StatCard label="Requests" value={portal.stats.openRequests} icon="i-message-circle" />
                        </div>

                        <div className="grid gap-[20px] [grid-template-columns:minmax(0,1.4fr)_minmax(320px,0.8fr)] max-[1100px]:grid-cols-1">
                            <div className="flex flex-col gap-[20px]">
                                <Panel title="Projects">
                                    {portal.projects.length > 0 ? (
                                        <div className="grid gap-[12px]">
                                            {portal.projects.map((project) => (
                                                <ProjectCard
                                                    key={project.id}
                                                    project={project}
                                                    active={selectedProject?.id === project.id}
                                                    onSelect={() => setSelectedProjectId(project.id)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState message="No shared projects yet." />
                                    )}
                                </Panel>

                                <Panel title="Documents">
                                    {portal.documents.length > 0 ? (
                                        <div className="grid gap-[10px]">
                                            {portal.documents.map((document) => (
                                                <DocumentRow key={document.id} document={document} />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState message="No shared documents yet." />
                                    )}
                                </Panel>
                            </div>

                            <div className="flex flex-col gap-[20px]">
                                <Panel title="Submit a Request">
                                    {selectedProject ? (
                                        <Form
                                            action={requestAction}
                                            method="post"
                                            resetOnSuccess={['text']}
                                            className="flex flex-col gap-[14px]"
                                        >
                                            {({ errors, processing, wasSuccessful }) => (
                                                <>
                                                    <div>
                                                        <label className={FIELD_LABEL} htmlFor="project-picker">
                                                            Project
                                                        </label>
                                                        <select
                                                            id="project-picker"
                                                            className={FIELD_INPUT}
                                                            value={selectedProject.id}
                                                            onChange={(event) =>
                                                                setSelectedProjectId(Number(event.target.value))
                                                            }
                                                        >
                                                            {portal.projects.map((project) => (
                                                                <option key={project.id} value={project.id}>
                                                                    {project.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={FIELD_LABEL} htmlFor="request-text">
                                                            Request or revision
                                                        </label>
                                                        <textarea
                                                            id="request-text"
                                                            name="text"
                                                            rows={5}
                                                            className={cn(FIELD_INPUT, 'resize-y leading-[1.6]')}
                                                            placeholder="Write the request, revision, or note you want the team to track."
                                                        />
                                                        {errors.text ? (
                                                            <div className="mt-[6px] text-[12px] text-bion-danger">
                                                                {errors.text}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    {wasSuccessful ? (
                                                        <div className="rounded-[8px] bg-bion-success-soft px-[12px] py-[9px] text-[12.5px] text-bion-success">
                                                            Request submitted.
                                                        </div>
                                                    ) : null}
                                                    <button type="submit" className={BTN_PRIMARY} disabled={processing}>
                                                        <IconUse icon="i-send" small={true} />
                                                        {processing ? 'Submitting...' : 'Submit Request'}
                                                    </button>
                                                </>
                                            )}
                                        </Form>
                                    ) : (
                                        <EmptyState message="A project is needed before requests can be submitted." />
                                    )}
                                </Panel>

                                <Panel title="Recent Requests">
                                    {portal.requests.length > 0 ? (
                                        <div className="flex flex-col gap-[12px]">
                                            {portal.requests.map((request) => (
                                                <RequestItem key={request.id} request={request} />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState message="No client-visible requests yet." />
                                    )}
                                </Panel>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

function StatusPill({ label, tone }: { label: string; tone: BiondeskTone }) {
    return (
        <span className={toneClassMap[tone]}>
            <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[tone])} />
            {label}
        </span>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
    return (
        <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[18px]">
            <div className="mb-[12px] flex items-center justify-between">
                <span className="text-[12px] font-medium uppercase [letter-spacing:0.04em] text-bion-text-muted">
                    {label}
                </span>
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-bion-border bg-bion-surface-raised text-bion-accent">
                    <IconUse icon={icon} small={true} />
                </div>
            </div>
            <div className="font-mono text-[26px] font-semibold">{value}</div>
        </div>
    );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-[12px] border border-bion-border bg-bion-surface">
            <div className="border-b border-bion-border px-[18px] py-[15px] text-[14.5px] font-semibold">
                {title}
            </div>
            <div className="p-[14px]">{children}</div>
        </section>
    );
}

function ProjectCard({
    project,
    active,
    onSelect,
}: {
    project: ClientPortalProject;
    active: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            className={cn(
                'w-full rounded-[10px] border border-bion-border bg-bion-bg p-[14px] text-left [transition:border-color_0.12s_ease,transform_0.12s_ease] hover:-translate-y-[1px] hover:border-bion-accent',
                active && 'border-bion-accent',
            )}
            onClick={onSelect}
        >
            <div className="mb-[10px] flex flex-wrap items-start justify-between gap-[10px]">
                <div>
                    <h2 className="mb-[4px] text-[15px] font-semibold">{project.title}</h2>
                    <div className="font-mono text-[12px] text-bion-text-muted">
                        Due {project.dueAt}
                    </div>
                </div>
                <StatusPill label={project.statusLabel} tone={project.tone} />
            </div>
            <div className="mb-[12px] h-[6px] overflow-hidden rounded-full bg-bion-surface-raised">
                <div className="h-full rounded-full bg-bion-accent" style={{ width: `${project.progress}%` }} />
            </div>
            <div className="grid gap-[8px]">
                {project.tasks.slice(0, 4).map((task) => (
                    <TaskRow key={task.id} task={task} />
                ))}
                {project.tasks.length === 0 ? (
                    <div className="text-[12.5px] text-bion-text-muted">
                        No shared tasks yet.
                    </div>
                ) : null}
            </div>
        </button>
    );
}

function TaskRow({ task }: { task: ClientPortalTask }) {
    return (
        <div className="flex items-center justify-between gap-[10px] rounded-[8px] border border-bion-border bg-bion-surface px-[10px] py-[8px]">
            <span className="min-w-0 truncate text-[13px]">{task.title}</span>
            <StatusPill label={task.statusLabel} tone={task.tone} />
        </div>
    );
}

function DocumentRow({ document }: { document: ClientPortalDocument }) {
    return (
        <a
            href={document.url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-wrap items-center justify-between gap-[12px] rounded-[10px] border border-bion-border bg-bion-bg p-[14px] hover:border-bion-accent"
        >
            <div className="min-w-0">
                <div className="mb-[4px] flex flex-wrap items-center gap-[8px]">
                    <span className="font-mono text-[13px] font-semibold">
                        {document.number}
                    </span>
                    <span className="text-[12px] text-bion-text-muted">
                        {document.kindLabel}
                    </span>
                </div>
                <div className="truncate text-[13.5px] font-medium">
                    {document.title}
                </div>
            </div>
            <div className="flex items-center gap-[12px]">
                <StatusPill label={document.statusLabel} tone={document.tone} />
                <span className="font-mono text-[14px] font-semibold">
                    {document.amount}
                </span>
            </div>
        </a>
    );
}

function RequestItem({ request }: { request: ClientPortalRequest }) {
    return (
        <div className="rounded-[10px] border border-bion-border bg-bion-bg p-[12px]">
            <div className="mb-[8px] flex flex-wrap items-center justify-between gap-[8px] text-[12px] text-bion-text-muted">
                <span>{request.projectTitle}</span>
                <span className="font-mono">{request.createdAt}</span>
            </div>
            <p className="whitespace-pre-line text-[13px] leading-[1.6] text-bion-text">
                {request.text}
            </p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-[10px] border border-dashed border-bion-border bg-bion-bg px-[16px] py-[24px] text-[13px] text-bion-text-muted">
            {message}
        </div>
    );
}
