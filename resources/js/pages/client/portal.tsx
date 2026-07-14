import { Head, Link, useForm } from '@inertiajs/react';
import type { InertiaForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { IconSprite, IconUse } from '@/components/biondesk/icon-sprite';
import { cn } from '@/lib/utils';
import { store as storeClientRequestMessage } from '@/routes/client-portal/request-messages';
import { store as storeClientRequest } from '@/routes/client-portal/requests';
import type {
    BiondeskTone,
    ClientPortalDocument,
    ClientPortalPageProps,
    ClientPortalProject,
    ClientPortalRequest,
    ClientPortalTask,
    ProjectAttachment,
    ProjectRequestMessage,
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

const BTN_GHOST =
    'inline-flex items-center justify-center gap-[7px] rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[8px] text-[12.5px] font-semibold text-bion-text hover:bg-bion-surface-raised';

const FIELD_LABEL =
    'mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]';

const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-surface px-[11px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none';

type RequestFormValues = {
    text: string;
    attachments: File[];
};

type ReplyFormValues = {
    body: string;
    attachments: File[];
};

type FormErrors = Partial<Record<'text' | 'body' | 'attachments', string>>;

export default function ClientPortalPage({ portal }: ClientPortalPageProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        portal.projects[0]?.id ?? null,
    );
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
        portal.requests[0]?.id ?? null,
    );

    const requestForm = useForm<RequestFormValues>({
        text: '',
        attachments: [],
    });
    const replyForm = useForm<ReplyFormValues>({
        body: '',
        attachments: [],
    });

    const selectedProject = useMemo(
        () =>
            portal.projects.find((project) => project.id === selectedProjectId) ??
            portal.projects[0] ??
            null,
        [portal.projects, selectedProjectId],
    );

    const selectedRequest = useMemo(
        () =>
            portal.requests.find((request) => request.id === selectedRequestId) ??
            portal.requests[0] ??
            null,
        [portal.requests, selectedRequestId],
    );

    const requestErrors = requestForm.errors as FormErrors;
    const replyErrors = replyForm.errors as FormErrors;

    const submitRequest = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!selectedProject || requestForm.data.text.trim() === '') {
            return;
        }

        requestForm.post(
            storeClientRequest({
                contact: portal.portalToken,
                project: selectedProject.id,
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => requestForm.reset(),
            },
        );
    };

    const submitReply = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!selectedProject || !selectedRequest || replyForm.data.body.trim() === '') {
            return;
        }

        replyForm.post(
            storeClientRequestMessage({
                contact: portal.portalToken,
                project: selectedProject.id,
                requestLog: selectedRequest.id,
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => replyForm.reset(),
            },
        );
    };

    const addRequestAttachments = (event: ChangeEvent<HTMLInputElement>): void => {
        requestForm.setData('attachments', [
            ...requestForm.data.attachments,
            ...Array.from(event.target.files ?? []),
        ]);
        event.target.value = '';
    };

    const addReplyAttachments = (event: ChangeEvent<HTMLInputElement>): void => {
        replyForm.setData('attachments', [
            ...replyForm.data.attachments,
            ...Array.from(event.target.files ?? []),
        ]);
        event.target.value = '';
    };

    return (
        <>
            <Head title={`${portal.contact.name} Portal - Biondesk`} />

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
                            <StatusPill label="Shared workspace" tone="accent" />
                        </div>

                        <div className="mb-[24px] grid grid-cols-3 gap-[14px] max-[760px]:grid-cols-1">
                            <StatCard label="Active Projects" value={portal.stats.activeProjects} icon="i-briefcase" />
                            <StatCard label="Documents" value={portal.stats.documents} icon="i-file" />
                            <StatCard label="Open Requests" value={portal.stats.openRequests} icon="i-message-circle" />
                        </div>

                        <div className="grid gap-[20px] [grid-template-columns:minmax(0,1.25fr)_minmax(360px,0.75fr)] max-[1100px]:grid-cols-1">
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
                                        <form className="flex flex-col gap-[14px]" onSubmit={submitRequest}>
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
                                                    rows={5}
                                                    className={cn(FIELD_INPUT, 'resize-y leading-[1.6]')}
                                                    placeholder="Write the request, revision, or note you want the team to track."
                                                    value={requestForm.data.text}
                                                    onChange={(event) => requestForm.setData('text', event.target.value)}
                                                />
                                                <FieldError message={requestErrors.text} />
                                            </div>
                                            <FilePicker
                                                files={requestForm.data.attachments}
                                                onAdd={addRequestAttachments}
                                                onRemove={(index) =>
                                                    requestForm.setData(
                                                        'attachments',
                                                        requestForm.data.attachments.filter((_, fileIndex) => fileIndex !== index),
                                                    )
                                                }
                                            />
                                            <FieldError message={requestErrors.attachments} />
                                            {requestForm.progress ? (
                                                <ProgressBar value={requestForm.progress.percentage ?? 0} />
                                            ) : null}
                                            {requestForm.wasSuccessful ? (
                                                <div className="rounded-[8px] bg-bion-success-soft px-[12px] py-[9px] text-[12.5px] text-bion-success">
                                                    Request submitted.
                                                </div>
                                            ) : null}
                                            <button type="submit" className={BTN_PRIMARY} disabled={requestForm.processing}>
                                                <IconUse icon="i-send" small={true} />
                                                {requestForm.processing ? 'Submitting...' : 'Submit Request'}
                                            </button>
                                        </form>
                                    ) : (
                                        <EmptyState message="A project is needed before requests can be submitted." />
                                    )}
                                </Panel>

                                <Panel title="Request Threads">
                                    {portal.requests.length > 0 ? (
                                        <div className="grid gap-[12px]">
                                            <div className="grid gap-[8px]">
                                                {portal.requests.map((request) => (
                                                    <RequestThreadButton
                                                        key={request.id}
                                                        request={request}
                                                        active={selectedRequest?.id === request.id}
                                                        onSelect={() => setSelectedRequestId(request.id)}
                                                    />
                                                ))}
                                            </div>

                                            {selectedRequest ? (
                                                <ThreadDetail
                                                    request={selectedRequest}
                                                    replyForm={replyForm}
                                                    replyErrors={replyErrors}
                                                    onSubmit={submitReply}
                                                    onAddAttachments={addReplyAttachments}
                                                    onRemoveAttachment={(index) =>
                                                        replyForm.setData(
                                                            'attachments',
                                                            replyForm.data.attachments.filter((_, fileIndex) => fileIndex !== index),
                                                        )
                                                    }
                                                />
                                            ) : null}
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

function RequestThreadButton({
    request,
    active,
    onSelect,
}: {
    request: ClientPortalRequest;
    active: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            className={cn(
                'rounded-[10px] border border-bion-border bg-bion-bg p-[12px] text-left hover:border-bion-accent',
                active && 'border-bion-accent',
            )}
            onClick={onSelect}
        >
            <div className="mb-[8px] flex items-center justify-between gap-[10px]">
                <span className="min-w-0 truncate text-[12px] font-medium text-bion-text-muted">
                    {request.projectTitle}
                </span>
                <StatusPill label={request.statusLabel} tone={request.statusTone} />
            </div>
            <div className="line-clamp-2 text-[13px] leading-[1.5]">{request.text}</div>
            <div className="mt-[8px] flex flex-wrap items-center gap-[8px] text-[11.5px] text-bion-text-muted">
                <span className="font-mono">{request.createdAt}</span>
                {request.attachments.length > 0 ? <span>{request.attachments.length} files</span> : null}
                {request.messages.length > 0 ? <span>{request.messages.length} replies</span> : null}
            </div>
        </button>
    );
}

function ThreadDetail({
    request,
    replyForm,
    replyErrors,
    onSubmit,
    onAddAttachments,
    onRemoveAttachment,
}: {
    request: ClientPortalRequest;
    replyForm: InertiaForm<ReplyFormValues>;
    replyErrors: FormErrors;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onAddAttachments: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemoveAttachment: (index: number) => void;
}) {
    return (
        <div className="rounded-[10px] border border-bion-border bg-bion-bg p-[12px]">
            <div className="mb-[12px] flex flex-wrap items-center justify-between gap-[8px]">
                <div className="text-[12px] font-semibold">Thread</div>
                <StatusPill label={request.statusLabel} tone={request.statusTone} />
            </div>

            <div className="mb-[12px] rounded-[9px] border border-bion-border bg-bion-surface p-[12px]">
                <div className="mb-[8px] flex flex-wrap items-center justify-between gap-[8px] text-[12px] text-bion-text-muted">
                    <span>{request.projectTitle}</span>
                    <span className="font-mono">{request.createdAt}</span>
                </div>
                <p className="whitespace-pre-line text-[13px] leading-[1.6]">{request.text}</p>
                <AttachmentLinks attachments={request.attachments} />
            </div>

            <div className="mb-[12px] grid gap-[10px]">
                {request.messages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                ))}
                {request.messages.length === 0 ? (
                    <div className="text-[12.5px] text-bion-text-muted">
                        No replies yet.
                    </div>
                ) : null}
            </div>

            <form className="grid gap-[10px]" onSubmit={onSubmit}>
                <div>
                    <label className={FIELD_LABEL} htmlFor="reply-body">
                        Reply
                    </label>
                    <textarea
                        id="reply-body"
                        rows={4}
                        className={cn(FIELD_INPUT, 'resize-y leading-[1.6]')}
                        placeholder="Add a follow-up or answer for the team."
                        value={replyForm.data.body}
                        onChange={(event) => replyForm.setData('body', event.target.value)}
                    />
                    <FieldError message={replyErrors.body} />
                </div>
                <FilePicker
                    files={replyForm.data.attachments}
                    onAdd={onAddAttachments}
                    onRemove={onRemoveAttachment}
                />
                <FieldError message={replyErrors.attachments} />
                {replyForm.progress ? (
                    <ProgressBar value={replyForm.progress.percentage ?? 0} />
                ) : null}
                {replyForm.wasSuccessful ? (
                    <div className="rounded-[8px] bg-bion-success-soft px-[12px] py-[9px] text-[12.5px] text-bion-success">
                        Reply sent.
                    </div>
                ) : null}
                <button type="submit" className={BTN_PRIMARY} disabled={replyForm.processing}>
                    <IconUse icon="i-send" small={true} />
                    {replyForm.processing ? 'Sending...' : 'Send Reply'}
                </button>
            </form>
        </div>
    );
}

function MessageItem({ message }: { message: ProjectRequestMessage }) {
    return (
        <div
            className={cn(
                'rounded-[9px] border border-bion-border p-[12px]',
                message.authorType === 'client' ? 'bg-bion-surface' : 'bg-bion-accent-soft',
            )}
        >
            <div className="mb-[8px] flex flex-wrap items-center justify-between gap-[8px] text-[12px] text-bion-text-muted">
                <span>{message.authorLabel}</span>
                <span className="font-mono">{message.createdAt}</span>
            </div>
            <p className="whitespace-pre-line text-[13px] leading-[1.6]">{message.body}</p>
            <AttachmentLinks attachments={message.attachments} />
        </div>
    );
}

function AttachmentLinks({ attachments }: { attachments: ProjectAttachment[] }) {
    if (attachments.length === 0) {
        return null;
    }

    return (
        <div className="mt-[10px] flex flex-col gap-[6px]">
            {attachments.map((attachment, index) => (
                <a
                    key={`${attachment.name}-${index}`}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-[7px] rounded-[7px] border border-bion-border bg-bion-surface px-[9px] py-[7px] text-[12px] hover:border-bion-accent"
                >
                    <IconUse icon="i-paperclip" small={true} />
                    <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                </a>
            ))}
        </div>
    );
}

function FilePicker({
    files,
    onAdd,
    onRemove,
}: {
    files: File[];
    onAdd: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
}) {
    return (
        <div>
            <label className={FIELD_LABEL}>Attachments</label>
            <div className="mb-[8px] flex flex-col gap-[6px]">
                {files.map((file, index) => (
                    <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-[8px] rounded-[7px] border border-bion-border bg-bion-surface px-[10px] py-[7px] text-[12.5px]"
                    >
                        <IconUse icon="i-paperclip" small={true} />
                        <span className="min-w-0 flex-1 truncate">{file.name}</span>
                        <button
                            type="button"
                            className="text-bion-text-muted hover:text-bion-danger"
                            onClick={() => onRemove(index)}
                        >
                            <IconUse icon="i-x" small={true} />
                        </button>
                    </div>
                ))}
            </div>
            <label className={BTN_GHOST}>
                <IconUse icon="i-paperclip" small={true} />
                Add files
                <input type="file" multiple className="hidden" onChange={onAdd} />
            </label>
        </div>
    );
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="h-[6px] overflow-hidden rounded-full bg-bion-surface-raised">
            <div className="h-full rounded-full bg-bion-accent" style={{ width: `${value}%` }} />
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    return message ? (
        <div className="mt-[6px] text-[12px] text-bion-danger">{message}</div>
    ) : null;
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-[10px] border border-dashed border-bion-border bg-bion-bg px-[16px] py-[24px] text-[13px] text-bion-text-muted">
            {message}
        </div>
    );
}
