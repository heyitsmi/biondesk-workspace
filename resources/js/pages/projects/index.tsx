import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { dashboard } from '@/routes';
import { index as projects, show as projectShow } from '@/routes/projects';
import type {
    BiondeskTone,
    ProjectItem,
    ProjectsPageProps,
} from '@/types';

const projectStyles = `
  .bd-app-shell .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 32px 24px;
    overflow: hidden;
    min-height: 0;
  }
  .bd-app-shell .proj-page {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .proj-page .page-description {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 14px;
    flex-shrink: 0;
  }
  .bd-app-shell .proj-page .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .bd-app-shell .proj-page .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .bd-app-shell .proj-page .view-toggle {
    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2px;
  }
  .bd-app-shell .proj-page .view-toggle button {
    padding: 6px 13px;
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .bd-app-shell .proj-page .view-toggle button.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .proj-page .search-box {
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
  .bd-app-shell .proj-page .search-box input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-size: 13px;
  }
  .bd-app-shell .proj-page .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    transition: opacity 0.12s ease, transform 0.1s ease;
  }
  .bd-app-shell .proj-page .btn:active {
    transform: scale(0.97);
  }
  .bd-app-shell .proj-page .btn-primary {
    background: var(--accent);
    color: var(--accent-text);
  }
  .bd-app-shell .proj-page .btn-primary:hover {
    opacity: 0.88;
  }
  .bd-app-shell .proj-page .btn-ghost {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .bd-app-shell .proj-page .btn-ghost:hover {
    background: var(--surface-raised);
  }
  .bd-app-shell .proj-page .view-area {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .proj-page .board {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    align-items: stretch;
    padding-bottom: 10px;
  }
  .bd-app-shell .proj-page .board-col {
    width: 272px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .bd-app-shell .proj-page .board-col-head {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px 12px;
  }
  .bd-app-shell .proj-page .stage-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
  }
  .bd-app-shell .proj-page .stage-label .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .bd-app-shell .proj-page .count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-muted);
  }
  .bd-app-shell .proj-page .board-col-body {
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
  .bd-app-shell .proj-page .board-col-body.drag-over {
    background: var(--accent-soft);
  }
  .bd-app-shell .proj-page .proj-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--border);
    border-radius: 10px;
    padding: 12px;
    cursor: pointer;
    transition: border-color 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  }
  .bd-app-shell .proj-page .proj-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-raised);
  }
  .bd-app-shell .proj-page .proj-card.dragging {
    opacity: 0.35;
  }
  .bd-app-shell .proj-page .proj-card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }
  .bd-app-shell .proj-page .proj-card-title {
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.35;
  }
  .bd-app-shell .proj-page .card-menu-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .bd-app-shell .proj-page .card-menu-btn {
    color: var(--text-muted);
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }
  .bd-app-shell .proj-page .card-menu-btn:hover {
    background: var(--bg);
    color: var(--text);
  }
  .bd-app-shell .proj-page .card-menu-panel {
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
  .bd-app-shell .proj-page .card-menu-panel.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  .bd-app-shell .proj-page .card-menu-label {
    font-size: 11px;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 6px 8px 4px;
  }
  .bd-app-shell .proj-page .card-menu-item {
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
  .bd-app-shell .proj-page .card-menu-item:hover {
    background: var(--bg);
  }
  .bd-app-shell .proj-page .proj-card-client {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 12px;
  }
  .bd-app-shell .proj-page .proj-progress-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 11px;
  }
  .bd-app-shell .proj-page .proj-progress-bar {
    flex: 1;
    height: 5px;
    background: var(--border);
    border-radius: 999px;
    overflow: hidden;
  }
  .bd-app-shell .proj-page .proj-progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 999px;
    transition: width 0.2s ease;
  }
  .bd-app-shell .proj-page .proj-progress-text {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .bd-app-shell .proj-page .proj-card-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
  }
  .bd-app-shell .proj-page .proj-card-due {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-muted);
  }
  .bd-app-shell .proj-page .proj-card-due .icon-sm {
    width: 12px;
    height: 12px;
  }
  .bd-app-shell .proj-page .reqlog-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--danger-soft);
    color: var(--danger);
    font-weight: 600;
  }
  .bd-app-shell .proj-page .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
    margin-bottom: 0;
  }
  .bd-app-shell .proj-page .table-wrap {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .bd-app-shell .proj-page .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  .bd-app-shell .proj-page .data-table thead {
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 5;
  }
  .bd-app-shell .proj-page .data-table th {
    text-align: left;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    user-select: none;
  }
  .bd-app-shell .proj-page .data-table th.sortable {
    cursor: pointer;
  }
  .bd-app-shell .proj-page .th-inner {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .bd-app-shell .proj-page .data-table td {
    padding: 13px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .bd-app-shell .proj-page .data-table tbody tr {
    cursor: pointer;
    transition: background 0.1s ease;
  }
  .bd-app-shell .proj-page .data-table tbody tr:hover td {
    background: var(--bg);
  }
  .bd-app-shell .proj-page .row-title {
    font-weight: 500;
    margin-bottom: 2px;
  }
  .bd-app-shell .proj-page .row-client,
  .bd-app-shell .proj-page .cell-muted {
    font-size: 12px;
    color: var(--text-muted);
  }
  .bd-app-shell .proj-page .table-progress {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 120px;
  }
  .bd-app-shell .proj-page .table-progress .proj-progress-bar {
    width: 60px;
    flex: 0 0 60px;
  }
  .bd-app-shell .proj-page .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 500;
    white-space: nowrap;
  }
  .bd-app-shell .proj-page .pill .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .bd-app-shell .proj-page .pill-accent {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .proj-page .pill-accent .dot {
    background: var(--accent);
  }
  .bd-app-shell .proj-page .pill-success {
    background: var(--success-soft);
    color: var(--success);
  }
  .bd-app-shell .proj-page .pill-success .dot {
    background: var(--success);
  }
  .bd-app-shell .proj-page .pill-danger {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .bd-app-shell .proj-page .pill-danger .dot {
    background: var(--danger);
  }
  .bd-app-shell .proj-page .pill-muted {
    background: var(--surface-raised);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .bd-app-shell .proj-page .pill-muted .dot {
    background: var(--text-muted);
  }
  .bd-app-shell .proj-page .slideover-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 90;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
  .bd-app-shell .proj-page .slideover-backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }
  .bd-app-shell .proj-page .slideover {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 400px;
    max-width: 90vw;
    background: var(--surface);
    border-left: 1px solid var(--border);
    box-shadow: -8px 0 40px rgba(0,0,0,0.3);
    transform: translateX(100%);
    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1);
    z-index: 95;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .proj-page .slideover-backdrop.open .slideover {
    transform: translateX(0);
  }
  .bd-app-shell .proj-page .slideover-head {
    padding: 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  .bd-app-shell .proj-page .slideover-head h2 {
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .bd-app-shell .proj-page .slideover-head p {
    font-size: 12.5px;
    color: var(--text-muted);
  }
  .bd-app-shell .proj-page .slideover-close {
    color: var(--text-muted);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    flex-shrink: 0;
  }
  .bd-app-shell .proj-page .slideover-close:hover {
    background: var(--bg);
    color: var(--text);
  }
  .bd-app-shell .proj-page .slideover-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .bd-app-shell .proj-page .field-group {
    margin-bottom: 20px;
  }
  .bd-app-shell .proj-page .field-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    margin-bottom: 7px;
    display: block;
  }
  .bd-app-shell .proj-page .field-select,
  .bd-app-shell .proj-page .field-input {
    width: 100%;
    padding: 9px 11px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 13.5px;
  }
  .bd-app-shell .proj-page .field-select:focus,
  .bd-app-shell .proj-page .field-input:focus {
    border-color: var(--accent);
  }
  .bd-app-shell .proj-page .sv-section {
    margin-bottom: 22px;
  }
  .bd-app-shell .proj-page .sv-section-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bd-app-shell .proj-page .task-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }
  .bd-app-shell .proj-page .task-row:last-child {
    border-bottom: none;
  }
  .bd-app-shell .proj-page .task-checkbox {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: transparent;
    transition: all 0.12s ease;
  }
  .bd-app-shell .proj-page .task-checkbox.checked {
    background: var(--success);
    border-color: var(--success);
    color: #fff;
  }
  .bd-app-shell .proj-page .task-title {
    font-size: 13px;
    flex: 1;
  }
  .bd-app-shell .proj-page .task-title.done {
    color: var(--text-muted);
    text-decoration: line-through;
  }
  .bd-app-shell .proj-page .task-add-row {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .bd-app-shell .proj-page .task-add-row input {
    flex: 1;
    padding: 7px 10px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: var(--bg);
    font-size: 13px;
    color: var(--text);
  }
  .bd-app-shell .proj-page .task-add-row button {
    padding: 7px 12px;
    border-radius: 7px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    font-size: 12.5px;
    font-weight: 600;
  }
  .bd-app-shell .proj-page .reqlog-item {
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 9px;
    margin-bottom: 8px;
  }
  .bd-app-shell .proj-page .reqlog-text {
    font-size: 12.5px;
    margin-bottom: 6px;
    line-height: 1.5;
  }
  .bd-app-shell .proj-page .reqlog-date {
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 9px;
  }
  .bd-app-shell .proj-page .reqlog-actions {
    display: flex;
    gap: 8px;
  }
  .bd-app-shell .proj-page .reqlog-actions button {
    flex: 1;
    padding: 6px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 600;
  }
  .bd-app-shell .proj-page .btn-convert {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .proj-page .btn-dismiss {
    background: var(--surface-raised);
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .bd-app-shell .proj-page .empty-note {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
    padding: 6px 0;
  }
  .bd-app-shell .proj-page .slideover-foot {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
  }
  .bd-app-shell .proj-page .slideover-foot .btn {
    flex: 1;
    justify-content: center;
  }
  .bd-app-shell .proj-page .modal-backdrop {
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
  .bd-app-shell .proj-page .modal-backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }
  .bd-app-shell .proj-page .modal {
    width: 100%;
    max-width: 440px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4);
    transform: translateY(-10px) scale(0.98);
    transition: transform 0.15s ease;
  }
  .bd-app-shell .proj-page .modal-backdrop.open .modal {
    transform: translateY(0) scale(1);
  }
  .bd-app-shell .proj-page .modal-head {
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bd-app-shell .proj-page .modal-head h3 {
    font-size: 15.5px;
    font-weight: 700;
  }
  .bd-app-shell .proj-page .modal-body {
    padding: 20px;
  }
  .bd-app-shell .proj-page .modal-foot {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  .bd-app-shell .proj-page .form-row {
    display: flex;
    gap: 10px;
  }
  .bd-app-shell .proj-page .form-row .field-group {
    flex: 1;
  }
  @media (max-width: 760px) {
    .bd-app-shell .content {
      padding: 20px 16px 40px;
    }
    .bd-app-shell .proj-page .toolbar {
      flex-direction: column;
      align-items: stretch;
    }
    .bd-app-shell .proj-page .search-box {
      width: 100%;
    }
    .bd-app-shell .proj-page .slideover {
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

export default function ProjectsPage({
    defaultView,
    stages,
    projects: initialProjects,
}: ProjectsPageProps) {
    const { currentTeam } = usePage().props;
    const [view, setView] = useState<'board' | 'list'>(defaultView);
    const [items, setItems] = useState(initialProjects);
    const [search, setSearch] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [draggedProjectId, setDraggedProjectId] = useState<number | null>(
        null,
    );
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [newProjectForm, setNewProjectForm] = useState({
        title: '',
        client: '',
        dueAt: '',
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
                item.client.toLowerCase().includes(query)
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
            return sortAsc
                ? left.dueOrder - right.dueOrder
                : right.dueOrder - left.dueOrder;
        });

        return sortedItems;
    }, [filteredItems, sortAsc]);

    useEffect(() => {
        const handleDocumentClick = (): void => {
            setMenuOpenId(null);
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const visitProjectDetail = (projectId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(projectShow({ current_team: currentTeam.slug, project: projectId }));
    };

    const projectProgress = (project: ProjectItem): { done: number; total: number; percent: number } => {
        const done = project.tasks.filter((task) => task.done).length;
        const total = project.tasks.length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        return { done, total, percent };
    };

    const setProjectStage = (projectId: number, stageKey: string): void => {
        setItems((current) =>
            current.map((item) => {
                if (item.id !== projectId) {
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
    };

    const handleDropToStage = (stageKey: string): void => {
        if (draggedProjectId !== null) {
            setProjectStage(draggedProjectId, stageKey);
        }

        setDraggedProjectId(null);
        setDragOverStage(null);
    };

    const createProject = (): void => {
        const title =
            newProjectForm.title.trim() === ''
                ? 'Untitled Project'
                : newProjectForm.title.trim();
        const client =
            newProjectForm.client.trim() === ''
                ? 'Unknown Client'
                : newProjectForm.client.trim();
        const dueAt =
            newProjectForm.dueAt.trim() === ''
                ? 'No due date'
                : newProjectForm.dueAt.trim();

        const dueOrder =
            Number(dueAt.match(/\d+/)?.[0] ?? '99') || 99;

        const nextId = Math.max(...items.map((item) => item.id)) + 1;

        setItems((current) => [
            ...current,
            {
                id: nextId,
                title,
                client,
                stage: 'not_started',
                stageLabel: stageMeta.not_started?.label ?? 'Not Started',
                tone: stageMeta.not_started?.tone ?? 'muted',
                progress: 0,
                dueAt,
                dueOrder,
                budget: '$0',
                requestLogCount: 0,
                tasks: [],
                requestLogs: [],
            },
        ]);

        setNewProjectForm({
            title: '',
            client: '',
            dueAt: '',
        });
        setShowNewProjectModal(false);
    };

    return (
        <>
            <Head title="Projects" />

            <style>{projectStyles}</style>

            <div className="proj-page">
                <p className="page-description">
                    Every project&apos;s execution, from tasks to client
                    requests, tracked in one place.
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
                                placeholder="Search projects or clients..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowNewProjectModal(true)}
                    >
                        <svg className="icon icon-sm">
                            <use href="#i-plus" />
                        </svg>
                        New Project
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
                                        {stage.items.map((item) => {
                                            const { done, total, percent } =
                                                projectProgress(item);

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    className={`proj-card ${
                                                        draggedProjectId ===
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
                                                        visitProjectDetail(item.id)
                                                    }
                                                    onDragStart={() =>
                                                        setDraggedProjectId(
                                                            item.id,
                                                        )
                                                    }
                                                    onDragEnd={() => {
                                                        setDraggedProjectId(
                                                            null,
                                                        );
                                                        setDragOverStage(null);
                                                    }}
                                                >
                                                    <div className="proj-card-head">
                                                        <span className="proj-card-title">
                                                            {item.title}
                                                        </span>

                                                        <div className="card-menu-wrap">
                                                            <button
                                                                type="button"
                                                                className="card-menu-btn"
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
                                                                <button
                                                                    type="button"
                                                                    className="card-menu-item"
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        event.stopPropagation();
                                                                        setMenuOpenId(null);
                                                                        visitProjectDetail(item.id);
                                                                    }}
                                                                >
                                                                    View detail
                                                                </button>
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
                                                                                setProjectStage(
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

                                                    <div className="proj-card-client">
                                                        {item.client}
                                                    </div>

                                                    <div className="proj-progress-row">
                                                        <div className="proj-progress-bar">
                                                            <div
                                                                className="proj-progress-fill"
                                                                style={{
                                                                    width: `${percent}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="proj-progress-text">
                                                            {done}/{total}
                                                        </span>
                                                    </div>

                                                    <div className="proj-card-foot">
                                                        <span className="proj-card-due">
                                                            <svg className="icon icon-sm">
                                                                <use href="#i-calendar" />
                                                            </svg>
                                                            {item.dueAt}
                                                        </span>
                                                        {item.requestLogs.length >
                                                        0 ? (
                                                            <span className="reqlog-badge">
                                                                {
                                                                    item.requestLogs
                                                                        .length
                                                                }{' '}
                                                                request
                                                                {item.requestLogs
                                                                    .length > 1
                                                                    ? 's'
                                                                    : ''}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </button>
                                            );
                                        })}
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
                                            <th>Project</th>
                                            <th>Status</th>
                                            <th>Progress</th>
                                            <th
                                                className="sortable"
                                                onClick={() =>
                                                    setSortAsc((current) => !current)
                                                }
                                            >
                                                <span className="th-inner">
                                                    Due Date
                                                    <svg className="icon icon-sm">
                                                        <use href="#i-chevron-down" />
                                                    </svg>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listItems.map((item) => {
                                            const { done, total, percent } =
                                                projectProgress(item);

                                            return (
                                                <tr
                                                    key={item.id}
                                                    onClick={() =>
                                                        visitProjectDetail(item.id)
                                                    }
                                                >
                                                    <td>
                                                        <div className="row-title">
                                                            {item.title}
                                                        </div>
                                                        <div className="row-client">
                                                            {item.client}
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
                                                    <td>
                                                        <div className="table-progress">
                                                            <div className="proj-progress-bar">
                                                                <div
                                                                    className="proj-progress-fill"
                                                                    style={{
                                                                        width: `${percent}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className="cell-muted"
                                                                style={{
                                                                    fontFamily:
                                                                        'var(--font-mono)',
                                                                    fontSize:
                                                                        '11px',
                                                                }}
                                                            >
                                                                {done}/{total}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="cell-muted">
                                                        {item.dueAt}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className={`modal-backdrop ${
                        showNewProjectModal ? 'open' : ''
                    }`}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowNewProjectModal(false);
                        }
                    }}
                >
                    <div className="modal">
                        <div className="modal-head">
                            <h3>New Project</h3>
                            <button
                                type="button"
                                className="slideover-close"
                                onClick={() => setShowNewProjectModal(false)}
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
                                    value={newProjectForm.title}
                                    onChange={(event) =>
                                        setNewProjectForm((current) => ({
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
                                        value={newProjectForm.client}
                                        onChange={(event) =>
                                            setNewProjectForm((current) => ({
                                                ...current,
                                                client: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="field-group">
                                    <span className="field-label">
                                        Due date
                                    </span>
                                    <input
                                        className="field-input"
                                        placeholder="e.g. Aug 15"
                                        value={newProjectForm.dueAt}
                                        onChange={(event) =>
                                            setNewProjectForm((current) => ({
                                                ...current,
                                                dueAt: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setShowNewProjectModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={createProject}
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

ProjectsPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Projects',
            href: props.currentTeam ? projects(props.currentTeam.slug) : '/',
        },
    ],
});
