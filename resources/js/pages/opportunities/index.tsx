import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { dashboard } from '@/routes';
import { index as opportunities } from '@/routes/opportunities';
import type {
    BiondeskTone,
    OpportunitiesPageProps,
    OpportunityItem,
} from '@/types';

const opportunityStyles = `
  .bd-app-shell .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 32px 24px;
    overflow: hidden;
    min-height: 0;
  }
  .bd-app-shell .opp-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
    min-height: 0;
  }
  .bd-app-shell .opp-page .page-description {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 14px;
    flex-shrink: 0;
  }
  .bd-app-shell .opp-page .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .bd-app-shell .opp-page .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .bd-app-shell .opp-page .view-toggle {
    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2px;
  }
  .bd-app-shell .opp-page .view-toggle button {
    padding: 6px 13px;
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .bd-app-shell .opp-page .view-toggle button.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .opp-page .search-box {
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
  .bd-app-shell .opp-page .search-box input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-size: 13px;
  }
  .bd-app-shell .opp-page .view-area {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .opp-page .btn-ghost {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .bd-app-shell .opp-page .btn-ghost:hover {
    background: var(--surface-raised);
  }
  .bd-app-shell .opp-page .board {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    align-items: stretch;
    padding-bottom: 10px;
  }
  .bd-app-shell .opp-page .board-col {
    width: 272px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .bd-app-shell .opp-page .board-col-head {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px 12px;
  }
  .bd-app-shell .opp-page .stage-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
  }
  .bd-app-shell .opp-page .stage-label .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .bd-app-shell .opp-page .count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-muted);
  }
  .bd-app-shell .opp-page .board-col-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 6px 4px 4px;
    border-radius: 10px;
    transition: background 0.12s ease;
  }
  .bd-app-shell .opp-page .board-col-body.drag-over {
    background: var(--accent-soft);
  }
  .bd-app-shell .opp-page .opp-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--border);
    border-radius: 10px;
    padding: 12px;
    cursor: pointer;
    transition: border-color 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  }
  .bd-app-shell .opp-page .opp-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-raised);
  }
  .bd-app-shell .opp-page .opp-card.dragging {
    opacity: 0.35;
  }
  .bd-app-shell .opp-page .opp-card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }
  .bd-app-shell .opp-page .opp-card-title {
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.35;
  }
  .bd-app-shell .opp-page .opp-card-menu-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .bd-app-shell .opp-page .opp-card-menu-btn {
    color: var(--text-muted);
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }
  .bd-app-shell .opp-page .opp-card-menu-btn:hover {
    background: var(--bg);
    color: var(--text);
  }
  .bd-app-shell .opp-page .card-menu-panel {
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
  .bd-app-shell .opp-page .card-menu-panel.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  .bd-app-shell .opp-page .card-menu-label {
    font-size: 11px;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 6px 8px 4px;
  }
  .bd-app-shell .opp-page .card-menu-item {
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
  .bd-app-shell .opp-page .card-menu-item:hover {
    background: var(--bg);
  }
  .bd-app-shell .opp-page .opp-card-client {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 12px;
  }
  .bd-app-shell .opp-page .opp-card-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
  }
  .bd-app-shell .opp-page .opp-card-source {
    color: var(--text-muted);
  }
  .bd-app-shell .opp-page .opp-card-value {
    font-family: var(--font-mono);
    font-weight: 600;
  }
  .bd-app-shell .opp-page .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
    margin-bottom: 0;
  }
  .bd-app-shell .opp-page .table-wrap {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .bd-app-shell .opp-page .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  .bd-app-shell .opp-page .data-table thead {
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 5;
  }
  .bd-app-shell .opp-page .data-table th {
    text-align: left;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    user-select: none;
  }
  .bd-app-shell .opp-page .data-table th.sortable {
    cursor: pointer;
  }
  .bd-app-shell .opp-page .th-inner {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .bd-app-shell .opp-page .data-table td {
    padding: 13px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .bd-app-shell .opp-page .data-table tbody tr {
    cursor: pointer;
    transition: background 0.1s ease;
  }
  .bd-app-shell .opp-page .data-table tbody tr:hover td {
    background: var(--bg);
  }
  .bd-app-shell .opp-page .row-title {
    font-weight: 500;
    margin-bottom: 2px;
  }
  .bd-app-shell .opp-page .row-client,
  .bd-app-shell .opp-page .cell-source {
    font-size: 12px;
    color: var(--text-muted);
  }
  .bd-app-shell .opp-page .cell-value {
    font-family: var(--font-mono);
    text-align: right;
    font-weight: 500;
  }
  .bd-app-shell .opp-page .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 500;
    white-space: nowrap;
  }
  .bd-app-shell .opp-page .pill .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .bd-app-shell .opp-page .pill-accent {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .opp-page .pill-accent .dot {
    background: var(--accent);
  }
  .bd-app-shell .opp-page .pill-success {
    background: var(--success-soft);
    color: var(--success);
  }
  .bd-app-shell .opp-page .pill-success .dot {
    background: var(--success);
  }
  .bd-app-shell .opp-page .pill-danger {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .bd-app-shell .opp-page .pill-danger .dot {
    background: var(--danger);
  }
  .bd-app-shell .opp-page .pill-muted {
    background: var(--surface-raised);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .bd-app-shell .opp-page .pill-muted .dot {
    background: var(--text-muted);
  }
  .bd-app-shell .opp-page .slideover-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 90;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
  .bd-app-shell .opp-page .slideover-backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }
  .bd-app-shell .opp-page .slideover {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 400px;
    max-width: 90vw;
    background: var(--surface);
    border-left: 1px solid var(--border);
    box-shadow: -8px 0 40px rgba(0, 0, 0, 0.3);
    transform: translateX(100%);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 95;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .opp-page .slideover-backdrop.open .slideover {
    transform: translateX(0);
  }
  .bd-app-shell .opp-page .slideover-head {
    padding: 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  .bd-app-shell .opp-page .slideover-head h2 {
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .bd-app-shell .opp-page .slideover-head p {
    font-size: 12.5px;
    color: var(--text-muted);
  }
  .bd-app-shell .opp-page .slideover-close {
    color: var(--text-muted);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    flex-shrink: 0;
  }
  .bd-app-shell .opp-page .slideover-close:hover {
    background: var(--bg);
    color: var(--text);
  }
  .bd-app-shell .opp-page .slideover-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .bd-app-shell .opp-page .field-group {
    margin-bottom: 18px;
  }
  .bd-app-shell .opp-page .field-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    margin-bottom: 7px;
    display: block;
  }
  .bd-app-shell .opp-page .field-value {
    font-size: 14px;
  }
  .bd-app-shell .opp-page .field-value.mono {
    font-family: var(--font-mono);
  }
  .bd-app-shell .opp-page .field-select,
  .bd-app-shell .opp-page .field-input {
    width: 100%;
    padding: 9px 11px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 13.5px;
  }
  .bd-app-shell .opp-page textarea.field-input {
    min-height: 110px;
    resize: vertical;
  }
  .bd-app-shell .opp-page .field-select:focus,
  .bd-app-shell .opp-page .field-input:focus {
    border-color: var(--accent);
  }
  .bd-app-shell .opp-page .slideover-foot {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
  }
  .bd-app-shell .opp-page .slideover-foot .btn {
    flex: 1;
    justify-content: center;
  }
  .bd-app-shell .opp-page .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
  .bd-app-shell .opp-page .modal-backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }
  .bd-app-shell .opp-page .modal {
    width: 100%;
    max-width: 440px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
    transform: translateY(-10px) scale(0.98);
    transition: transform 0.15s ease;
  }
  .bd-app-shell .opp-page .modal-backdrop.open .modal {
    transform: translateY(0) scale(1);
  }
  .bd-app-shell .opp-page .modal-head {
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bd-app-shell .opp-page .modal-head h3 {
    font-size: 15.5px;
    font-weight: 700;
  }
  .bd-app-shell .opp-page .modal-body {
    padding: 20px;
  }
  .bd-app-shell .opp-page .modal-body p {
    font-size: 13.5px;
    color: var(--text-muted);
    line-height: 1.6;
  }
  .bd-app-shell .opp-page .modal-foot {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  .bd-app-shell .opp-page .form-row {
    display: flex;
    gap: 10px;
  }
  .bd-app-shell .opp-page .form-row .field-group {
    flex: 1;
  }
  .bd-app-shell .opp-page .empty-state {
    border: 1px dashed var(--border);
    border-radius: 10px;
    padding: 18px 14px;
    text-align: center;
    color: var(--text-muted);
    font-size: 12.5px;
  }
  @media (max-width: 760px) {
    .bd-app-shell .content {
      padding: 20px 16px 40px;
    }
    .bd-app-shell .opp-page .toolbar {
      flex-direction: column;
      align-items: stretch;
    }
    .bd-app-shell .opp-page .search-box {
      width: 100%;
    }
    .bd-app-shell .opp-page .slideover {
      width: 100%;
      max-width: 100%;
    }
  }
`;

const toneClassMap: Record<BiondeskTone, string> = {
    accent: 'pill-accent',
    success: 'pill-success',
    danger: 'pill-danger',
    muted: 'pill-muted',
};

const toneColorMap: Record<BiondeskTone, string> = {
    accent: 'var(--accent)',
    success: 'var(--success)',
    danger: 'var(--danger)',
    muted: 'var(--text-muted)',
};

const sourceOptions = ['Upwork', 'Referral', 'LinkedIn', 'Direct', 'Other'];

type SortKey = 'value' | 'activity';

export default function OpportunitiesPage({
    defaultView,
    stages,
    opportunities: initialOpportunities,
}: OpportunitiesPageProps) {
    const [view, setView] = useState<'board' | 'list'>(defaultView);
    const [items, setItems] = useState(initialOpportunities);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({
        key: 'value',
        asc: true,
    });
    const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);
    const [detailStage, setDetailStage] = useState('');
    const [detailNotes, setDetailNotes] = useState('');
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [draggedOpportunityId, setDraggedOpportunityId] =
        useState<number | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    const [showNewOpportunityModal, setShowNewOpportunityModal] = useState(false);
    const [showConfirmProjectModal, setShowConfirmProjectModal] = useState<string | null>(null);
    const [newOpportunityForm, setNewOpportunityForm] = useState({
        title: '',
        client: '',
        value: '',
        source: sourceOptions[0],
    });

    const stageMeta = useMemo(() => {
        return Object.fromEntries(
            stages.map((stage) => [
                stage.key,
                { label: stage.label, tone: stage.tone },
            ]),
        ) as Record<string, { label: string; tone: BiondeskTone }>;
    }, [stages]);

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (query === '') {
            return items;
        }

        return items.filter((item) => {
            return (
                item.title.toLowerCase().includes(query) ||
                item.company.toLowerCase().includes(query)
            );
        });
    }, [items, search]);

    const groupedItems = useMemo(() => {
        return stages.map((stage) => ({
            ...stage,
            items: filteredItems.filter((item) => item.stage === stage.key),
        }));
    }, [filteredItems, stages]);

    const listItems = useMemo(() => {
        const sortedItems = [...filteredItems];

        sortedItems.sort((left, right) => {
            const leftValue =
                sort.key === 'value' ? left.amountValue : left.activityOrder;
            const rightValue =
                sort.key === 'value' ? right.amountValue : right.activityOrder;

            return sort.asc ? leftValue - rightValue : rightValue - leftValue;
        });

        return sortedItems;
    }, [filteredItems, sort]);

    const selectedOpportunity = useMemo(() => {
        if (selectedOpportunityId === null) {
            return null;
        }

        return items.find((item) => item.id === selectedOpportunityId) ?? null;
    }, [items, selectedOpportunityId]);

    useEffect(() => {
        if (!selectedOpportunity) {
            return;
        }

        setDetailStage(selectedOpportunity.stage);
        setDetailNotes(selectedOpportunity.summary);
    }, [selectedOpportunity]);

    useEffect(() => {
        const handleDocumentClick = (): void => {
            setMenuOpenId(null);
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const setOpportunityStage = (opportunityId: number, stageKey: string): void => {
        setItems((current) =>
            current.map((item) => {
                if (item.id !== opportunityId) {
                    return item;
                }

                return {
                    ...item,
                    stage: stageKey,
                    stageLabel: stageMeta[stageKey]?.label ?? item.stageLabel,
                    tone: stageMeta[stageKey]?.tone ?? item.tone,
                };
            }),
        );

        const movedOpportunity = items.find((item) => item.id === opportunityId);

        if (movedOpportunity && movedOpportunity.stage !== 'won' && stageKey === 'won') {
            setShowConfirmProjectModal(movedOpportunity.title);
        }
    };

    const openOpportunityDetail = (opportunityId: number): void => {
        setSelectedOpportunityId(opportunityId);
        setMenuOpenId(null);
    };

    const handleDropToStage = (stageKey: string): void => {
        if (draggedOpportunityId !== null) {
            setOpportunityStage(draggedOpportunityId, stageKey);
        }

        setDraggedOpportunityId(null);
        setDragOverStage(null);
    };

    const saveOpportunityDetail = (): void => {
        if (!selectedOpportunity) {
            return;
        }

        const originalStage = selectedOpportunity.stage;

        setItems((current) =>
            current.map((item) => {
                if (item.id !== selectedOpportunity.id) {
                    return item;
                }

                return {
                    ...item,
                    stage: detailStage,
                    stageLabel: stageMeta[detailStage]?.label ?? item.stageLabel,
                    tone: stageMeta[detailStage]?.tone ?? item.tone,
                    summary: detailNotes,
                };
            }),
        );

        if (originalStage !== 'won' && detailStage === 'won') {
            setShowConfirmProjectModal(selectedOpportunity.title);
        }

        setSelectedOpportunityId(null);
    };

    const createOpportunity = (): void => {
        if (
            newOpportunityForm.title.trim() === '' ||
            newOpportunityForm.client.trim() === ''
        ) {
            return;
        }

        const valueText =
            newOpportunityForm.value.trim() === '' ? '$0' : newOpportunityForm.value.trim();
        const numericValue = Number(valueText.replace(/[^0-9.]/g, '')) || 0;

        const newOpportunity: OpportunityItem = {
            id: Math.max(...items.map((item) => item.id)) + 1,
            title: newOpportunityForm.title.trim(),
            company: newOpportunityForm.client.trim(),
            contact: newOpportunityForm.client.trim(),
            source: newOpportunityForm.source,
            amount: valueText.startsWith('$') ? valueText : `$${valueText}`,
            amountValue: numericValue,
            stage: 'inbox',
            stageLabel: stageMeta.inbox?.label ?? 'Inbox',
            tone: stageMeta.inbox?.tone ?? 'muted',
            lastActivity: 'Just now',
            activityOrder: 0,
            summary: 'New opportunity created from the scaffold modal.',
        };

        setItems((current) => [newOpportunity, ...current]);
        setShowNewOpportunityModal(false);
        setNewOpportunityForm({
            title: '',
            client: '',
            value: '',
            source: sourceOptions[0],
        });
    };

    const toggleSort = (key: SortKey): void => {
        setSort((current) => ({
            key,
            asc: current.key === key ? !current.asc : true,
        }));
    };

    return (
        <>
            <Head title="Opportunities" />

            <style>{opportunityStyles}</style>

            <div className="opp-page">
                <p className="page-description">
                    Track leads from any source, from first contact to won or
                    lost.
                </p>

                <div className="toolbar">
                    <div className="toolbar-left">
                        <div className="view-toggle">
                            <button
                                type="button"
                                className={view === 'board' ? 'active' : undefined}
                                onClick={() => setView('board')}
                            >
                                <svg className="icon icon-sm">
                                    <use href="#i-kanban" />
                                </svg>
                                Board
                            </button>
                            <button
                                type="button"
                                className={view === 'list' ? 'active' : undefined}
                                onClick={() => setView('list')}
                            >
                                <svg className="icon icon-sm">
                                    <use href="#i-list" />
                                </svg>
                                List
                            </button>
                        </div>

                        <label className="search-box">
                            <svg className="icon icon-sm">
                                <use href="#i-search" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search opportunities or clients..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowNewOpportunityModal(true)}
                    >
                        <svg className="icon icon-sm">
                            <use href="#i-plus" />
                        </svg>
                        New Opportunity
                    </button>
                </div>

                <div className="view-area">
                    {view === 'board' ? (
                        <div className="board">
                            {groupedItems.map((stage) => (
                                <div key={stage.key} className="board-col">
                                    <div className="board-col-head">
                                        <span className="stage-label">
                                            <span
                                                className="dot"
                                                style={{
                                                    background:
                                                        toneColorMap[stage.tone],
                                                }}
                                            />
                                            {stage.label}
                                        </span>
                                        <span className="count">
                                            {stage.items.length}
                                        </span>
                                    </div>

                                    <div
                                        className={`board-col-body ${
                                            dragOverStage === stage.key
                                                ? 'drag-over'
                                                : ''
                                        }`}
                                        onDragOver={(event) => {
                                            event.preventDefault();
                                            setDragOverStage(stage.key);
                                        }}
                                        onDragLeave={(event) => {
                                            if (
                                                event.currentTarget ===
                                                event.target
                                            ) {
                                                setDragOverStage(null);
                                            }
                                        }}
                                        onDrop={() =>
                                            handleDropToStage(stage.key)
                                        }
                                    >
                                        {stage.items.length > 0 ? (
                                            stage.items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    className={`opp-card ${
                                                        draggedOpportunityId ===
                                                        item.id
                                                            ? 'dragging'
                                                            : ''
                                                    }`}
                                                    draggable
                                                    style={{
                                                        borderLeftColor:
                                                            toneColorMap[
                                                                item.tone
                                                            ],
                                                    }}
                                                    onClick={() =>
                                                        openOpportunityDetail(
                                                            item.id,
                                                        )
                                                    }
                                                    onDragStart={() =>
                                                        setDraggedOpportunityId(
                                                            item.id,
                                                        )
                                                    }
                                                    onDragEnd={() => {
                                                        setDraggedOpportunityId(
                                                            null,
                                                        );
                                                        setDragOverStage(null);
                                                    }}
                                                >
                                                    <div className="opp-card-head">
                                                        <span className="opp-card-title">
                                                            {item.title}
                                                        </span>

                                                        <div className="opp-card-menu-wrap">
                                                            <button
                                                                type="button"
                                                                className="opp-card-menu-btn"
                                                                onClick={(
                                                                    event,
                                                                ) => {
                                                                    event.stopPropagation();
                                                                    setMenuOpenId(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            current ===
                                                                            item.id
                                                                                ? null
                                                                                : item.id,
                                                                    );
                                                                }}
                                                            >
                                                                <svg className="icon icon-sm">
                                                                    <use href="#i-more" />
                                                                </svg>
                                                            </button>

                                                            <div
                                                                className={`card-menu-panel ${
                                                                    menuOpenId ===
                                                                    item.id
                                                                        ? 'open'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <div className="card-menu-label">
                                                                    Move to
                                                                </div>

                                                                {stages.map(
                                                                    (
                                                                        availableStage,
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                availableStage.key
                                                                            }
                                                                            type="button"
                                                                            className="card-menu-item"
                                                                            onClick={(
                                                                                event,
                                                                            ) => {
                                                                                event.stopPropagation();
                                                                                setMenuOpenId(
                                                                                    null,
                                                                                );
                                                                                setOpportunityStage(
                                                                                    item.id,
                                                                                    availableStage.key,
                                                                                );
                                                                            }}
                                                                        >
                                                                            {
                                                                                availableStage.label
                                                                            }
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="opp-card-client">
                                                        {item.company}
                                                    </div>

                                                    <div className="opp-card-foot">
                                                        <span className="opp-card-source">
                                                            {item.source}
                                                        </span>
                                                        <span className="opp-card-value">
                                                            {item.amount}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="empty-state">
                                                No visible opportunities.
                                            </div>
                                        )}
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
                                            <th>Opportunity</th>
                                            <th>Stage</th>
                                            <th>Source</th>
                                            <th
                                                className="sortable"
                                                onClick={() =>
                                                    toggleSort('value')
                                                }
                                            >
                                                <span className="th-inner">
                                                    Value
                                                    <svg className="icon icon-sm">
                                                        <use href="#i-chevron-down" />
                                                    </svg>
                                                </span>
                                            </th>
                                            <th
                                                className="sortable"
                                                onClick={() =>
                                                    toggleSort('activity')
                                                }
                                            >
                                                <span className="th-inner">
                                                    Last Activity
                                                    <svg className="icon icon-sm">
                                                        <use href="#i-chevron-down" />
                                                    </svg>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                onClick={() =>
                                                    openOpportunityDetail(
                                                        item.id,
                                                    )
                                                }
                                            >
                                                <td>
                                                    <div className="row-title">
                                                        {item.title}
                                                    </div>
                                                    <div className="row-client">
                                                        {item.company}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`pill ${
                                                            toneClassMap[
                                                                item.tone
                                                            ]
                                                        }`}
                                                    >
                                                        <span className="dot" />
                                                        {item.stageLabel}
                                                    </span>
                                                </td>
                                                <td className="cell-source">
                                                    {item.source}
                                                </td>
                                                <td className="cell-value">
                                                    {item.amount}
                                                </td>
                                                <td className="cell-source">
                                                    {item.lastActivity}
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
                    className={`slideover-backdrop ${
                        selectedOpportunity ? 'open' : ''
                    }`}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedOpportunityId(null);
                        }
                    }}
                >
                    <aside className="slideover">
                        {selectedOpportunity ? (
                            <>
                                <div className="slideover-head">
                                    <div>
                                        <h2>{selectedOpportunity.title}</h2>
                                        <p>{selectedOpportunity.company}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="slideover-close"
                                        onClick={() =>
                                            setSelectedOpportunityId(null)
                                        }
                                    >
                                        <svg className="icon">
                                            <use href="#i-x" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="slideover-body">
                                    <div className="field-group">
                                        <span className="field-label">
                                            Stage
                                        </span>
                                        <select
                                            className="field-select"
                                            value={detailStage}
                                            onChange={(event) =>
                                                setDetailStage(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {stages.map((stage) => (
                                                <option
                                                    key={stage.key}
                                                    value={stage.key}
                                                >
                                                    {stage.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="field-group">
                                        <span className="field-label">
                                            Value
                                        </span>
                                        <span className="field-value mono">
                                            {selectedOpportunity.amount}
                                        </span>
                                    </div>

                                    <div className="field-group">
                                        <span className="field-label">
                                            Source
                                        </span>
                                        <span className="field-value">
                                            {selectedOpportunity.source}
                                        </span>
                                    </div>

                                    <div className="field-group">
                                        <span className="field-label">
                                            Last activity
                                        </span>
                                        <span className="field-value">
                                            {selectedOpportunity.lastActivity}
                                        </span>
                                    </div>

                                    <div className="field-group">
                                        <span className="field-label">
                                            Notes
                                        </span>
                                        <textarea
                                            className="field-input"
                                            value={detailNotes}
                                            onChange={(event) =>
                                                setDetailNotes(
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="slideover-foot">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() =>
                                            setSelectedOpportunityId(null)
                                        }
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={saveOpportunityDetail}
                                    >
                                        Save changes
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </aside>
                </div>

                <div
                    className={`modal-backdrop ${
                        showNewOpportunityModal ? 'open' : ''
                    }`}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowNewOpportunityModal(false);
                        }
                    }}
                >
                    <div className="modal">
                        <div className="modal-head">
                            <h3>New Opportunity</h3>
                            <button
                                type="button"
                                className="slideover-close"
                                onClick={() =>
                                    setShowNewOpportunityModal(false)
                                }
                            >
                                <svg className="icon">
                                    <use href="#i-x" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="field-group">
                                <span className="field-label">Title</span>
                                <input
                                    className="field-input"
                                    placeholder="e.g. Website Redesign"
                                    value={newOpportunityForm.title}
                                    onChange={(event) =>
                                        setNewOpportunityForm((current) => ({
                                            ...current,
                                            title: event.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="form-row">
                                <div className="field-group">
                                    <span className="field-label">Client</span>
                                    <input
                                        className="field-input"
                                        placeholder="Client name"
                                        value={newOpportunityForm.client}
                                        onChange={(event) =>
                                            setNewOpportunityForm(
                                                (current) => ({
                                                    ...current,
                                                    client: event.target.value,
                                                }),
                                            )
                                        }
                                    />
                                </div>

                                <div className="field-group">
                                    <span className="field-label">Value</span>
                                    <input
                                        className="field-input"
                                        placeholder="$0"
                                        value={newOpportunityForm.value}
                                        onChange={(event) =>
                                            setNewOpportunityForm(
                                                (current) => ({
                                                    ...current,
                                                    value: event.target.value,
                                                }),
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <span className="field-label">Source</span>
                                <select
                                    className="field-select"
                                    value={newOpportunityForm.source}
                                    onChange={(event) =>
                                        setNewOpportunityForm((current) => ({
                                            ...current,
                                            source: event.target.value,
                                        }))
                                    }
                                >
                                    {sourceOptions.map((source) => (
                                        <option key={source} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() =>
                                    setShowNewOpportunityModal(false)
                                }
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={createOpportunity}
                            >
                                Create Opportunity
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={`modal-backdrop ${
                        showConfirmProjectModal ? 'open' : ''
                    }`}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowConfirmProjectModal(null);
                        }
                    }}
                >
                    <div className="modal">
                        <div className="modal-head">
                            <h3>Nice, deal won!</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                Want to create a Project for{' '}
                                <strong>{showConfirmProjectModal}</strong> now,
                                so you can start tracking tasks right away?
                            </p>
                        </div>
                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() =>
                                    setShowConfirmProjectModal(null)
                                }
                            >
                                Not now
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                    setShowConfirmProjectModal(null)
                                }
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

OpportunitiesPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Opportunities',
            href: props.currentTeam ? opportunities(props.currentTeam.slug) : '/',
        },
    ],
});
