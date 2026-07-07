import { Head } from '@inertiajs/react';
import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { dashboard } from '@/routes';
import { index as projects, show as projectShow } from '@/routes/projects';
import type {
    BiondeskTone,
    ProjectAttachment,
    ProjectDetailRequestLog,
    ProjectDetailTask,
    ProjectRequestClassification,
    ProjectRequestSource,
    ProjectShowPageProps,
    ProjectTaskStatus,
} from '@/types';

const projectShowStyles = `
  .bd-app-shell .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 32px 24px;
    overflow: hidden;
    min-height: 0;
  }
  .bd-app-shell .project-show-page {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .detail-header-mini {
    flex-shrink: 0;
    margin-bottom: 16px;
  }
  .bd-app-shell .detail-header-mini h1 {
    font-size: 21px;
    font-weight: 700;
    margin-bottom: 5px;
  }
  .bd-app-shell .client-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--text-muted);
    flex-wrap: wrap;
  }
  .bd-app-shell .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 500;
    white-space: nowrap;
  }
  .bd-app-shell .pill .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .bd-app-shell .pill-accent {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .pill-accent .dot { background: var(--accent); }
  .bd-app-shell .pill-success {
    background: var(--success-soft);
    color: var(--success);
  }
  .bd-app-shell .pill-success .dot { background: var(--success); }
  .bd-app-shell .pill-danger {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .bd-app-shell .pill-danger .dot { background: var(--danger); }
  .bd-app-shell .pill-muted {
    background: var(--surface-raised);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .bd-app-shell .pill-muted .dot { background: var(--text-muted); }
  .bd-app-shell .tab-nav {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 18px;
    flex-shrink: 0;
    overflow-x: auto;
  }
  .bd-app-shell .tab-btn {
    padding: 10px 2px;
    margin-right: 24px;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text-muted);
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  .bd-app-shell .tab-btn:hover { color: var(--text); }
  .bd-app-shell .tab-btn.active {
    color: var(--text);
    border-bottom-color: var(--accent);
  }
  .bd-app-shell .tab-panels {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bd-app-shell .tab-panel {
    display: none;
    height: 100%;
    flex-direction: column;
    min-height: 0;
  }
  .bd-app-shell .tab-panel.active { display: flex; }
  .bd-app-shell .details-form {
    max-width: 460px;
    overflow-y: auto;
  }
  .bd-app-shell .field-group { margin-bottom: 18px; }
  .bd-app-shell .field-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    margin-bottom: 7px;
    display: block;
  }
  .bd-app-shell select.field-select,
  .bd-app-shell input.field-input,
  .bd-app-shell textarea.field-input {
    width: 100%;
    padding: 9px 11px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 13.5px;
  }
  .bd-app-shell select.field-select:focus,
  .bd-app-shell input.field-input:focus,
  .bd-app-shell textarea.field-input:focus {
    border-color: var(--accent);
  }
  .bd-app-shell .form-row { display: flex; gap: 12px; }
  .bd-app-shell .form-row .field-group { flex: 1; }
  .bd-app-shell .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    transition: opacity 0.12s ease, transform 0.1s ease;
  }
  .bd-app-shell .btn:active { transform: scale(0.97); }
  .bd-app-shell .btn:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  .bd-app-shell .btn-primary {
    background: var(--accent);
    color: var(--accent-text);
  }
  .bd-app-shell .btn-primary:hover { opacity: 0.88; }
  .bd-app-shell .btn-ghost {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .bd-app-shell .btn-ghost:hover { background: var(--surface-raised); }
  .bd-app-shell .btn-sm {
    padding: 6px 12px;
    font-size: 12.5px;
  }
  .bd-app-shell .task-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .bd-app-shell .view-toggle {
    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2px;
  }
  .bd-app-shell .view-toggle button {
    padding: 6px 13px;
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .bd-app-shell .view-toggle button.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .task-toolbar-right {
    display: flex;
    gap: 8px;
  }
  .bd-app-shell .task-add-row {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
    flex-shrink: 0;
  }
  .bd-app-shell .task-add-row input {
    flex: 1;
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 13px;
  }
  .bd-app-shell .task-board {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 14px;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .bd-app-shell .task-col {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .bd-app-shell .task-col-head {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 4px 10px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .bd-app-shell .task-col-head .count {
    margin-left: auto;
    font-family: var(--font-mono);
  }
  .bd-app-shell .task-col-head .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .bd-app-shell .task-col-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px;
    border-radius: 8px;
    transition: background 0.12s ease;
  }
  .bd-app-shell .task-col-body.drag-over { background: var(--accent-soft); }
  .bd-app-shell .task-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 9px;
    padding: 10px 11px;
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.12s ease;
  }
  .bd-app-shell .task-card:hover { border-color: var(--accent); }
  .bd-app-shell .task-card.dragging { opacity: 0.35; }
  .bd-app-shell .task-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .bd-app-shell .task-delete {
    opacity: 0;
    color: var(--text-muted);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    flex-shrink: 0;
    transition: opacity 0.12s ease;
  }
  .bd-app-shell .task-card:hover .task-delete { opacity: 1; }
  .bd-app-shell .task-delete:hover {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .bd-app-shell .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }
  .bd-app-shell .table-wrap {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .bd-app-shell .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  .bd-app-shell .data-table thead {
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 5;
  }
  .bd-app-shell .data-table th {
    text-align: left;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }
  .bd-app-shell .data-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .bd-app-shell .data-table tbody tr:last-child td { border-bottom: none; }
  .bd-app-shell select.status-inline {
    padding: 5px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg);
    font-size: 12.5px;
  }
  .bd-app-shell .reqlog-toolbar {
    flex-shrink: 0;
    margin-bottom: 14px;
  }
  .bd-app-shell .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    margin-bottom: 12px;
    color: var(--text-muted);
  }
  .bd-app-shell .search-box input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-size: 13px;
  }
  .bd-app-shell .chip-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .bd-app-shell .chip {
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12.5px;
    font-weight: 500;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .bd-app-shell .chip.active {
    background: var(--text);
    color: var(--bg);
    border-color: var(--text);
  }
  .bd-app-shell .reqlog-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .bd-app-shell .reqlog-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 10px;
    background: var(--surface);
  }
  .bd-app-shell .reqlog-main {
    flex: 1;
    min-width: 0;
  }
  .bd-app-shell .reqlog-text {
    font-size: 13.5px;
    font-weight: 500;
    margin-bottom: 6px;
  }
  .bd-app-shell .reqlog-meta {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: var(--text-muted);
    flex-wrap: wrap;
  }
  .bd-app-shell .class-badge {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    flex-shrink: 0;
  }
  .bd-app-shell .class-new {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-app-shell .class-duplicate,
  .bd-app-shell .class-related {
    background: var(--surface-raised);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .bd-app-shell .class-contradiction {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .bd-app-shell .reqlog-actions-row {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .bd-app-shell .empty-note {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
    padding: 6px 0;
  }
  .bd-app-shell .activity-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    max-width: 560px;
  }
  .bd-app-shell .feed-item {
    display: flex;
    gap: 12px;
    padding: 11px 4px;
  }
  .bd-app-shell .feed-dot-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding-top: 3px;
  }
  .bd-app-shell .feed-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--border);
  }
  .bd-app-shell .feed-dot.accent { background: var(--accent); }
  .bd-app-shell .feed-dot.success { background: var(--success); }
  .bd-app-shell .feed-dot.danger { background: var(--danger); }
  .bd-app-shell .feed-line {
    width: 1px;
    flex: 1;
    background: var(--border);
    margin-top: 4px;
  }
  .bd-app-shell .feed-text {
    font-size: 13px;
    margin-bottom: 2px;
  }
  .bd-app-shell .feed-time {
    font-size: 11.5px;
    color: var(--text-muted);
  }
  .bd-app-shell .modal-backdrop {
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
  .bd-app-shell .modal-backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }
  .bd-app-shell .modal {
    width: 100%;
    max-width: 440px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4);
    transform: translateY(-10px) scale(0.98);
    transition: transform 0.15s ease;
  }
  .bd-app-shell .modal-backdrop.open .modal {
    transform: translateY(0) scale(1);
  }
  .bd-app-shell .modal-head {
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bd-app-shell .modal-head h3 {
    font-size: 15.5px;
    font-weight: 700;
  }
  .bd-app-shell .modal-body {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
  }
  .bd-app-shell .modal-foot {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  .bd-app-shell .slideover-close {
    color: var(--text-muted);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    flex-shrink: 0;
  }
  .bd-app-shell .slideover-close:hover {
    background: var(--bg);
    color: var(--text);
  }
  .bd-app-shell .extract-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
  }
  .bd-app-shell .extract-item:last-child { border-bottom: none; }
  .bd-app-shell .extract-item input {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    accent-color: var(--accent);
  }
  .bd-app-shell .tag-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }
  .bd-app-shell .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px 3px 10px;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 11.5px;
    font-weight: 500;
  }
  .bd-app-shell .tag-chip button {
    color: var(--accent);
    opacity: 0.7;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bd-app-shell .tag-chip button:hover { opacity: 1; }
  .bd-app-shell .tag-chip svg {
    width: 11px;
    height: 11px;
  }
  .bd-app-shell .attach-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
  }
  .bd-app-shell .attach-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: 7px;
    font-size: 12.5px;
    background: var(--surface);
  }
  .bd-app-shell .attach-row span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bd-app-shell .attach-row button {
    color: var(--text-muted);
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bd-app-shell .attach-row button:hover { color: var(--danger); }
  .bd-app-shell .attach-btn-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 13px;
    border-radius: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
  }
  .bd-app-shell .attach-btn-label:hover {
    background: var(--surface-raised);
  }
  .bd-app-shell .card-meta-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .bd-app-shell .meta-tag {
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 10.5px;
    font-weight: 600;
  }
  .bd-app-shell .meta-icon-group {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-muted);
    font-size: 11px;
  }
  .bd-app-shell .meta-icon-group svg {
    width: 13px;
    height: 13px;
  }
  .bd-app-shell .extract-preview {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  @media (max-width: 900px) {
    .bd-app-shell .task-board { flex-direction: column; }
  }
  @media (max-width: 760px) {
    .bd-app-shell .content { padding: 20px 16px 40px; }
    .bd-app-shell .form-row { flex-direction: column; gap: 0; }
    .bd-app-shell .reqlog-row {
      flex-direction: column;
      align-items: flex-start;
    }
    .bd-app-shell .reqlog-actions-row {
      width: 100%;
      flex-wrap: wrap;
    }
  }
`;

type TabKey = 'details' | 'tasks' | 'reqlog' | 'activity';
type ExtractSource = 'text' | 'file';

type TaskDraft = {
    title: string;
    status: ProjectTaskStatus;
    description: string;
    tags: string[];
    attachments: ProjectAttachment[];
};

type RequestDraft = {
    text: string;
    source: ProjectRequestSource;
    classification: ProjectRequestClassification;
    notes: string;
    attachments: ProjectAttachment[];
};

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

const requestClassMap: Record<ProjectRequestClassification, string> = {
    new: 'class-new',
    duplicate: 'class-duplicate',
    related: 'class-related',
    contradiction: 'class-contradiction',
};

const sourceIconMap: Record<ProjectRequestSource, string> = {
    WhatsApp: 'i-message-circle',
    Email: 'i-mail',
    Telegram: 'i-send',
    'Phone call': 'i-phone',
    Other: 'i-mail',
};

const emptyTaskDraft = (status: ProjectTaskStatus = 'todo'): TaskDraft => ({
    title: '',
    status,
    description: '',
    tags: [],
    attachments: [],
});

const emptyRequestDraft = (): RequestDraft => ({
    text: '',
    source: 'WhatsApp',
    classification: 'new',
    notes: '',
    attachments: [],
});

export default function ProjectShowPage({
    project: initialProject,
    stages,
    taskStages,
    defaultTaskView,
}: ProjectShowPageProps) {
    const [project, setProject] = useState(initialProject);
    const [detailsForm, setDetailsForm] = useState({
        title: initialProject.title,
        client: initialProject.client,
        dueAt: initialProject.dueAt,
        stage: initialProject.stage,
        description: initialProject.description,
    });
    const [activeTab, setActiveTab] = useState<TabKey>('details');
    const [taskView, setTaskView] =
        useState<'board' | 'list'>(defaultTaskView);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [reqSearch, setReqSearch] = useState('');
    const [reqFilter, setReqFilter] = useState<
        'all' | ProjectRequestClassification
    >('all');
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
    const [editingRequestId, setEditingRequestId] = useState<number | null>(
        null,
    );
    const [requestDraft, setRequestDraft] = useState<RequestDraft | null>(null);
    const [showExtractModal, setShowExtractModal] = useState(false);
    const [extractSource, setExtractSource] = useState<ExtractSource>('text');
    const [extractInput, setExtractInput] = useState('');
    const [extractFileNames, setExtractFileNames] = useState<string[]>([]);
    const [extractCandidates, setExtractCandidates] = useState<
        Array<{ id: number; text: string; selected: boolean }>
    >([]);

    const stageMeta = useMemo(() => {
        return Object.fromEntries(
            stages.map((stage) => [
                stage.key,
                { label: stage.label, tone: stage.tone },
            ]),
        ) as Record<string, { label: string; tone: BiondeskTone }>;
    }, [stages]);

    const taskStageMeta = useMemo(() => {
        return Object.fromEntries(
            taskStages.map((stage) => [
                stage.key,
                { label: stage.label, tone: stage.tone },
            ]),
        ) as Record<ProjectTaskStatus, { label: string; tone: BiondeskTone }>;
    }, [taskStages]);

    const taskProgress = useMemo(() => {
        const done = project.tasks.filter((task) => task.status === 'done').length;
        const total = project.tasks.length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        return { done, total, percent };
    }, [project.tasks]);

    const groupedTasks = useMemo(() => {
        return taskStages.map((stage) => ({
            ...stage,
            items: project.tasks.filter((task) => task.status === stage.key),
        }));
    }, [project.tasks, taskStages]);

    const filteredRequestLogs = useMemo(() => {
        const query = reqSearch.trim().toLowerCase();

        return project.requestLogs.filter((requestLog) => {
            const matchesFilter =
                reqFilter === 'all' || requestLog.classification === reqFilter;
            const matchesQuery =
                query === '' ||
                requestLog.text.toLowerCase().includes(query) ||
                requestLog.notes.toLowerCase().includes(query);

            return matchesFilter && matchesQuery;
        });
    }, [project.requestLogs, reqFilter, reqSearch]);

    const appendActivity = (text: string, tone: BiondeskTone = 'accent'): void => {
        setProject((current) => ({
            ...current,
            activity: [
                {
                    text,
                    time: 'Just now',
                    tone,
                },
                ...current.activity,
            ],
        }));
    };

    const saveDetails = (): void => {
        setProject((current) => ({
            ...current,
            title: detailsForm.title.trim() || current.title,
            client: detailsForm.client.trim() || current.client,
            dueAt: detailsForm.dueAt.trim() || current.dueAt,
            stage: detailsForm.stage,
            stageLabel: stageMeta[detailsForm.stage]?.label ?? current.stageLabel,
            tone: stageMeta[detailsForm.stage]?.tone ?? current.tone,
            description: detailsForm.description,
        }));

        appendActivity('Project details updated');
    };

    const addTask = (): void => {
        const title = newTaskTitle.trim();

        if (title === '') {
            return;
        }

        setProject((current) => ({
            ...current,
            tasks: [
                ...current.tasks,
                {
                    id: Math.max(0, ...current.tasks.map((task) => task.id)) + 1,
                    title,
                    status: 'todo',
                    description: '',
                    tags: [],
                    attachments: [],
                },
            ],
        }));

        setNewTaskTitle('');
        appendActivity(`Task "${title}" added`);
    };

    const openTaskDetail = (taskId: number): void => {
        const task = project.tasks.find((currentTask) => currentTask.id === taskId);

        if (!task) {
            return;
        }

        setEditingTaskId(task.id);
        setTaskDraft({
            title: task.title,
            status: task.status,
            description: task.description,
            tags: [...task.tags],
            attachments: [...task.attachments],
        });
    };

    const closeTaskDetail = (): void => {
        setEditingTaskId(null);
        setTaskDraft(null);
    };

    const saveTaskDetail = (): void => {
        if (editingTaskId === null || taskDraft === null) {
            return;
        }

        const nextTitle = taskDraft.title.trim();

        if (nextTitle === '') {
            return;
        }

        setProject((current) => ({
            ...current,
            tasks: current.tasks.map((task) =>
                task.id === editingTaskId
                    ? {
                          ...task,
                          title: nextTitle,
                          status: taskDraft.status,
                          description: taskDraft.description,
                          tags: [...taskDraft.tags],
                          attachments: [...taskDraft.attachments],
                      }
                    : task,
            ),
        }));

        appendActivity(`Task "${nextTitle}" updated`);
        closeTaskDetail();
    };

    const deleteTask = (): void => {
        if (editingTaskId === null) {
            return;
        }

        const task = project.tasks.find((currentTask) => currentTask.id === editingTaskId);

        setProject((current) => ({
            ...current,
            tasks: current.tasks.filter((currentTask) => currentTask.id !== editingTaskId),
        }));

        if (task) {
            appendActivity(`Task "${task.title}" deleted`, 'danger');
        }

        closeTaskDetail();
    };

    const setTaskStatus = (taskId: number, status: ProjectTaskStatus): void => {
        const task = project.tasks.find((currentTask) => currentTask.id === taskId);

        setProject((current) => ({
            ...current,
            tasks: current.tasks.map((currentTask) =>
                currentTask.id === taskId
                    ? {
                          ...currentTask,
                          status,
                      }
                    : currentTask,
            ),
        }));

        if (task) {
            appendActivity(
                `Task "${task.title}" moved to ${taskStageMeta[status].label}`,
                status === 'done' ? 'success' : 'accent',
            );
        }
    };

    const handleTaskAttachmentChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const files = Array.from(event.target.files ?? []);

        if (taskDraft === null || files.length === 0) {
            return;
        }

        setTaskDraft({
            ...taskDraft,
            attachments: [
                ...taskDraft.attachments,
                ...files.map((file) => ({ name: file.name })),
            ],
        });

        event.target.value = '';
    };

    const handleTaskTagEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key !== 'Enter' || taskDraft === null) {
            return;
        }

        const input = event.currentTarget.value.trim();

        if (input === '') {
            return;
        }

        event.preventDefault();
        setTaskDraft({
            ...taskDraft,
            tags: [...taskDraft.tags, input],
        });
        event.currentTarget.value = '';
    };

    const openRequestDetail = (requestId: number | null): void => {
        if (requestId === null) {
            setEditingRequestId(null);
            setRequestDraft(emptyRequestDraft());
            return;
        }

        const requestLog = project.requestLogs.find(
            (currentRequest) => currentRequest.id === requestId,
        );

        if (!requestLog) {
            return;
        }

        setEditingRequestId(requestId);
        setRequestDraft({
            text: requestLog.text,
            source: requestLog.source,
            classification: requestLog.classification,
            notes: requestLog.notes,
            attachments: [...requestLog.attachments],
        });
    };

    const closeRequestDetail = (): void => {
        setEditingRequestId(null);
        setRequestDraft(null);
    };

    const saveRequestDetail = (): void => {
        if (requestDraft === null || requestDraft.text.trim() === '') {
            return;
        }

        if (editingRequestId === null) {
            const newRequest: ProjectDetailRequestLog = {
                id:
                    Math.max(0, ...project.requestLogs.map((requestLog) => requestLog.id)) +
                    1,
                text: requestDraft.text.trim(),
                source: requestDraft.source,
                classification: requestDraft.classification,
                notes: requestDraft.notes,
                attachments: [...requestDraft.attachments],
                date: 'Just now',
            };

            setProject((current) => ({
                ...current,
                requestLogs: [newRequest, ...current.requestLogs],
            }));
            appendActivity('New request log added');
        } else {
            setProject((current) => ({
                ...current,
                requestLogs: current.requestLogs.map((requestLog) =>
                    requestLog.id === editingRequestId
                        ? {
                              ...requestLog,
                              text: requestDraft.text.trim(),
                              source: requestDraft.source,
                              classification: requestDraft.classification,
                              notes: requestDraft.notes,
                              attachments: [...requestDraft.attachments],
                          }
                        : requestLog,
                ),
            }));
            appendActivity('Request log updated');
        }

        closeRequestDetail();
    };

    const dismissRequest = (requestId: number): void => {
        setProject((current) => ({
            ...current,
            requestLogs: current.requestLogs.filter(
                (requestLog) => requestLog.id !== requestId,
            ),
        }));

        appendActivity('Request log dismissed', 'danger');

        if (editingRequestId === requestId) {
            closeRequestDetail();
        }
    };

    const convertRequestToTask = (requestId: number): void => {
        const requestLog = project.requestLogs.find(
            (currentRequest) => currentRequest.id === requestId,
        );

        if (!requestLog) {
            return;
        }

        setProject((current) => ({
            ...current,
            tasks: [
                ...current.tasks,
                {
                    id: Math.max(0, ...current.tasks.map((task) => task.id)) + 1,
                    title: requestLog.text,
                    status: 'todo',
                    description: requestLog.notes,
                    tags: [],
                    attachments: [...requestLog.attachments],
                },
            ],
            requestLogs: current.requestLogs.filter(
                (currentRequest) => currentRequest.id !== requestId,
            ),
        }));

        appendActivity('Request converted into task');
    };

    const handleRequestAttachmentChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const files = Array.from(event.target.files ?? []);

        if (requestDraft === null || files.length === 0) {
            return;
        }

        setRequestDraft({
            ...requestDraft,
            attachments: [
                ...requestDraft.attachments,
                ...files.map((file) => ({ name: file.name })),
            ],
        });

        event.target.value = '';
    };

    const openExtractModal = (): void => {
        setShowExtractModal(true);
        setExtractSource('text');
        setExtractInput('');
        setExtractFileNames([]);
        setExtractCandidates([]);
    };

    const closeExtractModal = (): void => {
        setShowExtractModal(false);
        setExtractSource('text');
        setExtractInput('');
        setExtractFileNames([]);
        setExtractCandidates([]);
    };

    const handleExtractFileChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const files = Array.from(event.target.files ?? []);

        setExtractFileNames(files.map((file) => file.name));
        event.target.value = '';
    };

    const runExtract = (): void => {
        if (extractCandidates.length > 0) {
            const selectedCandidates = extractCandidates.filter(
                (candidate) => candidate.selected,
            );

            if (selectedCandidates.length === 0) {
                return;
            }

            setProject((current) => ({
                ...current,
                tasks: [
                    ...current.tasks,
                    ...selectedCandidates.map((candidate, index) => ({
                        id:
                            Math.max(0, ...current.tasks.map((task) => task.id)) +
                            index +
                            1,
                        title: candidate.text,
                        status: 'backlog' as ProjectTaskStatus,
                        description: '',
                        tags: [],
                        attachments: [],
                    })),
                ],
            }));

            appendActivity(
                `${selectedCandidates.length} task suggestion${selectedCandidates.length > 1 ? 's' : ''} added to backlog`,
            );
            closeExtractModal();

            return;
        }

        let candidateTexts: string[] = [];

        if (extractSource === 'file') {
            if (extractFileNames.length === 0) {
                return;
            }

            candidateTexts = [
                'Review uploaded reference and note action items',
                'Translate client feedback into implementation checklist',
                'Add final QA pass before client handoff',
            ];
        } else {
            const value = extractInput.trim();

            if (value === '') {
                return;
            }

            candidateTexts = value
                .split(/\n+|(?<=[.!?])\s+/)
                .map((sentence) => sentence.trim().replace(/^[-*•]\s*/, ''))
                .filter((sentence) => sentence.length > 8)
                .slice(0, 8)
                .map(
                    (sentence) =>
                        sentence.charAt(0).toUpperCase() + sentence.slice(1),
                );
        }

        setExtractCandidates(
            candidateTexts.map((text, index) => ({
                id: index + 1,
                text,
                selected: true,
            })),
        );
    };

    return (
        <>
            <Head title={project.title} />

            <style>{projectShowStyles}</style>

            <div className="project-show-page">
                <div className="detail-header-mini">
                    <h1>{project.title}</h1>
                    <div className="client-row">
                        <span>{project.client}</span>
                        <span className={`pill ${toneClassMap[project.tone]}`}>
                            <span className="dot" />
                            {project.stageLabel}
                        </span>
                    </div>
                </div>

                <div className="tab-nav">
                    {(
                        [
                            ['details', 'Details'],
                            ['tasks', 'Tasks'],
                            ['reqlog', 'Request Log'],
                            ['activity', 'Activity Log'],
                        ] as Array<[TabKey, string]>
                    ).map(([tab, label]) => (
                        <button
                            key={tab}
                            type="button"
                            className={`tab-btn ${
                                activeTab === tab ? 'active' : ''
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="tab-panels">
                    <div
                        className={`tab-panel ${
                            activeTab === 'details' ? 'active' : ''
                        }`}
                    >
                        <div className="details-form">
                            <div className="field-group">
                                <span className="field-label">Title</span>
                                <input
                                    className="field-input"
                                    value={detailsForm.title}
                                    onChange={(event) =>
                                        setDetailsForm((current) => ({
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
                                        value={detailsForm.client}
                                        onChange={(event) =>
                                            setDetailsForm((current) => ({
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
                                        value={detailsForm.dueAt}
                                        onChange={(event) =>
                                            setDetailsForm((current) => ({
                                                ...current,
                                                dueAt: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <span className="field-label">Status</span>
                                <select
                                    className="field-select"
                                    value={detailsForm.stage}
                                    onChange={(event) =>
                                        setDetailsForm((current) => ({
                                            ...current,
                                            stage: event.target.value,
                                        }))
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
                                    Description
                                </span>
                                <textarea
                                    className="field-input"
                                    rows={5}
                                    value={detailsForm.description}
                                    onChange={(event) =>
                                        setDetailsForm((current) => ({
                                            ...current,
                                            description: event.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={saveDetails}
                            >
                                Save changes
                            </button>
                        </div>
                    </div>

                    <div
                        className={`tab-panel ${
                            activeTab === 'tasks' ? 'active' : ''
                        }`}
                    >
                        <div className="task-toolbar">
                            <div className="view-toggle">
                                <button
                                    type="button"
                                    className={
                                        taskView === 'board' ? 'active' : ''
                                    }
                                    onClick={() => setTaskView('board')}
                                >
                                    <svg className="icon icon-sm">
                                        <use href="#i-kanban" />
                                    </svg>
                                    Board
                                </button>
                                <button
                                    type="button"
                                    className={
                                        taskView === 'list' ? 'active' : ''
                                    }
                                    onClick={() => setTaskView('list')}
                                >
                                    <svg className="icon icon-sm">
                                        <use href="#i-list" />
                                    </svg>
                                    List
                                </button>
                            </div>

                            <div className="task-toolbar-right">
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={openExtractModal}
                                >
                                    <svg className="icon icon-sm">
                                        <use href="#i-sparkles" />
                                    </svg>
                                    Extract with AI
                                </button>
                            </div>
                        </div>

                        <div className="task-add-row">
                            <input
                                type="text"
                                placeholder="Add a task..."
                                value={newTaskTitle}
                                onChange={(event) =>
                                    setNewTaskTitle(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        addTask();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={addTask}
                            >
                                Add task
                            </button>
                        </div>

                        {taskView === 'board' ? (
                            <div className="task-board">
                                {groupedTasks.map((stage) => (
                                    <div key={stage.key} className="task-col">
                                        <div className="task-col-head">
                                            <span
                                                className="dot"
                                                style={{
                                                    background:
                                                        toneColorMap[stage.tone],
                                                }}
                                            />
                                            {stage.label}
                                            <span className="count">
                                                {stage.items.length}
                                            </span>
                                        </div>
                                        <div
                                            className={`task-col-body ${
                                                draggedTaskId !== null
                                                    ? 'drag-over'
                                                    : ''
                                            }`}
                                            onDragOver={(event) =>
                                                event.preventDefault()
                                            }
                                            onDrop={() => {
                                                if (draggedTaskId !== null) {
                                                    setTaskStatus(
                                                        draggedTaskId,
                                                        stage.key,
                                                    );
                                                }
                                                setDraggedTaskId(null);
                                            }}
                                        >
                                            {stage.items.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="task-card"
                                                    draggable
                                                    onDragStart={() =>
                                                        setDraggedTaskId(task.id)
                                                    }
                                                    onDragEnd={() =>
                                                        setDraggedTaskId(null)
                                                    }
                                                    onClick={() =>
                                                        openTaskDetail(task.id)
                                                    }
                                                >
                                                    <div className="task-card-top">
                                                        <span>{task.title}</span>
                                                        <button
                                                            type="button"
                                                            className="task-delete"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setProject(
                                                                    (current) => ({
                                                                        ...current,
                                                                        tasks: current.tasks.filter(
                                                                            (
                                                                                currentTask,
                                                                            ) =>
                                                                                currentTask.id !==
                                                                                task.id,
                                                                        ),
                                                                    }),
                                                                );
                                                            }}
                                                        >
                                                            <svg className="icon icon-sm">
                                                                <use href="#i-x" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {(task.tags.length > 0 ||
                                                        task.description !==
                                                            '' ||
                                                        task.attachments
                                                            .length > 0) && (
                                                        <div className="card-meta-row">
                                                            {task.tags.map(
                                                                (tag) => (
                                                                    <span
                                                                        key={tag}
                                                                        className="meta-tag"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ),
                                                            )}
                                                            {task.description !==
                                                            '' ? (
                                                                <span className="meta-icon-group">
                                                                    <svg className="icon icon-sm">
                                                                        <use href="#i-align-left" />
                                                                    </svg>
                                                                </span>
                                                            ) : null}
                                                            {task.attachments
                                                                .length > 0 ? (
                                                                <span className="meta-icon-group">
                                                                    <svg className="icon icon-sm">
                                                                        <use href="#i-paperclip" />
                                                                    </svg>
                                                                    {
                                                                        task
                                                                            .attachments
                                                                            .length
                                                                    }
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    )}
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
                                                <th>Task</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.tasks.length > 0 ? (
                                                project.tasks.map((task) => (
                                                    <tr key={task.id}>
                                                        <td
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() =>
                                                                openTaskDetail(
                                                                    task.id,
                                                                )
                                                            }
                                                        >
                                                            {task.title}
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="status-inline"
                                                                value={
                                                                    task.status
                                                                }
                                                                onClick={(
                                                                    event,
                                                                ) =>
                                                                    event.stopPropagation()
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setTaskStatus(
                                                                        task.id,
                                                                        event
                                                                            .target
                                                                            .value as ProjectTaskStatus,
                                                                    )
                                                                }
                                                            >
                                                                {taskStages.map(
                                                                    (
                                                                        stage,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                stage.key
                                                                            }
                                                                            value={
                                                                                stage.key
                                                                            }
                                                                        >
                                                                            {
                                                                                stage.label
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={2}
                                                        className="empty-note"
                                                    >
                                                        No tasks yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className={`tab-panel ${
                            activeTab === 'reqlog' ? 'active' : ''
                        }`}
                    >
                        <div className="reqlog-toolbar">
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginBottom: '12px',
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => openRequestDetail(null)}
                                >
                                    <svg className="icon icon-sm">
                                        <use href="#i-plus" />
                                    </svg>
                                    Add Request
                                </button>
                            </div>

                            <label className="search-box">
                                <svg className="icon icon-sm">
                                    <use href="#i-search" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search past requests by keyword, content..."
                                    value={reqSearch}
                                    onChange={(event) =>
                                        setReqSearch(event.target.value)
                                    }
                                />
                            </label>

                            <div className="chip-row">
                                {(
                                    [
                                        ['all', 'All Requests'],
                                        ['new', 'New'],
                                        ['duplicate', 'Duplicate'],
                                        ['related', 'Related'],
                                        ['contradiction', 'Contradiction'],
                                    ] as Array<
                                        ['all' | ProjectRequestClassification, string]
                                    >
                                ).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`chip ${
                                            reqFilter === key ? 'active' : ''
                                        }`}
                                        onClick={() => setReqFilter(key)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="reqlog-scroll">
                            {filteredRequestLogs.length > 0 ? (
                                filteredRequestLogs.map((requestLog) => (
                                    <div
                                        key={requestLog.id}
                                        className="reqlog-row"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            openRequestDetail(requestLog.id)
                                        }
                                    >
                                        <div className="reqlog-main">
                                            <div className="reqlog-text">
                                                "{requestLog.text}"
                                            </div>
                                            <div className="reqlog-meta">
                                                <svg className="icon icon-sm">
                                                    <use
                                                        href={`#${
                                                            sourceIconMap[
                                                                requestLog
                                                                    .source
                                                            ]
                                                        }`}
                                                    />
                                                </svg>
                                                {requestLog.source} ·{' '}
                                                {requestLog.date}
                                                {requestLog.notes !== '' ? (
                                                    <span className="meta-icon-group">
                                                        <svg className="icon icon-sm">
                                                            <use href="#i-align-left" />
                                                        </svg>
                                                    </span>
                                                ) : null}
                                                {requestLog.attachments.length >
                                                0 ? (
                                                    <span className="meta-icon-group">
                                                        <svg className="icon icon-sm">
                                                            <use href="#i-paperclip" />
                                                        </svg>
                                                        {
                                                            requestLog
                                                                .attachments
                                                                .length
                                                        }
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <span
                                            className={`class-badge ${
                                                requestClassMap[
                                                    requestLog.classification
                                                ]
                                            }`}
                                        >
                                            {requestLog.classification}
                                        </span>
                                        <div
                                            className="reqlog-actions-row"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() =>
                                                    convertRequestToTask(
                                                        requestLog.id,
                                                    )
                                                }
                                            >
                                                Convert to Task
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() =>
                                                    dismissRequest(
                                                        requestLog.id,
                                                    )
                                                }
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-note">
                                    No requests match this filter.
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className={`tab-panel ${
                            activeTab === 'activity' ? 'active' : ''
                        }`}
                    >
                        <div className="activity-scroll">
                            {project.activity.length > 0 ? (
                                project.activity.map((entry, index) => (
                                    <div key={`${entry.text}-${index}`} className="feed-item">
                                        <div className="feed-dot-wrap">
                                            <div
                                                className={`feed-dot ${
                                                    entry.tone === 'muted'
                                                        ? ''
                                                        : entry.tone
                                                }`}
                                            />
                                            {index < project.activity.length - 1 ? (
                                                <div className="feed-line" />
                                            ) : null}
                                        </div>
                                        <div>
                                            <div className="feed-text">
                                                {entry.text}
                                            </div>
                                            <div className="feed-time">
                                                {entry.time}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-note">
                                    No activity yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`modal-backdrop ${
                    editingTaskId !== null ? 'open' : ''
                }`}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeTaskDetail();
                    }
                }}
            >
                <div className="modal" style={{ maxWidth: '520px' }}>
                    <div className="modal-head">
                        <h3>Edit Task</h3>
                        <button
                            type="button"
                            className="slideover-close"
                            onClick={closeTaskDetail}
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
                                value={taskDraft?.title ?? ''}
                                onChange={(event) =>
                                    setTaskDraft((current) =>
                                        current
                                            ? {
                                                  ...current,
                                                  title: event.target.value,
                                              }
                                            : current,
                                    )
                                }
                            />
                        </div>

                        <div className="field-group">
                            <span className="field-label">Status</span>
                            <select
                                className="field-select"
                                value={taskDraft?.status ?? 'todo'}
                                onChange={(event) =>
                                    setTaskDraft((current) =>
                                        current
                                            ? {
                                                  ...current,
                                                  status: event.target
                                                      .value as ProjectTaskStatus,
                                              }
                                            : current,
                                    )
                                }
                            >
                                {taskStages.map((stage) => (
                                    <option key={stage.key} value={stage.key}>
                                        {stage.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field-group">
                            <span className="field-label">Description</span>
                            <textarea
                                className="field-input"
                                rows={3}
                                value={taskDraft?.description ?? ''}
                                onChange={(event) =>
                                    setTaskDraft((current) =>
                                        current
                                            ? {
                                                  ...current,
                                                  description:
                                                      event.target.value,
                                              }
                                            : current,
                                    )
                                }
                            />
                        </div>

                        <div className="field-group">
                            <span className="field-label">Tags</span>
                            <div className="tag-chips">
                                {taskDraft?.tags.map((tag, index) => (
                                    <span key={`${tag}-${index}`} className="tag-chip">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setTaskDraft((current) =>
                                                    current
                                                        ? {
                                                              ...current,
                                                              tags: current.tags.filter(
                                                                  (
                                                                      _tag,
                                                                      tagIndex,
                                                                  ) =>
                                                                      tagIndex !==
                                                                      index,
                                                              ),
                                                          }
                                                        : current,
                                                )
                                            }
                                        >
                                            <svg className="icon">
                                                <use href="#i-x" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                className="field-input"
                                placeholder="Type a tag and press Enter"
                                onKeyDown={handleTaskTagEnter}
                            />
                        </div>

                        <div className="field-group">
                            <span className="field-label">Attachments</span>
                            <div className="attach-list">
                                {taskDraft?.attachments.map(
                                    (attachment, index) => (
                                        <div
                                            key={`${attachment.name}-${index}`}
                                            className="attach-row"
                                        >
                                            <svg className="icon icon-sm">
                                                <use href="#i-paperclip" />
                                            </svg>
                                            <span>{attachment.name}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTaskDraft((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  attachments:
                                                                      current.attachments.filter(
                                                                          (
                                                                              _attachment,
                                                                              attachmentIndex,
                                                                          ) =>
                                                                              attachmentIndex !==
                                                                              index,
                                                                      ),
                                                              }
                                                            : current,
                                                    )
                                                }
                                            >
                                                <svg className="icon icon-sm">
                                                    <use href="#i-x" />
                                                </svg>
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                            <label className="attach-btn-label">
                                <svg className="icon icon-sm">
                                    <use href="#i-paperclip" />
                                </svg>
                                Add attachment
                                <input
                                    type="file"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleTaskAttachmentChange}
                                />
                            </label>
                        </div>
                    </div>

                    <div
                        className="modal-foot"
                        style={{ justifyContent: 'space-between' }}
                    >
                        <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ color: 'var(--danger)' }}
                            onClick={deleteTask}
                        >
                            Delete task
                        </button>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={closeTaskDetail}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={saveTaskDetail}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`modal-backdrop ${
                    requestDraft !== null ? 'open' : ''
                }`}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeRequestDetail();
                    }
                }}
            >
                <div className="modal" style={{ maxWidth: '520px' }}>
                    <div className="modal-head">
                        <h3>
                            {editingRequestId === null
                                ? 'Add Request'
                                : 'Request Detail'}
                        </h3>
                        <button
                            type="button"
                            className="slideover-close"
                            onClick={closeRequestDetail}
                        >
                            <svg className="icon">
                                <use href="#i-x" />
                            </svg>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="field-group">
                            <span className="field-label">Request text</span>
                            <textarea
                                className="field-input"
                                rows={2}
                                value={requestDraft?.text ?? ''}
                                onChange={(event) =>
                                    setRequestDraft((current) =>
                                        current
                                            ? {
                                                  ...current,
                                                  text: event.target.value,
                                              }
                                            : current,
                                    )
                                }
                            />
                        </div>

                        <div className="form-row">
                            <div className="field-group">
                                <span className="field-label">Source</span>
                                <select
                                    className="field-select"
                                    value={requestDraft?.source ?? 'WhatsApp'}
                                    onChange={(event) =>
                                        setRequestDraft((current) =>
                                            current
                                                ? {
                                                      ...current,
                                                      source: event.target
                                                          .value as ProjectRequestSource,
                                                  }
                                                : current,
                                        )
                                    }
                                >
                                    {(
                                        [
                                            'WhatsApp',
                                            'Email',
                                            'Telegram',
                                            'Phone call',
                                            'Other',
                                        ] as ProjectRequestSource[]
                                    ).map((source) => (
                                        <option key={source} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field-group">
                                <span className="field-label">
                                    Classification
                                </span>
                                <select
                                    className="field-select"
                                    value={requestDraft?.classification ?? 'new'}
                                    onChange={(event) =>
                                        setRequestDraft((current) =>
                                            current
                                                ? {
                                                      ...current,
                                                      classification: event
                                                          .target
                                                          .value as ProjectRequestClassification,
                                                  }
                                                : current,
                                        )
                                    }
                                >
                                    {(
                                        [
                                            'new',
                                            'duplicate',
                                            'related',
                                            'contradiction',
                                        ] as ProjectRequestClassification[]
                                    ).map((classification) => (
                                        <option
                                            key={classification}
                                            value={classification}
                                        >
                                            {classification}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="field-group">
                            <span className="field-label">Notes</span>
                            <textarea
                                className="field-input"
                                rows={3}
                                value={requestDraft?.notes ?? ''}
                                onChange={(event) =>
                                    setRequestDraft((current) =>
                                        current
                                            ? {
                                                  ...current,
                                                  notes: event.target.value,
                                              }
                                            : current,
                                    )
                                }
                            />
                        </div>

                        <div className="field-group">
                            <span className="field-label">Attachments</span>
                            <div className="attach-list">
                                {requestDraft?.attachments.map(
                                    (attachment, index) => (
                                        <div
                                            key={`${attachment.name}-${index}`}
                                            className="attach-row"
                                        >
                                            <svg className="icon icon-sm">
                                                <use href="#i-paperclip" />
                                            </svg>
                                            <span>{attachment.name}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setRequestDraft((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  attachments:
                                                                      current.attachments.filter(
                                                                          (
                                                                              _attachment,
                                                                              attachmentIndex,
                                                                          ) =>
                                                                              attachmentIndex !==
                                                                              index,
                                                                      ),
                                                              }
                                                            : current,
                                                    )
                                                }
                                            >
                                                <svg className="icon icon-sm">
                                                    <use href="#i-x" />
                                                </svg>
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                            <label className="attach-btn-label">
                                <svg className="icon icon-sm">
                                    <use href="#i-paperclip" />
                                </svg>
                                Add attachment
                                <input
                                    type="file"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleRequestAttachmentChange}
                                />
                            </label>
                        </div>
                    </div>

                    <div
                        className="modal-foot"
                        style={{ justifyContent: 'space-between' }}
                    >
                        <button
                            type="button"
                            className="btn btn-ghost"
                            style={{
                                color:
                                    editingRequestId === null
                                        ? 'var(--text)'
                                        : 'var(--danger)',
                            }}
                            onClick={() => {
                                if (editingRequestId !== null) {
                                    dismissRequest(editingRequestId);
                                } else {
                                    closeRequestDetail();
                                }
                            }}
                        >
                            {editingRequestId === null
                                ? 'Cancel'
                                : 'Dismiss request'}
                        </button>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={closeRequestDetail}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={saveRequestDetail}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`modal-backdrop ${
                    showExtractModal ? 'open' : ''
                }`}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeExtractModal();
                    }
                }}
            >
                <div className="modal" style={{ maxWidth: '560px' }}>
                    <div className="modal-head">
                        <h3>
                            <svg
                                className="icon icon-sm"
                                style={{
                                    display: 'inline',
                                    verticalAlign: '-2px',
                                    color: 'var(--accent)',
                                }}
                            >
                                <use href="#i-sparkles" />
                            </svg>{' '}
                            Extract tasks with AI
                        </h3>
                        <button
                            type="button"
                            className="slideover-close"
                            onClick={closeExtractModal}
                        >
                            <svg className="icon">
                                <use href="#i-x" />
                            </svg>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div
                            className="view-toggle"
                            style={{ marginBottom: '16px' }}
                        >
                            <button
                                type="button"
                                className={
                                    extractSource === 'text' ? 'active' : ''
                                }
                                onClick={() => setExtractSource('text')}
                            >
                                Paste Text
                            </button>
                            <button
                                type="button"
                                className={
                                    extractSource === 'file' ? 'active' : ''
                                }
                                onClick={() => setExtractSource('file')}
                            >
                                Upload File
                            </button>
                        </div>

                        {extractSource === 'text' ? (
                            <div className="field-group">
                                <span className="field-label">
                                    Paste a description, chat, or any context
                                </span>
                                <textarea
                                    className="field-input"
                                    rows={6}
                                    placeholder="Paste a project brief, chat, or meeting notes here..."
                                    value={extractInput}
                                    onChange={(event) =>
                                        setExtractInput(event.target.value)
                                    }
                                />
                            </div>
                        ) : (
                            <div className="field-group">
                                <span className="field-label">
                                    Upload a screenshot, photo, or audio recording
                                </span>
                                <label className="attach-btn-label">
                                    <svg className="icon icon-sm">
                                        <use href="#i-paperclip" />
                                    </svg>
                                    Choose file
                                    <input
                                        type="file"
                                        accept="image/*,audio/*"
                                        style={{ display: 'none' }}
                                        onChange={handleExtractFileChange}
                                    />
                                </label>
                                {extractFileNames.length > 0 ? (
                                    <div className="extract-preview">
                                        {extractFileNames.map((fileName) => (
                                            <div
                                                key={fileName}
                                                className="attach-row"
                                            >
                                                <svg className="icon icon-sm">
                                                    <use href="#i-paperclip" />
                                                </svg>
                                                <span>{fileName}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {extractCandidates.length > 0 ? (
                            <div>
                                <span className="field-label">
                                    Suggested tasks, uncheck what you don't need
                                </span>
                                <div>
                                    {extractCandidates.map((candidate) => (
                                        <label
                                            key={candidate.id}
                                            className="extract-item"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={candidate.selected}
                                                onChange={() =>
                                                    setExtractCandidates(
                                                        (current) =>
                                                            current.map(
                                                                (
                                                                    currentCandidate,
                                                                ) =>
                                                                    currentCandidate.id ===
                                                                    candidate.id
                                                                        ? {
                                                                              ...currentCandidate,
                                                                              selected:
                                                                                  !currentCandidate.selected,
                                                                          }
                                                                        : currentCandidate,
                                                            ),
                                                    )
                                                }
                                            />
                                            <span>{candidate.text}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="modal-foot">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={closeExtractModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={runExtract}
                        >
                            {extractCandidates.length > 0
                                ? `Add ${
                                      extractCandidates.filter(
                                          (candidate) => candidate.selected,
                                      ).length
                                  } task${
                                      extractCandidates.filter(
                                          (candidate) => candidate.selected,
                                      ).length === 1
                                          ? ''
                                          : 's'
                                  } to Backlog`
                                : 'Extract tasks'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

ProjectShowPage.layout = (props: {
    currentTeam?: { slug: string } | null;
    project?: { id: number; title: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Projects',
            href: props.currentTeam ? projects(props.currentTeam.slug) : '/',
        },
        {
            title: props.project?.title ?? 'Project',
            href:
                props.currentTeam && props.project
                    ? projectShow({
                          current_team: props.currentTeam.slug,
                          project: props.project.id,
                      })
                    : '/',
        },
    ],
});
