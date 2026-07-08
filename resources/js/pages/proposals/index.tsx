import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as proposalCreate, edit as proposalEdit, index as proposals } from '@/routes/proposals';
import type {
    ProposalDocument,
    ProposalLineItem,
    ProposalsPageProps,
} from '@/types';

const ICON_CLS =
    'h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';
const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST_SM =
    'inline-flex items-center gap-[7px] rounded-[6px] px-[12px] py-[6px] text-[12.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised';
const BTN_PRIMARY_SM =
    'inline-flex items-center gap-[7px] rounded-[6px] px-[12px] py-[6px] text-[12.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] bg-bion-accent text-bion-accent-text hover:opacity-[0.88]';

const PILL_BASE =
    'inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-medium whitespace-nowrap';

const MODAL_BACKDROP =
    'group/modal fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-[20px] opacity-0 pointer-events-none [transition:opacity_0.15s_ease] [&.open]:opacity-100! [&.open]:pointer-events-auto!';
const MODAL =
    'w-full max-w-[460px] rounded-[14px] border border-bion-border bg-bion-surface-raised shadow-[0_24px_60px_rgba(0,0,0,0.4)] [transform:translateY(-10px)_scale(0.98)] [transition:transform_0.15s_ease] group-[.open]/modal:[transform:translateY(0)_scale(1)]';
const MODAL_HEAD = 'flex items-center justify-between gap-[12px] border-b border-bion-border p-[18px_20px]';
const MODAL_BODY = 'max-h-[65vh] overflow-y-auto p-[20px]';
const MODAL_FOOT = 'flex flex-wrap justify-end gap-[10px] border-t border-bion-border p-[16px_20px]';
const SLIDEOVER_CLOSE =
    'flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] text-bion-text-muted hover:bg-bion-bg hover:text-bion-text';

const BOARD_STATUSES = [
    'draft',
    'sent',
    'viewed',
    'accepted',
    'rejected',
] as const;

type ProposalStatus = (typeof BOARD_STATUSES)[number];
type SortKey = 'amountValue' | 'dateSort';

const STATUS_LABEL: Record<ProposalStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    viewed: 'Viewed',
    accepted: 'Accepted',
    rejected: 'Rejected',
};

const STATUS_PILL_CLASS: Record<ProposalStatus, string> = {
    draft: cn(PILL_BASE, 'border border-bion-border bg-bion-surface-raised text-bion-text-muted'),
    sent: cn(PILL_BASE, 'border border-bion-border bg-bion-surface-raised text-bion-text-muted'),
    viewed: cn(PILL_BASE, 'bg-bion-accent-soft text-bion-accent'),
    accepted: cn(PILL_BASE, 'bg-bion-success-soft text-bion-success'),
    rejected: cn(PILL_BASE, 'bg-bion-danger-soft text-bion-danger'),
};

const STATUS_DOT_CLASS: Record<ProposalStatus, string> = {
    draft: 'bg-bion-text-muted',
    sent: 'bg-bion-text-muted',
    viewed: 'bg-bion-accent',
    accepted: 'bg-bion-success',
    rejected: 'bg-bion-danger',
};

const STATUS_BORDER_COLOR: Record<ProposalStatus, string> = {
    draft: 'var(--bion-text-muted)',
    sent: 'var(--bion-text-muted)',
    viewed: 'var(--bion-accent)',
    accepted: 'var(--bion-success)',
    rejected: 'var(--bion-danger)',
};

const STATUS_TONE: Record<ProposalStatus, ProposalDocument['tone']> = {
    draft: 'muted',
    sent: 'accent',
    viewed: 'accent',
    accepted: 'success',
    rejected: 'danger',
};

export default function ProposalsPage({
    defaultView,
    documents,
}: ProposalsPageProps) {
    const { currentTeam } = usePage().props;
    const [view, setView] = useState<'board' | 'list'>(defaultView);
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<ProposalDocument[]>(documents);
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortAscending, setSortAscending] = useState(true);
    const [menuDocumentId, setMenuDocumentId] = useState<number | null>(null);
    const [draggedDocumentId, setDraggedDocumentId] = useState<number | null>(
        null,
    );
    const [dragOverStatus, setDragOverStatus] = useState<ProposalStatus | null>(
        null,
    );
    const [previewDocumentId, setPreviewDocumentId] = useState<number | null>(
        null,
    );
    const [acceptedDocument, setAcceptedDocument] =
        useState<ProposalDocument | null>(null);

    useEffect(() => {
        const handleDocumentClick = () => {
            setMenuDocumentId(null);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            setMenuDocumentId(null);
            setPreviewDocumentId(null);
            setAcceptedDocument(null);
        };

        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const filteredDocuments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (normalizedQuery.length === 0) {
            return items;
        }

        return items.filter((document) => {
            return (
                document.title.toLowerCase().includes(normalizedQuery) ||
                document.client.toLowerCase().includes(normalizedQuery)
            );
        });
    }, [items, query]);

    const boardColumns = useMemo(() => {
        return BOARD_STATUSES.map((status) => ({
            status,
            label: STATUS_LABEL[status],
            items: filteredDocuments.filter(
                (document) => document.stage === status,
            ),
        }));
    }, [filteredDocuments]);

    const listDocuments = useMemo(() => {
        const sortedDocuments = [...filteredDocuments];

        if (sortKey === null) {
            return sortedDocuments;
        }

        sortedDocuments.sort((left, right) => {
            const comparison = left[sortKey] - right[sortKey];

            return sortAscending ? comparison : -comparison;
        });

        return sortedDocuments;
    }, [filteredDocuments, sortAscending, sortKey]);

    const previewDocument = useMemo(() => {
        if (previewDocumentId === null) {
            return null;
        }

        return (
            items.find((document) => document.id === previewDocumentId) ?? null
        );
    }, [items, previewDocumentId]);

    const openPreview = (documentId: number): void => {
        setPreviewDocumentId(documentId);
        setMenuDocumentId(null);
    };

    const handleDropToStatus = (nextStatus: ProposalStatus): void => {
        if (draggedDocumentId !== null) {
            handleStatusMove(draggedDocumentId, nextStatus);
        }

        setDraggedDocumentId(null);
        setDragOverStatus(null);
    };

    const handleSort = (key: SortKey): void => {
        if (sortKey === key) {
            setSortAscending((currentValue) => !currentValue);

            return;
        }

        setSortKey(key);
        setSortAscending(true);
    };

    const handleStatusMove = (
        documentId: number,
        nextStatus: ProposalStatus,
    ): void => {
        const currentDocument = items.find(
            (document) => document.id === documentId,
        );

        setItems((currentItems) =>
            currentItems.map((document) => {
                if (document.id !== documentId || document.stage === nextStatus) {
                    return document;
                }

                return {
                    ...document,
                    stage: nextStatus,
                    stageLabel: STATUS_LABEL[nextStatus],
                    tone: STATUS_TONE[nextStatus],
                };
            }),
        );

        const nextAcceptedDocument: ProposalDocument | null =
            currentDocument &&
            currentDocument.stage !== 'accepted' &&
            nextStatus === 'accepted'
                ? {
                      ...currentDocument,
                      stage: nextStatus,
                      stageLabel: STATUS_LABEL[nextStatus],
                      tone: STATUS_TONE[nextStatus],
                  }
                : null;

        setMenuDocumentId(null);

        if (nextAcceptedDocument !== null) {
            setAcceptedDocument(nextAcceptedDocument);
        }
    };

    const visitCreateProposal = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(proposalCreate(currentTeam.slug));
    };

    const visitEditProposal = (documentId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(
            proposalEdit({ current_team: currentTeam.slug, proposal: documentId }),
        );
    };

    const duplicateProposal = (document: ProposalDocument): void => {
        const nextId = Math.max(...items.map((item) => item.id), 0) + 1;
        const duplicatedDocument: ProposalDocument = {
            ...document,
            id: nextId,
            number: `P-2026-${String(nextId).padStart(3, '0')}`,
            title: `${document.title} Copy`,
            stage: 'draft',
            stageLabel: STATUS_LABEL.draft,
            tone: STATUS_TONE.draft,
            updatedAt: 'Just now',
            dateSort: 0,
        };

        setItems((currentItems) => [...currentItems, duplicatedDocument]);
        setPreviewDocumentId(duplicatedDocument.id);
    };

    const deleteProposal = (documentId: number): void => {
        setItems((currentItems) =>
            currentItems.filter((document) => document.id !== documentId),
        );
        setPreviewDocumentId(null);
        setMenuDocumentId(null);
    };

    const copyShareLink = async (shareUrl: string): Promise<void> => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch {
            return;
        }
    };

    return (
        <>
            <Head title="Proposals" />

            <div className="flex min-h-0 flex-1 flex-col">
                <p className="mb-[14px] shrink-0 text-[13px] text-bion-text-muted">
                    Send proposals, track responses, and move straight to
                    invoicing once accepted.
                </p>

                <div className="mb-[16px] flex shrink-0 flex-wrap items-center justify-between gap-[12px] max-[760px]:flex-col max-[760px]:items-stretch">
                    <div className="flex flex-wrap items-center gap-[12px]">
                        <div className="flex rounded-[8px] border border-bion-border bg-bion-surface p-[2px]">
                            <button
                                type="button"
                                className={cn(
                                    'flex items-center gap-[6px] rounded-[6px] px-[13px] py-[6px] text-[12.5px] font-medium text-bion-text-muted',
                                    view === 'board' && 'bg-bion-accent-soft! text-bion-accent!',
                                )}
                                onClick={() => setView('board')}
                            >
                                <ShellIcon icon="i-kanban" small />
                                Board
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'flex items-center gap-[6px] rounded-[6px] px-[13px] py-[6px] text-[12.5px] font-medium text-bion-text-muted',
                                    view === 'list' && 'bg-bion-accent-soft! text-bion-accent!',
                                )}
                                onClick={() => setView('list')}
                            >
                                <ShellIcon icon="i-list" small />
                                List
                            </button>
                        </div>

                        <label className="flex w-[260px] items-center gap-[8px] rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[7px] text-bion-text-muted max-[760px]:w-full">
                            <ShellIcon icon="i-search" small />
                            <input
                                type="text"
                                className="flex-1 border-none bg-transparent text-[13px] text-bion-text outline-none"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.currentTarget.value)
                                }
                                placeholder="Search proposals or clients..."
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        onClick={visitCreateProposal}
                    >
                        <ShellIcon icon="i-plus" small />
                        New Proposal
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                    {view === 'board' ? (
                        <div className="flex min-h-0 flex-1 items-stretch gap-[14px] overflow-x-auto overflow-y-hidden pb-[10px]">
                            {boardColumns.map((column) => (
                                <div
                                    key={column.status}
                                    className="flex w-[250px] shrink-0 flex-col min-h-0"
                                    data-status={column.status}
                                >
                                    <div className="flex shrink-0 items-center justify-between px-[6px] pt-[4px] pb-[12px]">
                                        <span className="flex items-center gap-[8px] text-[13px] font-semibold">
                                            <span
                                                className="h-[7px] w-[7px] rounded-full"
                                                style={{
                                                    background:
                                                        STATUS_BORDER_COLOR[
                                                            column.status
                                                        ],
                                                }}
                                            />
                                            {column.label}
                                        </span>
                                        <span className="font-mono text-[12px] text-bion-text-muted">
                                            {column.items.length}
                                        </span>
                                    </div>

                                    <div
                                        className={cn(
                                            'flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto rounded-[10px] p-[4px_6px_4px_4px] [transition:background_0.12s_ease]',
                                            dragOverStatus === column.status && 'bg-bion-accent-soft',
                                        )}
                                        onDragOver={(event) => {
                                            event.preventDefault();
                                            setDragOverStatus(column.status);
                                        }}
                                        onDragLeave={(event) => {
                                            if (
                                                event.currentTarget ===
                                                event.target
                                            ) {
                                                setDragOverStatus(null);
                                            }
                                        }}
                                        onDrop={() =>
                                            handleDropToStatus(column.status)
                                        }
                                    >
                                        {column.items.map((document) => (
                                            <div
                                                key={document.id}
                                                className={cn(
                                                    'cursor-pointer rounded-[10px] border border-bion-border border-l-[3px] bg-bion-surface p-[12px] [transition:border-color_0.12s_ease,box-shadow_0.12s_ease]',
                                                    draggedDocumentId === document.id && 'opacity-35',
                                                )}
                                                role="button"
                                                tabIndex={0}
                                                draggable
                                                style={{
                                                    borderLeftColor:
                                                        STATUS_BORDER_COLOR[
                                                            document.stage as ProposalStatus
                                                        ],
                                                }}
                                                onClick={() =>
                                                    openPreview(document.id)
                                                }
                                                onDragStart={() =>
                                                    setDraggedDocumentId(
                                                        document.id,
                                                    )
                                                }
                                                onDragEnd={() => {
                                                    setDraggedDocumentId(null);
                                                    setDragOverStatus(null);
                                                }}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === 'Enter' ||
                                                        event.key === ' '
                                                    ) {
                                                        event.preventDefault();
                                                        openPreview(document.id);
                                                    }
                                                }}
                                            >
                                                <div className="mb-[6px] flex items-start justify-between gap-[8px]">
                                                    <span className="text-[13.5px] font-semibold leading-[1.35]">
                                                        {document.title}
                                                    </span>

                                                    <div
                                                        className="relative shrink-0"
                                                        onClick={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-bg hover:text-bion-text"
                                                            onClick={() =>
                                                                setMenuDocumentId(
                                                                    menuDocumentId ===
                                                                        document.id
                                                                        ? null
                                                                        : document.id,
                                                                )
                                                            }
                                                        >
                                                            <ShellIcon
                                                                icon="i-more"
                                                                small
                                                            />
                                                        </button>

                                                        <div
                                                            className={cn(
                                                                'absolute top-[26px] right-0 z-20 w-[170px] rounded-[10px] border border-bion-border bg-bion-surface-raised p-[6px] opacity-0 pointer-events-none shadow-bion-raised [transform:translateY(-4px)_scale(0.98)] [transition:opacity_0.12s_ease,transform_0.12s_ease]',
                                                                menuDocumentId === document.id &&
                                                                    'opacity-100! pointer-events-auto! [transform:translateY(0)_scale(1)]!',
                                                            )}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-text hover:bg-bion-bg"
                                                                onClick={() => {
                                                                    setMenuDocumentId(null);
                                                                    visitEditProposal(document.id);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>

                                                            <div className="px-[8px] pt-[6px] pb-[4px] text-[11px] text-bion-text-muted uppercase">
                                                                Move to
                                                            </div>
                                                            {BOARD_STATUSES.map(
                                                                (status) => (
                                                                    <button
                                                                        key={
                                                                            status
                                                                        }
                                                                        type="button"
                                                                        className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-text hover:bg-bion-bg"
                                                                        onClick={() =>
                                                                            handleStatusMove(
                                                                                document.id,
                                                                                status,
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            STATUS_LABEL[
                                                                                status
                                                                            ]
                                                                        }
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-[8px] font-mono text-[11px] text-bion-text-muted">
                                                    {document.number}
                                                </div>
                                                <div className="mb-[12px] text-[12px] text-bion-text-muted">
                                                    {document.client}
                                                </div>

                                                <div className="flex items-center justify-between text-[11.5px]">
                                                    <span className="text-bion-text-muted">
                                                        {document.updatedAt}
                                                    </span>
                                                    <span className="font-mono font-semibold">
                                                        {document.amount}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                            <div className="min-h-0 flex-1 overflow-y-auto">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-[5] bg-bion-surface">
                                        <tr>
                                            <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none">
                                                Number
                                            </th>
                                            <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none">
                                                Proposal
                                            </th>
                                            <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none">
                                                Status
                                            </th>
                                            <th
                                                className="cursor-pointer border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none"
                                                onClick={() =>
                                                    handleSort('amountValue')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-[4px]">
                                                    Value
                                                    <ShellIcon
                                                        icon="i-chevron-down"
                                                        small
                                                    />
                                                </span>
                                            </th>
                                            <th
                                                className="cursor-pointer border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none"
                                                onClick={() =>
                                                    handleSort('dateSort')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-[4px]">
                                                    Created
                                                    <ShellIcon
                                                        icon="i-chevron-down"
                                                        small
                                                    />
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child_td]:border-b-0">
                                        {listDocuments.map((document) => (
                                            <tr
                                                key={document.id}
                                                className="cursor-pointer [transition:background_0.1s_ease] hover:[&>td]:bg-bion-bg"
                                                onClick={() =>
                                                    openPreview(document.id)
                                                }
                                            >
                                                <td className="border-b border-bion-border px-[16px] py-[13px] font-mono text-[12px] text-bion-text-muted">
                                                    {document.number}
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[13px] text-[13px]">
                                                    <div className="mb-[2px] font-medium">
                                                        {document.title}
                                                    </div>
                                                    <div className="text-[12px] text-bion-text-muted">
                                                        {document.client}
                                                    </div>
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[13px] text-[13px]">
                                                    <StatusPill
                                                        status={
                                                            document.stage as ProposalStatus
                                                        }
                                                    />
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[13px] text-right font-mono text-[13px] font-medium">
                                                    {document.amount}
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[13px] text-[12px] text-bion-text-muted">
                                                    {document.updatedAt}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <div
                    className={cn(MODAL_BACKDROP, previewDocument && 'open')}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setPreviewDocumentId(null);
                        }
                    }}
                >
                    <div
                        className={cn(MODAL, 'max-w-[720px]')}
                        onClick={(event) => event.stopPropagation()}
                    >
                        {previewDocument ? (
                            <>
                                <div className={MODAL_HEAD}>
                                    <h3 className="text-[15.5px] font-bold">{previewDocument.title}</h3>
                                    <button
                                        type="button"
                                        className={SLIDEOVER_CLOSE}
                                        onClick={() =>
                                            setPreviewDocumentId(null)
                                        }
                                    >
                                        <ShellIcon icon="i-x" />
                                    </button>
                                </div>

                                <div className={MODAL_BODY}>
                                    <div className="mb-[16px] flex flex-wrap items-center gap-[10px]">
                                        <StatusPill
                                            status={
                                                previewDocument.stage as ProposalStatus
                                            }
                                        />
                                        <span className="font-mono text-[12px] text-bion-text-muted">
                                            {previewDocument.number}
                                        </span>
                                        <span className="text-[12px] text-bion-text-muted">
                                            {previewDocument.client}
                                        </span>
                                    </div>

                                    <div className="mb-[16px] flex items-center gap-[8px] rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[9px]">
                                        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12px] text-bion-text-muted">
                                            {previewDocument.shareUrl}
                                        </span>
                                        <button
                                            type="button"
                                            className="shrink-0 text-bion-text-muted hover:text-bion-accent"
                                            onClick={() =>
                                                void copyShareLink(
                                                    previewDocument.shareUrl,
                                                )
                                            }
                                        >
                                            <ShellIcon icon="i-copy" small />
                                        </button>
                                    </div>

                                    <div className="mb-[16px] overflow-hidden rounded-[10px] border border-bion-border">
                                        {previewDocument.items.map((item) => (
                                            <PreviewItemRow
                                                key={item.label}
                                                item={item}
                                            />
                                        ))}
                                        <div className="flex justify-between border-t border-bion-border bg-bion-surface-raised p-[10px_14px] text-[13px] font-semibold">
                                            <span>Total</span>
                                            <span className="font-mono">
                                                {previewDocument.amount}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[13.5px] leading-[1.6] text-bion-text-muted">
                                        Proposal shared{' '}
                                        {previewDocument.updatedAt} for{' '}
                                        {previewDocument.client}.
                                    </p>
                                </div>

                                <div className={MODAL_FOOT}>
                                    <button
                                        type="button"
                                        className={BTN_GHOST_SM}
                                        onClick={() =>
                                            duplicateProposal(previewDocument)
                                        }
                                    >
                                        <ShellIcon icon="i-copy" small />
                                        Duplicate
                                    </button>
                                    <button
                                        type="button"
                                        className={BTN_GHOST_SM}
                                        onClick={() =>
                                            deleteProposal(previewDocument.id)
                                        }
                                    >
                                        <ShellIcon icon="i-trash" small />
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        className={BTN_GHOST_SM}
                                        onClick={() =>
                                            visitEditProposal(previewDocument.id)
                                        }
                                    >
                                        <ShellIcon icon="i-edit" small />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className={BTN_PRIMARY_SM}
                                        onClick={() =>
                                            setPreviewDocumentId(null)
                                        }
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>

                <div
                    className={cn(MODAL_BACKDROP, acceptedDocument && 'open')}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setAcceptedDocument(null);
                        }
                    }}
                >
                    <div
                        className={MODAL}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={MODAL_HEAD}>
                            <h3 className="text-[15.5px] font-bold">Nice, proposal accepted! 🎉</h3>
                        </div>

                        <div className={MODAL_BODY}>
                            <p className="text-[13.5px] leading-[1.6] text-bion-text-muted">
                                Want to move{' '}
                                <strong>
                                    {acceptedDocument?.title ?? 'this proposal'}
                                </strong>{' '}
                                forward now?
                            </p>
                        </div>

                        <div className={cn(MODAL_FOOT, 'justify-start')}>
                            <button
                                type="button"
                                className={BTN_GHOST_SM}
                                onClick={() => setAcceptedDocument(null)}
                            >
                                Not now
                            </button>
                            <button
                                type="button"
                                className={BTN_GHOST_SM}
                                onClick={() => setAcceptedDocument(null)}
                            >
                                Create Quote draft
                            </button>
                            <button
                                type="button"
                                className={BTN_PRIMARY_SM}
                                onClick={() => setAcceptedDocument(null)}
                            >
                                Create Invoice draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatusPill({ status }: { status: ProposalStatus }) {
    return (
        <span className={STATUS_PILL_CLASS[status]}>
            <span className={cn('h-[6px] w-[6px] rounded-full', STATUS_DOT_CLASS[status])} />
            {STATUS_LABEL[status]}
        </span>
    );
}

function PreviewItemRow({ item }: { item: ProposalLineItem }) {
    return (
        <div className="flex justify-between border-b border-bion-border p-[10px_14px] text-[13px] last:border-b-0">
            <span>{item.label}</span>
            <span className="font-mono">{item.amount}</span>
        </div>
    );
}

function ShellIcon({
    icon,
    small = false,
}: {
    icon: string;
    small?: boolean;
}) {
    return (
        <svg className={small ? ICON_SM_CLS : ICON_CLS}>
            <use href={`#${icon}`} />
        </svg>
    );
}

ProposalsPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Proposals',
            href: props.currentTeam ? proposals(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
