import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBionAiChat } from '@/hooks/use-bion-ai-chat';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as bionAiIndex, show as bionAiShow } from '@/routes/bion-ai';
import {
    destroy as destroyConversation,
    store as storeConversation,
    update as renameConversation,
} from '@/routes/bion-ai/conversations';
import {
    status as messageStatus,
    store as storeMessage,
} from '@/routes/bion-ai/messages';
import type { BionAiConversationPageProps } from '@/types/bion-ai';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[14px] py-[8px] text-[13px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';
const BTN_PRIMARY = cn(
    BTN,
    'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]',
);

const PENDING_MESSAGE_KEY = 'bion-ai:pending-message';

const EXAMPLE_PROMPTS = [
    'What tasks are overdue?',
    "What's on my schedule today?",
    'Which invoices are unpaid?',
];

function AssistantMarkdown({ content }: { content: string }) {
    return (
        <div className="flex flex-col gap-[8px] text-[13.5px] leading-relaxed break-words [&_ol]:my-[2px] [&_ol]:list-decimal [&_ol]:pl-[20px] [&_p]:m-0 [&_ul]:my-[2px] [&_ul]:list-disc [&_ul]:pl-[20px]">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ ...props }) => (
                        <a
                            {...props}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-bion-accent underline"
                        />
                    ),
                    code: ({ ...props }) => (
                        <code
                            {...props}
                            className="rounded-[4px] bg-bion-surface px-[4px] py-[1px] text-[12.5px]"
                        />
                    ),
                    pre: ({ ...props }) => (
                        <pre
                            {...props}
                            className="overflow-x-auto rounded-[8px] bg-bion-surface p-[10px] text-[12.5px]"
                        />
                    ),
                    blockquote: ({ ...props }) => (
                        <blockquote
                            {...props}
                            className="border-l-[3px] border-bion-border pl-[10px] text-bion-text-muted"
                        />
                    ),
                    h1: ({ ...props }) => (
                        <h1 {...props} className="text-[15px] font-bold" />
                    ),
                    h2: ({ ...props }) => (
                        <h2 {...props} className="text-[14.5px] font-bold" />
                    ),
                    h3: ({ ...props }) => (
                        <h3 {...props} className="text-[14px] font-bold" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default function BionAiPage({
    conversations,
    activeConversationId,
    messages: initialMessages,
}: BionAiConversationPageProps) {
    const { currentTeam } = usePage().props;
    const [draft, setDraft] = useState('');
    const [renamingId, setRenamingId] = useState<number | null>(null);
    const [renameDraft, setRenameDraft] = useState('');
    const scrollAnchorRef = useRef<HTMLDivElement>(null);
    const autoSendChecked = useRef(false);

    const urls =
        currentTeam && activeConversationId !== null
            ? {
                  send: storeMessage({
                      current_team: currentTeam.slug,
                      conversation: activeConversationId,
                  }).url,
                  status: messageStatus({
                      current_team: currentTeam.slug,
                      conversation: activeConversationId,
                  }).url,
              }
            : { send: '', status: '' };

    const { messages, sending, error, send } = useBionAiChat(
        urls,
        initialMessages,
    );

    useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, sending]);

    useEffect(() => {
        if (
            autoSendChecked.current ||
            activeConversationId === null ||
            messages.length > 0
        ) {
            return;
        }

        autoSendChecked.current = true;
        const pending = window.sessionStorage.getItem(PENDING_MESSAGE_KEY);

        if (pending) {
            window.sessionStorage.removeItem(PENDING_MESSAGE_KEY);
            send(pending);
        }
    }, [activeConversationId, messages.length, send]);

    const startNewConversation = (): void => {
        if (!currentTeam) {
            return;
        }

        router.post(storeConversation(currentTeam.slug).url);
    };

    const startWithPrompt = (prompt: string): void => {
        if (!currentTeam) {
            return;
        }

        window.sessionStorage.setItem(PENDING_MESSAGE_KEY, prompt);
        router.post(storeConversation(currentTeam.slug).url);
    };

    const deleteConversation = (conversationId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.delete(
            destroyConversation({
                current_team: currentTeam.slug,
                conversation: conversationId,
            }).url,
        );
    };

    const startRenaming = (
        conversationId: number,
        currentTitle: string,
    ): void => {
        setRenamingId(conversationId);
        setRenameDraft(currentTitle);
    };

    const commitRename = (): void => {
        if (!currentTeam || renamingId === null) {
            return;
        }

        const title = renameDraft.trim();
        const conversationId = renamingId;
        setRenamingId(null);

        if (title === '') {
            return;
        }

        router.patch(
            renameConversation({
                current_team: currentTeam.slug,
                conversation: conversationId,
            }).url,
            { title },
            { preserveScroll: true },
        );
    };

    const submitDraft = (): void => {
        if (draft.trim() === '') {
            return;
        }

        if (activeConversationId === null) {
            startWithPrompt(draft.trim());
            setDraft('');

            return;
        }

        send(draft);
        setDraft('');
    };

    const handleComposerKeyDown = (
        event: KeyboardEvent<HTMLTextAreaElement>,
    ): void => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitDraft();
        }
    };

    return (
        <>
            <Head title="BionAI" />

            <div className="flex min-h-0 flex-1 overflow-hidden">
                <aside className="flex w-[260px] shrink-0 flex-col border-r border-bion-border">
                    <div className="border-b border-bion-border p-[14px]">
                        <button
                            type="button"
                            className={cn(BTN_PRIMARY, 'w-full justify-center')}
                            onClick={startNewConversation}
                        >
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-plus" />
                            </svg>
                            New chat
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-[8px]">
                        {conversations.length === 0 ? (
                            <p className="p-[10px] text-[12.5px] text-bion-text-muted italic">
                                No conversations yet.
                            </p>
                        ) : (
                            conversations.map((item) =>
                                renamingId === item.id ? (
                                    <div
                                        key={item.id}
                                        className="mb-[4px] px-[10px] py-[4px]"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={renameDraft}
                                            className="w-full rounded-[6px] border border-bion-accent bg-bion-surface px-[8px] py-[6px] text-[13px] text-bion-text focus:outline-none"
                                            onChange={(event) =>
                                                setRenameDraft(
                                                    event.target.value,
                                                )
                                            }
                                            onBlur={commitRename}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault();
                                                    commitRename();
                                                } else if (
                                                    event.key === 'Escape'
                                                ) {
                                                    setRenamingId(null);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            'group mb-[4px] flex items-center gap-[6px] rounded-[8px] px-[10px] py-[8px] text-[13px]',
                                            item.id === activeConversationId
                                                ? 'bg-bion-accent-soft text-bion-accent'
                                                : 'text-bion-text hover:bg-bion-surface-raised',
                                        )}
                                    >
                                        <Link
                                            href={
                                                currentTeam
                                                    ? bionAiShow({
                                                          current_team:
                                                              currentTeam.slug,
                                                          conversation: item.id,
                                                      })
                                                    : '#'
                                            }
                                            className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                                        >
                                            {item.title ?? 'New conversation'}
                                        </Link>
                                        <button
                                            type="button"
                                            className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[5px] text-bion-text-muted opacity-0 [transition:opacity_0.12s_ease] group-hover:opacity-100 hover:bg-bion-surface hover:text-bion-text"
                                            onClick={() =>
                                                startRenaming(
                                                    item.id,
                                                    item.title ??
                                                        'New conversation',
                                                )
                                            }
                                        >
                                            <svg className={ICON_SM_CLS}>
                                                <use href="#i-edit" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[5px] text-bion-text-muted opacity-0 [transition:opacity_0.12s_ease] group-hover:opacity-100 hover:bg-bion-danger-soft hover:text-bion-danger"
                                            onClick={() =>
                                                deleteConversation(item.id)
                                            }
                                        >
                                            <svg className={ICON_SM_CLS}>
                                                <use href="#i-x" />
                                            </svg>
                                        </button>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </aside>

                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto px-[24px] py-[20px]">
                        {activeConversationId === null &&
                        messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-[16px] text-center">
                                <svg className="h-[32px] w-[32px] shrink-0 fill-none stroke-current [stroke-width:1.4] text-bion-accent [stroke-linecap:round] [stroke-linejoin:round]">
                                    <use href="#i-sparkles" />
                                </svg>
                                <h1 className="text-[18px] font-bold">
                                    Ask BionAI anything
                                </h1>
                                <p className="max-w-[420px] text-[13px] text-bion-text-muted">
                                    General questions welcome — and ask about
                                    your workspace ("what tasks are overdue?")
                                    for answers pulled from real data.
                                </p>
                                <div className="flex flex-wrap justify-center gap-[8px]">
                                    {EXAMPLE_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            className="rounded-full border border-bion-border bg-bion-surface px-[14px] py-[7px] text-[12.5px] font-medium text-bion-text hover:border-bion-accent"
                                            onClick={() =>
                                                startWithPrompt(prompt)
                                            }
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mx-auto flex max-w-[720px] flex-col gap-[14px]">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            'flex',
                                            message.role === 'user'
                                                ? 'justify-end'
                                                : 'justify-start',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-[80%] rounded-[12px] px-[14px] py-[10px]',
                                                message.role === 'user'
                                                    ? 'bg-bion-accent text-[13.5px] whitespace-pre-wrap text-bion-accent-text'
                                                    : 'bg-bion-surface-raised text-bion-text',
                                            )}
                                        >
                                            {message.role === 'user' ? (
                                                message.content
                                            ) : (
                                                <AssistantMarkdown
                                                    content={
                                                        message.content ?? ''
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {sending ? (
                                    <div className="flex items-center gap-[7px] text-[12.5px] text-bion-text-muted">
                                        <svg
                                            className={cn(
                                                ICON_SM_CLS,
                                                'text-bion-accent',
                                            )}
                                        >
                                            <use href="#i-sparkles" />
                                        </svg>
                                        BionAI is thinking…
                                    </div>
                                ) : null}

                                {error ? (
                                    <p className="text-[12.5px] text-bion-danger">
                                        {error}
                                    </p>
                                ) : null}

                                <div ref={scrollAnchorRef} />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-bion-border p-[14px]">
                        <div className="mx-auto flex max-w-[720px] items-end gap-[10px]">
                            <textarea
                                className="max-h-[160px] min-h-[42px] flex-1 resize-none rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[10px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none"
                                rows={1}
                                placeholder="Message BionAI..."
                                value={draft}
                                onChange={(event) =>
                                    setDraft(event.target.value)
                                }
                                onKeyDown={handleComposerKeyDown}
                            />
                            <button
                                type="button"
                                className={BTN_PRIMARY}
                                disabled={sending || draft.trim() === ''}
                                onClick={submitDraft}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

BionAiPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'BionAI',
            href: props.currentTeam ? bionAiIndex(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName: 'flex min-h-0 flex-1 overflow-hidden',
});
