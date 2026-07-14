import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { show as projectShow } from '@/routes/projects';
import { store as storeRequestLogMessage } from '@/routes/projects/request-logs/messages';
import type {
    BiondeskTone,
    ProjectAttachment,
    ProjectRequestMessage,
    RequestLogDetailPageProps,
} from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center justify-center gap-[7px] rounded-[8px] px-[14px] py-[9px] text-[13px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised');

const FIELD_LABEL =
    'mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[10px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none';

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

const requestClassMap = {
    new: 'bg-bion-accent-soft text-bion-accent',
    duplicate: 'border border-bion-border bg-bion-surface-raised text-bion-text-muted',
    related: 'border border-bion-border bg-bion-surface-raised text-bion-text-muted',
    contradiction: 'bg-bion-danger-soft text-bion-danger',
};

type ReplyFormValues = {
    body: string;
    attachments: File[];
};

type ReplyFormErrors = Partial<Record<'body' | 'attachments', string>>;

function AttachmentList({ attachments }: { attachments: ProjectAttachment[] }) {
    if (attachments.length === 0) {
        return (
            <div className="rounded-[10px] border border-dashed border-bion-border bg-bion-bg p-[14px] text-[13px] text-bion-text-muted">
                No attachments.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-[8px]">
            {attachments.map((attachment, index) => (
                <a
                    key={`${attachment.name}-${index}`}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center gap-[9px] rounded-[9px] border border-bion-border bg-bion-bg px-[12px] py-[10px] text-[13px] font-medium text-bion-text hover:border-bion-accent"
                >
                    <svg className={ICON_SM_CLS}>
                        <use href="#i-paperclip" />
                    </svg>
                    <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                </a>
            ))}
        </div>
    );
}

function ThreadMessage({ message }: { message: ProjectRequestMessage }) {
    return (
        <div
            className={cn(
                'rounded-[10px] border border-bion-border p-[14px]',
                message.authorType === 'team' ? 'bg-bion-accent-soft' : 'bg-bion-bg',
            )}
        >
            <div className="mb-[8px] flex flex-wrap items-center justify-between gap-[8px] text-[12px] text-bion-text-muted">
                <span className="font-semibold text-bion-text">{message.authorLabel}</span>
                <span className="font-mono">{message.createdAt}</span>
            </div>
            <p className="whitespace-pre-line text-[13.5px] leading-[1.65] text-bion-text">
                {message.body}
            </p>
            {message.attachments.length > 0 ? (
                <div className="mt-[12px]">
                    <AttachmentList attachments={message.attachments} />
                </div>
            ) : null}
        </div>
    );
}

export default function RequestLogShowPage({
    project,
    requestLog,
}: RequestLogDetailPageProps) {
    const { currentTeam } = usePage().props;
    const replyForm = useForm<ReplyFormValues>({
        body: '',
        attachments: [],
    });
    const replyErrors = replyForm.errors as ReplyFormErrors;
    const projectUrl = currentTeam
        ? projectShow({ current_team: currentTeam.slug, project: project.id }).url
        : '/';

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

        if (!currentTeam || replyForm.data.body.trim() === '') {
            return;
        }

        replyForm.post(
            storeRequestLogMessage({
                current_team: currentTeam.slug,
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
            <Head title={`Request Detail · ${project.title}`} />

            <div className="flex flex-1 flex-col overflow-y-auto">
                <div className="mx-auto w-full max-w-[1120px] pb-[80px]">
                    <div className="mb-[24px] flex flex-wrap items-start justify-between gap-[16px]">
                        <div>
                            <div className="mb-[10px] flex flex-wrap items-center gap-[8px] text-[12.5px] text-bion-text-muted">
                                <Link href={projectUrl} className="font-semibold text-bion-accent hover:underline">
                                    {project.title}
                                </Link>
                                <span>/</span>
                                <span>Request Log</span>
                            </div>
                            <h1 className="mb-[8px] text-[26px] font-semibold text-bion-text">
                                Request Detail
                            </h1>
                            <div className="flex flex-wrap items-center gap-[8px]">
                                <span className={toneClassMap[project.tone]}>
                                    <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[project.tone])} />
                                    {project.stageLabel}
                                </span>
                                <span className="text-[13px] text-bion-text-muted">{project.client}</span>
                            </div>
                        </div>

                        <Link href={projectUrl} className={BTN_GHOST}>
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-arrow-left" />
                            </svg>
                            Back to Project
                        </Link>
                    </div>

                    <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1fr)_320px]">
                        <main className="flex min-w-0 flex-col gap-[18px]">
                            <section className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                                <div className="border-b border-bion-border px-[18px] py-[14px]">
                                    <h2 className="text-[15px] font-semibold text-bion-text">Original Request</h2>
                                </div>
                                <div className="p-[18px]">
                                    <p className="whitespace-pre-line text-[14px] leading-[1.75] text-bion-text">
                                        {requestLog.text}
                                    </p>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                                <div className="border-b border-bion-border px-[18px] py-[14px]">
                                    <h2 className="text-[15px] font-semibold text-bion-text">Attachments</h2>
                                </div>
                                <div className="p-[18px]">
                                    <AttachmentList attachments={requestLog.attachments} />
                                </div>
                            </section>

                            {requestLog.notes !== '' ? (
                                <section className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                                    <div className="border-b border-bion-border px-[18px] py-[14px]">
                                        <h2 className="text-[15px] font-semibold text-bion-text">Internal Notes</h2>
                                    </div>
                                    <div className="p-[18px]">
                                        <p className="whitespace-pre-line text-[13.5px] leading-[1.7] text-bion-text-muted">
                                            {requestLog.notes}
                                        </p>
                                    </div>
                                </section>
                            ) : null}

                            <section className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                                <div className="border-b border-bion-border px-[18px] py-[14px]">
                                    <h2 className="text-[15px] font-semibold text-bion-text">Client Thread</h2>
                                </div>
                                <div className="flex flex-col gap-[12px] p-[18px]">
                                    {requestLog.messages.length > 0 ? (
                                        requestLog.messages.map((message) => (
                                            <ThreadMessage key={message.id} message={message} />
                                        ))
                                    ) : (
                                        <div className="rounded-[10px] border border-dashed border-bion-border bg-bion-bg p-[14px] text-[13px] text-bion-text-muted">
                                            No replies yet.
                                        </div>
                                    )}

                                    <form
                                        className="mt-[6px] border-t border-bion-border pt-[18px]"
                                        onSubmit={submitReply}
                                    >
                                        <div className="mb-[12px]">
                                            <label className={FIELD_LABEL} htmlFor="team-reply-body">
                                                Team Reply
                                            </label>
                                            <textarea
                                                id="team-reply-body"
                                                rows={4}
                                                className={cn(FIELD_INPUT, 'resize-y leading-[1.6]')}
                                                placeholder="Write a reply that the client can see."
                                                value={replyForm.data.body}
                                                onChange={(event) => replyForm.setData('body', event.target.value)}
                                            />
                                            {replyErrors.body ? (
                                                <div className="mt-[6px] text-[12px] text-bion-danger">
                                                    {replyErrors.body}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="mb-[12px]">
                                            <span className={FIELD_LABEL}>Attachments</span>
                                            <div className="mb-[8px] flex flex-col gap-[6px]">
                                                {replyForm.data.attachments.map((file, index) => (
                                                    <div
                                                        key={`${file.name}-${index}`}
                                                        className="flex min-w-0 items-center gap-[8px] rounded-[8px] border border-bion-border bg-bion-bg px-[10px] py-[8px] text-[12.5px]"
                                                    >
                                                        <svg className={ICON_SM_CLS}>
                                                            <use href="#i-paperclip" />
                                                        </svg>
                                                        <span className="min-w-0 flex-1 truncate">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            className="text-bion-text-muted hover:text-bion-danger"
                                                            onClick={() => removeReplyAttachment(index)}
                                                        >
                                                            <svg className={ICON_SM_CLS}>
                                                                <use href="#i-x" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <label className={cn(BTN_GHOST, 'w-fit cursor-pointer')}>
                                                <svg className={ICON_SM_CLS}>
                                                    <use href="#i-paperclip" />
                                                </svg>
                                                Add files
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    onChange={addReplyAttachments}
                                                />
                                            </label>
                                            {replyErrors.attachments ? (
                                                <div className="mt-[6px] text-[12px] text-bion-danger">
                                                    {replyErrors.attachments}
                                                </div>
                                            ) : null}
                                        </div>

                                        {replyForm.progress ? (
                                            <div className="mb-[12px] h-[6px] overflow-hidden rounded-full bg-bion-surface-raised">
                                                <div
                                                    className="h-full rounded-full bg-bion-accent"
                                                    style={{ width: `${replyForm.progress.percentage ?? 0}%` }}
                                                />
                                            </div>
                                        ) : null}

                                        {replyForm.wasSuccessful ? (
                                            <div className="mb-[12px] rounded-[8px] bg-bion-success-soft px-[12px] py-[9px] text-[12.5px] text-bion-success">
                                                Reply sent.
                                            </div>
                                        ) : null}

                                        <button
                                            type="submit"
                                            className={BTN_PRIMARY}
                                            disabled={replyForm.processing || replyForm.data.body.trim() === ''}
                                        >
                                            <svg className={ICON_SM_CLS}>
                                                <use href="#i-send" />
                                            </svg>
                                            {replyForm.processing ? 'Sending...' : 'Send Reply'}
                                        </button>
                                    </form>
                                </div>
                            </section>
                        </main>

                        <aside className="h-fit rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                            <h2 className="mb-[14px] text-[14px] font-semibold text-bion-text">Request Metadata</h2>
                            <dl className="flex flex-col gap-[13px]">
                                <div>
                                    <dt className="mb-[5px] text-[11px] uppercase text-bion-text-muted [letter-spacing:0.04em]">Status</dt>
                                    <dd>
                                        <span className={toneClassMap[requestLog.statusTone]}>
                                            <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[requestLog.statusTone])} />
                                            {requestLog.statusLabel}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="mb-[5px] text-[11px] uppercase text-bion-text-muted [letter-spacing:0.04em]">Classification</dt>
                                    <dd>
                                        <span
                                            className={cn(
                                                'inline-flex rounded-full px-[10px] py-[3px] text-[10.5px] font-bold uppercase [letter-spacing:0.03em]',
                                                requestClassMap[requestLog.classification],
                                            )}
                                        >
                                            {requestLog.classification}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="mb-[5px] text-[11px] uppercase text-bion-text-muted [letter-spacing:0.04em]">Source</dt>
                                    <dd className="text-[13.5px] font-medium text-bion-text">{requestLog.source}</dd>
                                </div>
                                <div>
                                    <dt className="mb-[5px] text-[11px] uppercase text-bion-text-muted [letter-spacing:0.04em]">Created</dt>
                                    <dd className="font-mono text-[13px] text-bion-text">{requestLog.date}</dd>
                                </div>
                                <div>
                                    <dt className="mb-[5px] text-[11px] uppercase text-bion-text-muted [letter-spacing:0.04em]">UUID</dt>
                                    <dd className="break-all font-mono text-[12px] text-bion-text-muted">{requestLog.uuid}</dd>
                                </div>
                            </dl>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
