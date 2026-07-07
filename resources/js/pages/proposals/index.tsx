import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { dashboard } from '@/routes';
import { index as proposals } from '@/routes/proposals';
import type {
    ProposalDocument,
    ProposalLineItem,
    ProposalsPageProps,
} from '@/types';

const proposalStyles = `
  .bd-app-shell .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 32px 24px;
    overflow: hidden;
    min-height: 0;
  }
  .bd-app-shell .prop-page {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .prop-page .page-description {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 14px;
    flex-shrink: 0;
  }
  .bd-app-shell .prop-page .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .bd-app-shell .prop-page .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .bd-app-shell .prop-page .view-toggle {
    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2px;
  }
  .bd-app-shell .prop-page .view-toggle button {
    padding: 6px 13px;
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .bd-app-shell .prop-page .view-toggle button.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .prop-page .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    width: 260px;
    color: var(--text-muted);
  }
  .bd-app-shell .prop-page .search-box input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-size: 13px;
  }
  .bd-app-shell .prop-page .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    transition: opacity 0.12s ease, transform 0.1s ease;
  }
  .bd-app-shell .prop-page .btn:active {
    transform: scale(0.97);
  }
  .bd-app-shell .prop-page .btn-primary {
    background: var(--accent);
    color: var(--accent-text);
  }
  .bd-app-shell .prop-page .btn-primary:hover {
    opacity: 0.88;
  }
  .bd-app-shell .prop-page .btn-ghost {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .bd-app-shell .prop-page .btn-ghost:hover {
    background: var(--surface-raised);
  }
  .bd-app-shell .prop-page .btn-sm {
    padding: 6px 12px;
    font-size: 12.5px;
  }
  .bd-app-shell .prop-page .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 500;
    white-space: nowrap;
  }
  .bd-app-shell .prop-page .pill .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .bd-app-shell .prop-page .pill-accent {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .prop-page .pill-accent .dot {
    background: var(--accent);
  }
  .bd-app-shell .prop-page .pill-success {
    background: var(--success-soft);
    color: var(--success);
  }
  .bd-app-shell .prop-page .pill-success .dot {
    background: var(--success);
  }
  .bd-app-shell .prop-page .pill-danger {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .bd-app-shell .prop-page .pill-danger .dot {
    background: var(--danger);
  }
  .bd-app-shell .prop-page .pill-muted {
    background: var(--surface-raised);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .bd-app-shell .prop-page .pill-muted .dot {
    background: var(--text-muted);
  }
  .bd-app-shell .prop-page .view-area {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .prop-page .board {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    align-items: stretch;
    padding-bottom: 10px;
  }
  .bd-app-shell .prop-page .board-col {
    width: 250px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .bd-app-shell .prop-page .board-col-head {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px 12px;
  }
  .bd-app-shell .prop-page .stage-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
  }
  .bd-app-shell .prop-page .stage-label .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .bd-app-shell .prop-page .count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-muted);
  }
  .bd-app-shell .prop-page .board-col-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 6px 4px 4px;
    border-radius: 10px;
  }
  .bd-app-shell .prop-page .board-col-body.drag-over {
    background: var(--accent-soft);
  }
  .bd-app-shell .prop-page .doc-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--border);
    border-radius: 10px;
    padding: 12px;
    cursor: pointer;
    transition: border-color 0.12s ease, box-shadow 0.12s ease;
  }
  .bd-app-shell .prop-page .doc-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-raised);
  }
  .bd-app-shell .prop-page .doc-card.dragging {
    opacity: 0.35;
  }
  .bd-app-shell .prop-page .doc-card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 6px;
  }
  .bd-app-shell .prop-page .doc-card-title {
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.35;
  }
  .bd-app-shell .prop-page .card-menu-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .bd-app-shell .prop-page .card-menu-btn {
    color: var(--text-muted);
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }
  .bd-app-shell .prop-page .card-menu-btn:hover {
    background: var(--bg);
    color: var(--text);
  }
  .bd-app-shell .prop-page .card-menu-panel {
    position: absolute;
    top: 26px;
    right: 0;
    width: 170px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--shadow-raised);
    padding: 6px;
    z-index: 20;
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
    pointer-events: none;
    transition: opacity 0.12s ease, transform 0.12s ease;
  }
  .bd-app-shell .prop-page .card-menu-panel.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  .bd-app-shell .prop-page .card-menu-label {
    font-size: 11px;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 6px 8px 4px;
  }
  .bd-app-shell .prop-page .dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 7px;
    font-size: 13px;
    color: var(--text);
    width: 100%;
    text-align: left;
  }
  .bd-app-shell .prop-page .dropdown-item:hover {
    background: var(--bg);
  }
  .bd-app-shell .prop-page .doc-card-number {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .bd-app-shell .prop-page .doc-card-client {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 12px;
  }
  .bd-app-shell .prop-page .doc-card-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
  }
  .bd-app-shell .prop-page .doc-card-date {
    color: var(--text-muted);
  }
  .bd-app-shell .prop-page .doc-card-value {
    font-family: var(--font-mono);
    font-weight: 600;
  }
  .bd-app-shell .prop-page .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .bd-app-shell .prop-page .table-wrap {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .bd-app-shell .prop-page .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  .bd-app-shell .prop-page .data-table thead {
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 5;
  }
  .bd-app-shell .prop-page .data-table th {
    text-align: left;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    user-select: none;
  }
  .bd-app-shell .prop-page .data-table th.sortable {
    cursor: pointer;
  }
  .bd-app-shell .prop-page .data-table th .th-inner {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .bd-app-shell .prop-page .data-table td {
    padding: 13px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .bd-app-shell .prop-page .data-table tbody tr {
    cursor: pointer;
    transition: background 0.1s ease;
  }
  .bd-app-shell .prop-page .data-table tbody tr:hover td {
    background: var(--bg);
  }
  .bd-app-shell .prop-page .data-table tbody tr:last-child td {
    border-bottom: none;
  }
  .bd-app-shell .prop-page .row-number {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-muted);
  }
  .bd-app-shell .prop-page .row-title {
    font-weight: 500;
    margin-bottom: 2px;
  }
  .bd-app-shell .prop-page .row-client {
    font-size: 12px;
    color: var(--text-muted);
  }
  .bd-app-shell .prop-page .cell-value {
    font-family: var(--font-mono);
    text-align: right;
    font-weight: 500;
  }
  .bd-app-shell .prop-page .cell-muted {
    color: var(--text-muted);
  }
  .bd-app-shell .prop-page .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
  .bd-app-shell .prop-page .modal-backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }
  .bd-app-shell .prop-page .modal {
    width: 100%;
    max-width: 460px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4);
    transform: translateY(-10px) scale(0.98);
    transition: transform 0.15s ease;
  }
  .bd-app-shell .prop-page .modal-backdrop.open .modal {
    transform: translateY(0) scale(1);
  }
  .bd-app-shell .prop-page .modal.modal-lg {
    max-width: 720px;
  }
  .bd-app-shell .prop-page .modal-head {
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .bd-app-shell .prop-page .modal-head h3 {
    font-size: 15.5px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .bd-app-shell .prop-page .modal-body {
    padding: 20px;
    max-height: 65vh;
    overflow-y: auto;
  }
  .bd-app-shell .prop-page .modal-body p {
    font-size: 13.5px;
    color: var(--text-muted);
    line-height: 1.6;
  }
  .bd-app-shell .prop-page .modal-foot {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  .bd-app-shell .prop-page .slideover-close {
    color: var(--text-muted);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    flex-shrink: 0;
  }
  .bd-app-shell .prop-page .slideover-close:hover {
    background: var(--bg);
    color: var(--text);
  }
  .bd-app-shell .prop-page .field-group {
    margin-bottom: 16px;
  }
  .bd-app-shell .prop-page .field-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    margin-bottom: 7px;
    display: block;
  }
  .bd-app-shell .prop-page .field-input {
    width: 100%;
    padding: 9px 11px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 13.5px;
  }
  .bd-app-shell .prop-page .field-input:focus {
    border-color: var(--accent);
  }
  .bd-app-shell .prop-page .form-row {
    display: flex;
    gap: 10px;
  }
  .bd-app-shell .prop-page .form-row .field-group {
    flex: 1;
  }
  .bd-app-shell .prop-page .source-tabs {
    display: flex;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2px;
    margin-bottom: 16px;
  }
  .bd-app-shell .prop-page .source-tabs button {
    flex: 1;
    padding: 7px;
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .bd-app-shell .prop-page .source-tabs button.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .prop-page .preview-meta-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .bd-app-shell .prop-page .preview-items {
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .bd-app-shell .prop-page .preview-item-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 14px;
    font-size: 13px;
    border-bottom: 1px solid var(--border);
  }
  .bd-app-shell .prop-page .preview-item-row:last-child {
    border-bottom: none;
    background: var(--surface-raised);
    font-weight: 600;
  }
  .bd-app-shell .prop-page .preview-item-row .amount {
    font-family: var(--font-mono);
  }
  .bd-app-shell .prop-page .link-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    margin-bottom: 16px;
  }
  .bd-app-shell .prop-page .link-row span {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bd-app-shell .prop-page .link-row button {
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .bd-app-shell .prop-page .link-row button:hover {
    color: var(--accent);
  }
  @media (max-width: 760px) {
    .bd-app-shell .content {
      padding: 20px 16px 40px;
    }
    .bd-app-shell .prop-page .toolbar {
      flex-direction: column;
      align-items: stretch;
    }
    .bd-app-shell .prop-page .search-box {
      width: 100%;
    }
    .bd-app-shell .prop-page .form-row {
      flex-direction: column;
      gap: 0;
    }
  }
`;

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
    draft: 'pill-muted',
    sent: 'pill-muted',
    viewed: 'pill-accent',
    accepted: 'pill-success',
    rejected: 'pill-danger',
};

const STATUS_BORDER_COLOR: Record<ProposalStatus, string> = {
    draft: 'var(--text-muted)',
    sent: 'var(--text-muted)',
    viewed: 'var(--accent)',
    accepted: 'var(--success)',
    rejected: 'var(--danger)',
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
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newSource, setNewSource] = useState<'manual' | 'ai'>('manual');
    const [isGenerating, setIsGenerating] = useState(false);
    const [acceptedDocument, setAcceptedDocument] =
        useState<ProposalDocument | null>(null);
    const generateTimeoutRef = useRef<number | null>(null);
    const [formState, setFormState] = useState({
        title: '',
        client: '',
        value: '',
        brief: '',
    });

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
            setIsNewModalOpen(false);
            setAcceptedDocument(null);
        };

        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            if (generateTimeoutRef.current !== null) {
                window.clearTimeout(generateTimeoutRef.current);
            }

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
        let nextAcceptedDocument: ProposalDocument | null = null;

        setItems((currentItems) =>
            currentItems.map((document) => {
                if (document.id !== documentId || document.stage === nextStatus) {
                    return document;
                }

                const updatedDocument: ProposalDocument = {
                    ...document,
                    stage: nextStatus,
                    stageLabel: STATUS_LABEL[nextStatus],
                    tone: STATUS_TONE[nextStatus],
                };

                if (nextStatus === 'accepted') {
                    nextAcceptedDocument = updatedDocument;
                }

                return updatedDocument;
            }),
        );

        setMenuDocumentId(null);

        if (nextAcceptedDocument !== null) {
            setAcceptedDocument(nextAcceptedDocument);
        }
    };

    const closeNewModal = (): void => {
        if (generateTimeoutRef.current !== null) {
            window.clearTimeout(generateTimeoutRef.current);
            generateTimeoutRef.current = null;
        }

        setIsNewModalOpen(false);
        setNewSource('manual');
        setIsGenerating(false);
        setFormState({
            title: '',
            client: '',
            value: '',
            brief: '',
        });
    };

    const handleGenerateProposal = (): void => {
        const brief = formState.brief.trim();

        if (brief.length === 0 || isGenerating) {
            return;
        }

        setIsGenerating(true);

        generateTimeoutRef.current = window.setTimeout(() => {
            const generatedTitle =
                brief
                    .split(/\n|\./)
                    .find((line) => line.trim().length > 0)
                    ?.trim()
                    .slice(0, 60) || 'New Proposal';

            setFormState((currentState) => ({
                ...currentState,
                title: generatedTitle,
                client:
                    currentState.client.trim().length > 0
                        ? currentState.client
                        : 'New Client',
                value:
                    currentState.value.trim().length > 0
                        ? currentState.value
                        : '5000',
            }));
            setNewSource('manual');
            setIsGenerating(false);
            generateTimeoutRef.current = null;
        }, 900);
    };

    const handleCreateProposal = (): void => {
        const nextId = Math.max(...items.map((document) => document.id), 0) + 1;
        const rawValue = Number.parseInt(
            formState.value.replace(/[^0-9]/g, ''),
            10,
        );
        const amountValue = Number.isNaN(rawValue) ? 0 : rawValue;

        const newDocument: ProposalDocument = {
            id: nextId,
            title: formState.title.trim() || 'Untitled Proposal',
            number: `P-2026-${String(nextId).padStart(3, '0')}`,
            client: formState.client.trim() || 'Unknown Client',
            stage: 'draft',
            stageLabel: STATUS_LABEL.draft,
            tone: STATUS_TONE.draft,
            amount: formatCurrency(amountValue),
            amountValue,
            updatedAt: 'Just now',
            dateSort: 0,
            shareUrl: `https://biondesk.test/d/p-2026-${String(nextId).padStart(3, '0')}`,
            items: [
                {
                    label: 'Project scope',
                    amount: formatCurrency(amountValue),
                },
            ],
        };

        setItems((currentItems) => [...currentItems, newDocument]);
        setView('board');
        closeNewModal();
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

            <style>{proposalStyles}</style>

            <div className="prop-page">
                <p className="page-description">
                    Send proposals, track responses, and move straight to
                    invoicing once accepted.
                </p>

                <div className="toolbar">
                    <div className="toolbar-left">
                        <div className="view-toggle">
                            <button
                                type="button"
                                className={view === 'board' ? 'active' : ''}
                                onClick={() => setView('board')}
                            >
                                <ShellIcon icon="i-kanban" small />
                                Board
                            </button>
                            <button
                                type="button"
                                className={view === 'list' ? 'active' : ''}
                                onClick={() => setView('list')}
                            >
                                <ShellIcon icon="i-list" small />
                                List
                            </button>
                        </div>

                        <label className="search-box">
                            <ShellIcon icon="i-search" small />
                            <input
                                type="text"
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
                        className="btn btn-primary"
                        onClick={() => setIsNewModalOpen(true)}
                    >
                        <ShellIcon icon="i-plus" small />
                        New Proposal
                    </button>
                </div>

                <div className="view-area">
                    {view === 'board' ? (
                        <div className="board">
                            {boardColumns.map((column) => (
                                <div
                                    key={column.status}
                                    className="board-col"
                                    data-status={column.status}
                                >
                                    <div className="board-col-head">
                                        <span className="stage-label">
                                            <span
                                                className="dot"
                                                style={{
                                                    background:
                                                        STATUS_BORDER_COLOR[
                                                            column.status
                                                        ],
                                                }}
                                            />
                                            {column.label}
                                        </span>
                                        <span className="count">
                                            {column.items.length}
                                        </span>
                                    </div>

                                    <div
                                        className={`board-col-body ${
                                            dragOverStatus === column.status
                                                ? 'drag-over'
                                                : ''
                                        }`}
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
                                                className={`doc-card ${
                                                    draggedDocumentId ===
                                                    document.id
                                                        ? 'dragging'
                                                        : ''
                                                }`}
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
                                                <div className="doc-card-head">
                                                    <span className="doc-card-title">
                                                        {document.title}
                                                    </span>

                                                    <div
                                                        className="card-menu-wrap"
                                                        onClick={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className="card-menu-btn"
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
                                                            className={`card-menu-panel ${menuDocumentId === document.id ? 'open' : ''}`}
                                                        >
                                                            <div className="card-menu-label">
                                                                Move to
                                                            </div>
                                                            {BOARD_STATUSES.map(
                                                                (status) => (
                                                                    <button
                                                                        key={
                                                                            status
                                                                        }
                                                                        type="button"
                                                                        className="dropdown-item"
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

                                                <div className="doc-card-number">
                                                    {document.number}
                                                </div>
                                                <div className="doc-card-client">
                                                    {document.client}
                                                </div>

                                                <div className="doc-card-foot">
                                                    <span className="doc-card-date">
                                                        {document.updatedAt}
                                                    </span>
                                                    <span className="doc-card-value">
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
                        <div className="panel">
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Number</th>
                                            <th>Proposal</th>
                                            <th>Status</th>
                                            <th
                                                className="sortable"
                                                onClick={() =>
                                                    handleSort('amountValue')
                                                }
                                            >
                                                <span className="th-inner">
                                                    Value
                                                    <ShellIcon
                                                        icon="i-chevron-down"
                                                        small
                                                    />
                                                </span>
                                            </th>
                                            <th
                                                className="sortable"
                                                onClick={() =>
                                                    handleSort('dateSort')
                                                }
                                            >
                                                <span className="th-inner">
                                                    Created
                                                    <ShellIcon
                                                        icon="i-chevron-down"
                                                        small
                                                    />
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listDocuments.map((document) => (
                                            <tr
                                                key={document.id}
                                                onClick={() =>
                                                    openPreview(document.id)
                                                }
                                            >
                                                <td className="row-number">
                                                    {document.number}
                                                </td>
                                                <td>
                                                    <div className="row-title">
                                                        {document.title}
                                                    </div>
                                                    <div className="row-client">
                                                        {document.client}
                                                    </div>
                                                </td>
                                                <td>
                                                    <StatusPill
                                                        status={
                                                            document.stage as ProposalStatus
                                                        }
                                                    />
                                                </td>
                                                <td className="cell-value">
                                                    {document.amount}
                                                </td>
                                                <td className="cell-muted">
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
                    className={`modal-backdrop ${isNewModalOpen ? 'open' : ''}`}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            closeNewModal();
                        }
                    }}
                >
                    <div
                        className="modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-head">
                            <h3>New Proposal</h3>
                            <button
                                type="button"
                                className="slideover-close"
                                onClick={closeNewModal}
                            >
                                <ShellIcon icon="i-x" />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="source-tabs">
                                <button
                                    type="button"
                                    className={
                                        newSource === 'manual' ? 'active' : ''
                                    }
                                    onClick={() => setNewSource('manual')}
                                >
                                    <ShellIcon icon="i-edit" small />
                                    Write Manually
                                </button>
                                <button
                                    type="button"
                                    className={
                                        newSource === 'ai' ? 'active' : ''
                                    }
                                    onClick={() => setNewSource('ai')}
                                >
                                    <ShellIcon icon="i-sparkles" small />
                                    Generate with AI
                                </button>
                            </div>

                            {newSource === 'manual' ? (
                                <>
                                    <div className="field-group">
                                        <span className="field-label">
                                            Title
                                        </span>
                                        <input
                                            className="field-input"
                                            value={formState.title}
                                            onChange={(event) =>
                                                setFormState(
                                                    (currentState) => ({
                                                        ...currentState,
                                                        title: event
                                                            .currentTarget
                                                            .value,
                                                    }),
                                                )
                                            }
                                            placeholder="e.g. Website Redesign Proposal"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="field-group">
                                            <span className="field-label">
                                                Client
                                            </span>
                                            <input
                                                className="field-input"
                                                value={formState.client}
                                                onChange={(event) =>
                                                    setFormState(
                                                        (currentState) => ({
                                                            ...currentState,
                                                            client: event
                                                                .currentTarget
                                                                .value,
                                                        }),
                                                    )
                                                }
                                                placeholder="Client name"
                                            />
                                        </div>

                                        <div className="field-group">
                                            <span className="field-label">
                                                Value
                                            </span>
                                            <input
                                                className="field-input"
                                                value={formState.value}
                                                onChange={(event) =>
                                                    setFormState(
                                                        (currentState) => ({
                                                            ...currentState,
                                                            value: event
                                                                .currentTarget
                                                                .value,
                                                        }),
                                                    )
                                                }
                                                placeholder="$0"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="field-group">
                                        <span className="field-label">
                                            Paste a brief or job post
                                        </span>
                                        <textarea
                                            className="field-input"
                                            rows={5}
                                            value={formState.brief}
                                            onChange={(event) =>
                                                setFormState(
                                                    (currentState) => ({
                                                        ...currentState,
                                                        brief: event
                                                            .currentTarget
                                                            .value,
                                                    }),
                                                )
                                            }
                                            placeholder="Paste the client's brief, job post, or discovery call notes..."
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                        }}
                                        onClick={handleGenerateProposal}
                                        disabled={isGenerating}
                                    >
                                        <ShellIcon icon="i-sparkles" small />
                                        {isGenerating
                                            ? 'Generating...'
                                            : 'Generate proposal'}
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={closeNewModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleCreateProposal}
                            >
                                Create Proposal
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={`modal-backdrop ${previewDocument ? 'open' : ''}`}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setPreviewDocumentId(null);
                        }
                    }}
                >
                    <div
                        className="modal modal-lg"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {previewDocument ? (
                            <>
                                <div className="modal-head">
                                    <h3>{previewDocument.title}</h3>
                                    <button
                                        type="button"
                                        className="slideover-close"
                                        onClick={() =>
                                            setPreviewDocumentId(null)
                                        }
                                    >
                                        <ShellIcon icon="i-x" />
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="preview-meta-row">
                                        <StatusPill
                                            status={
                                                previewDocument.stage as ProposalStatus
                                            }
                                        />
                                        <span className="row-number">
                                            {previewDocument.number}
                                        </span>
                                        <span className="row-client">
                                            {previewDocument.client}
                                        </span>
                                    </div>

                                    <div className="link-row">
                                        <span>{previewDocument.shareUrl}</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void copyShareLink(
                                                    previewDocument.shareUrl,
                                                )
                                            }
                                        >
                                            <ShellIcon icon="i-copy" small />
                                        </button>
                                    </div>

                                    <div className="preview-items">
                                        {previewDocument.items.map((item) => (
                                            <PreviewItemRow
                                                key={item.label}
                                                item={item}
                                            />
                                        ))}
                                        <div className="preview-item-row">
                                            <span>Total</span>
                                            <span className="amount">
                                                {previewDocument.amount}
                                            </span>
                                        </div>
                                    </div>

                                    <p>
                                        Proposal shared{' '}
                                        {previewDocument.updatedAt} for{' '}
                                        {previewDocument.client}.
                                    </p>
                                </div>

                                <div className="modal-foot">
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                        onClick={() =>
                                            duplicateProposal(previewDocument)
                                        }
                                    >
                                        <ShellIcon icon="i-copy" small />
                                        Duplicate
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                        onClick={() =>
                                            deleteProposal(previewDocument.id)
                                        }
                                    >
                                        <ShellIcon icon="i-trash" small />
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
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
                    className={`modal-backdrop ${acceptedDocument ? 'open' : ''}`}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setAcceptedDocument(null);
                        }
                    }}
                >
                    <div
                        className="modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-head">
                            <h3>Nice, proposal accepted! 🎉</h3>
                        </div>

                        <div className="modal-body">
                            <p>
                                Want to move{' '}
                                <strong>
                                    {acceptedDocument?.title ?? 'this proposal'}
                                </strong>{' '}
                                forward now?
                            </p>
                        </div>

                        <div
                            className="modal-foot"
                            style={{
                                justifyContent: 'flex-start',
                            }}
                        >
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setAcceptedDocument(null)}
                            >
                                Not now
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setAcceptedDocument(null)}
                            >
                                Create Quote draft
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
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

function formatCurrency(value: number): string {
    return `$${value.toLocaleString('en-US')}`;
}

function StatusPill({ status }: { status: ProposalStatus }) {
    return (
        <span className={`pill ${STATUS_PILL_CLASS[status]}`}>
            <span className="dot" />
            {STATUS_LABEL[status]}
        </span>
    );
}

function PreviewItemRow({ item }: { item: ProposalLineItem }) {
    return (
        <div className="preview-item-row">
            <span>{item.label}</span>
            <span className="amount">{item.amount}</span>
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
        <svg className={`icon${small ? ' icon-sm' : ''}`}>
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
});
