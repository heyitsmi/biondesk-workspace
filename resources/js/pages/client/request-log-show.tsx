import { Head, Link, useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { IconSprite, IconUse } from '@/components/biondesk/icon-sprite';
import { cn } from '@/lib/utils';
import { show as showClientPortal } from '@/routes/client-portal';
import { store as storeClientRequestMessage } from '@/routes/client-portal/request-messages';
import type {
    BiondeskTone,
    ClientPortalRequestShowPageProps,
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

type ReplyFormValues = {
    body: string;
    attachments: File[];
};

type FormErrors = Partial<Record<'body' | 'attachments', string>>;

export default function ClientRequestLogShowPage({
    portal,
    project,
    requestLog,
}: ClientPortalRequestShowPageProps) {
    const replyForm = useForm<ReplyFormValues>({
        body: '',
        attachments: [],
    });
    const replyErrors = replyForm.errors as FormErrors;
    const portalHref = showClientPortal({ contact: portal.portalToken }).url;

    const addReplyAttachments = (event: ChangeEvent<HTMLInputElement>): void => {
        replyForm.setData('attachments', [
            ...replyForm.data.attachments,
            ...Array.from(event.target.files ?? []),
        ]);
        event.target.value = '';
    };

    const removeReplyAttachment = (index: number): void => {
        replyForm.setData(
            'attachments',
            replyForm.data.attachments.filter((_file, fileIndex) => fileIndex !== index),
        );
    };

    const submitReply = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (replyForm.data.body.trim() === '') {
            return;
        }

        replyForm.post(
            storeClientRequestMessage({
                contact: portal.portalToken,
                project: project.id,
                requestLog: requestLog.id,
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => replyForm.reset(),
            },
        );
    };

    return (
        <>
            <Head title={`Request · ${project.title} - Biondesk`} />

            <div className="min-h-screen bg-bion-bg font-display text-[14px] text-bion-text antialiased">
                <IconSprite />

                <header className="sticky top-0 z-30 border-b border-bion-border bg-bion-surface">
                    <div className="mx-auto flex h-[60px] max-w-[1180px] items-center justify-between px-[18px]">
                        <Link href={portalHref} className="flex items-center gap-[10px]">
                            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-bion-border bg-bion-surface-raised">
                                <span className="h-[8px] w-[8px] rounded-full bg-bion-accent" />
                            </div>
                            <div>
                                <div className="text-[14px] font-semibold">{portal.teamName}</div>
                                <div className="text-[12px] text-bion-text-muted">Client Portal</div>
                            </div>
                        </Link>
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-bion-accent-soft text-[12px] font-bold text-bion-accent">
                            {portal.contact.initials}
                        </div>
                    </div>
                </header>

                <main className="mx-auto grid max-w-[1180px] gap-[20px] px-[18px] py-[28px] [grid-template-columns:minmax(0,1fr)_320px] max-[900px]:grid-cols-1">
                    <div className="min-w-0">
                        <div className="mb-[22px] flex flex-wrap items-start justify-between gap-[14px]">
                            <div>
                                <div className="mb-[8px] flex flex-wrap items-center gap-[8px] text-[12.5px] text-bion-text-muted">
                                    <Link href={portalHref} className="font-semibold text-bion-accent hover:underline">
                                        Portal
                                    </Link>
                                    <span>/</span>
                                    <span>{project.title}</span>
                                </div>
                                <h1 className="mb-[8px] text-[25px] font-semibold">Request Thread</h1>
                                <div className="flex flex-wrap items-center gap-[8px]">
                                    <StatusPill label={project.statusLabel} tone={project.tone} />
                                    <StatusPill label={requestLog.statusLabel} tone={requestLog.statusTone} />
                                </div>
                            </div>

                            <Link href={portalHref} className={BTN_GHOST}>
                                <IconUse icon="i-arrow-left" small={true} />
                                Back to Portal
                            </Link>
                        </div>

                        <div className="flex flex-col gap-[18px]">
                            <Panel title="Original Request">
                                <div className="mb-[12px] flex flex-wrap items-center gap-[10px] text-[12px] text-bion-text-muted">
                                    <span>{requestLog.projectTitle}</span>
                                    <span className="font-mono">{requestLog.createdAt}</span>
                                    <span>{requestLog.sourceLabel}</span>
                                </div>
                                <p className="whitespace-pre-line text-[14px] leading-[1.75]">{requestLog.text}</p>
                                <AttachmentLinks attachments={requestLog.attachments} />
                            </Panel>

                            <Panel title="Thread">
                                <div className="grid gap-[12px]">
                                    {requestLog.messages.map((message) => (
                                        <MessageItem key={message.id} message={message} />
                                    ))}
                                    {requestLog.messages.length === 0 ? (
                                        <EmptyState message="No replies yet." />
                                    ) : null}
                                </div>
                            </Panel>

                            <Panel title="Reply">
                                <form className="grid gap-[12px]" onSubmit={submitReply}>
                                    <div>
                                        <label className={FIELD_LABEL} htmlFor="reply-body">
                                            Message
                                        </label>
                                        <textarea
                                            id="reply-body"
                                            rows={5}
                                            className={cn(FIELD_INPUT, 'resize-y leading-[1.6]')}
                                            placeholder="Add a follow-up or answer for the team."
                                            value={replyForm.data.body}
                                            onChange={(event) => replyForm.setData('body', event.target.value)}
                                        />
                                        <FieldError message={replyErrors.body} />
                                    </div>
                                    <FilePicker
                                        files={replyForm.data.attachments}
                                        onAdd={addReplyAttachments}
                                        onRemove={removeReplyAttachment}
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
                                    <button type="submit" className={BTN_PRIMARY} disabled={replyForm.processing || replyForm.data.body.trim() === ''}>
                                        <IconUse icon="i-send" small={true} />
                                        {replyForm.processing ? 'Sending...' : 'Send Reply'}
                                    </button>
                                </form>
                            </Panel>
                        </div>
                    </div>

                    <aside className="h-fit rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[14px] flex items-center gap-[12px]">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-bion-accent-soft text-[14px] font-bold text-bion-accent">
                                {portal.contact.initials}
                            </div>
                            <div className="min-w-0">
                                <div className="truncate font-semibold">{portal.contact.name}</div>
                                <div className="truncate text-[12.5px] text-bion-text-muted">
                                    {portal.contact.email ?? 'No email on file'}
                                </div>
                            </div>
                        </div>
                        <dl className="grid gap-[12px] border-t border-bion-border pt-[14px]">
                            <MetaItem label="Project" value={project.title} />
                            <MetaItem label="Due" value={project.dueAt} />
                            <MetaItem label="Status" value={requestLog.statusLabel} />
                            <MetaItem label="Files" value={String(requestLog.attachments.length)} />
                            <MetaItem label="Replies" value={String(requestLog.messages.length)} />
                        </dl>
                    </aside>
                </main>
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

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-[12px] border border-bion-border bg-bion-surface">
            <div className="border-b border-bion-border px-[18px] py-[15px] text-[14.5px] font-semibold">
                {title}
            </div>
            <div className="p-[16px]">{children}</div>
        </section>
    );
}

function MessageItem({ message }: { message: ProjectRequestMessage }) {
    return (
        <div
            className={cn(
                'rounded-[10px] border border-bion-border p-[14px]',
                message.authorType === 'client' ? 'bg-bion-bg' : 'bg-bion-accent-soft',
            )}
        >
            <div className="mb-[8px] flex flex-wrap items-center justify-between gap-[8px] text-[12px] text-bion-text-muted">
                <span className="font-semibold text-bion-text">{message.authorLabel}</span>
                <span className="font-mono">{message.createdAt}</span>
            </div>
            <p className="whitespace-pre-line text-[13.5px] leading-[1.65]">{message.body}</p>
            <AttachmentLinks attachments={message.attachments} />
        </div>
    );
}

function AttachmentLinks({ attachments }: { attachments: ProjectAttachment[] }) {
    if (attachments.length === 0) {
        return null;
    }

    return (
        <div className="mt-[12px] grid gap-[7px]">
            {attachments.map((attachment, index) => (
                <a
                    key={`${attachment.name}-${index}`}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-[8px] rounded-[8px] border border-bion-border bg-bion-surface px-[10px] py-[8px] text-[12.5px] hover:border-bion-accent"
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
            <div className="mb-[8px] grid gap-[6px]">
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

function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="mb-[4px] text-[11px] uppercase text-bion-text-muted [letter-spacing:0.04em]">
                {label}
            </dt>
            <dd className="text-[13px] font-medium text-bion-text">{value}</dd>
        </div>
    );
}
