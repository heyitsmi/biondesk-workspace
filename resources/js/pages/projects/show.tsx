import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as projectEdit, index as projects, show as projectShow, update as updateProject } from '@/routes/projects';
import {
    convertToTask as convertRequestLogToTask,
    destroy as destroyRequestLog,
    store as storeRequestLog,
    update as updateRequestLog,
} from '@/routes/projects/request-logs';
import { destroy as destroyTask, move as moveTask, store as storeTask, update as updateTask } from '@/routes/projects/tasks';
import type {
    BiondeskTone,
    ProjectAttachment,
    ProjectRequestClassification,
    ProjectRequestSource,
    ProjectShowPageProps,
    ProjectTaskStatus,
} from '@/types';

const ICON_CLS =
    'h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';
const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised');
const BTN_GHOST_SM = cn(
    'inline-flex items-center gap-[7px] rounded-[8px] px-[12px] py-[6px] text-[12.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]',
    'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised',
);

const PILL_BASE =
    'inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-medium whitespace-nowrap';

const FIELD_LABEL = 'mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-surface px-[11px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none';

const TAB_BTN =
    'mr-[24px] whitespace-nowrap border-b-2 border-transparent py-[10px] text-[13.5px] font-medium text-bion-text-muted hover:text-bion-text';
const TAB_BTN_ACTIVE = 'mr-[24px] whitespace-nowrap border-b-2 border-bion-accent py-[10px] text-[13.5px] font-medium text-bion-text';

const MODAL_BACKDROP =
    'group/modal fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-[20px] opacity-0 pointer-events-none [transition:opacity_0.15s_ease] [&.open]:opacity-100! [&.open]:pointer-events-auto!';
const MODAL =
    'w-full max-w-[440px] rounded-[14px] border border-bion-border bg-bion-surface-raised shadow-[0_24px_60px_rgba(0,0,0,0.4)] [transform:translateY(-10px)_scale(0.98)] [transition:transform_0.15s_ease] group-[.open]/modal:[transform:translateY(0)_scale(1)]';
const MODAL_HEAD = 'flex items-center justify-between border-b border-bion-border p-[18px_20px]';
const MODAL_BODY = 'max-h-[60vh] overflow-y-auto p-[20px]';
const MODAL_FOOT = 'flex justify-end gap-[10px] border-t border-bion-border p-[16px_20px]';
const SLIDEOVER_CLOSE =
    'flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] text-bion-text-muted hover:bg-bion-bg hover:text-bion-text';

type TabKey = 'details' | 'tasks' | 'reqlog' | 'activity';
type ExtractSource = 'text' | 'file';

type TaskDraft = {
    title: string;
    status: ProjectTaskStatus;
    description: string;
    tags: string[];
    existingAttachments: ProjectAttachment[];
    newAttachments: File[];
};

type RequestDraft = {
    text: string;
    source: ProjectRequestSource;
    classification: ProjectRequestClassification;
    notes: string;
    existingAttachments: ProjectAttachment[];
    newAttachments: File[];
};

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

const toneColorMap: Record<BiondeskTone, string> = {
    accent: 'var(--bion-accent)',
    success: 'var(--bion-success)',
    danger: 'var(--bion-danger)',
    muted: 'var(--bion-text-muted)',
};

const requestClassMap: Record<ProjectRequestClassification, string> = {
    new: 'bg-bion-accent-soft text-bion-accent',
    duplicate: 'border border-bion-border bg-bion-surface-raised text-bion-text-muted',
    related: 'border border-bion-border bg-bion-surface-raised text-bion-text-muted',
    contradiction: 'bg-bion-danger-soft text-bion-danger',
};

const sourceIconMap: Record<ProjectRequestSource, string> = {
    WhatsApp: 'i-message-circle',
    Email: 'i-mail',
    Telegram: 'i-send',
    'Phone call': 'i-phone',
    'Client portal': 'i-message-circle',
    Other: 'i-mail',
};

const emptyRequestDraft = (): RequestDraft => ({
    text: '',
    source: 'WhatsApp',
    classification: 'new',
    notes: '',
    existingAttachments: [],
    newAttachments: [],
});

export default function ProjectShowPage({
    project,
    stages,
    taskStages,
    defaultTaskView,
}: ProjectShowPageProps) {
    const { currentTeam } = usePage().props;
    const [detailsForm, setDetailsForm] = useState({
        title: project.title,
        status: project.stage,
        description: project.description,
    });
    const [activeTab, setActiveTab] = useState<TabKey>('details');
    const [savingDetails, setSavingDetails] = useState(false);
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
    const [extractSaving, setExtractSaving] = useState(false);

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

    const saveDetails = (): void => {
        if (!currentTeam) {
            return;
        }

        setSavingDetails(true);
        router.put(
            updateProject({ current_team: currentTeam.slug, project: project.id }).url,
            detailsForm,
            {
                preserveScroll: true,
                onFinish: () => setSavingDetails(false),
            },
        );
    };

    const addTask = (): void => {
        const title = newTaskTitle.trim();

        if (title === '' || !currentTeam) {
            return;
        }

        router.post(
            storeTask({ current_team: currentTeam.slug, project: project.id }).url,
            { title, status: 'todo' },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setNewTaskTitle(''),
            },
        );
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
            existingAttachments: [...task.attachments],
            newAttachments: [],
        });
    };

    const closeTaskDetail = (): void => {
        setEditingTaskId(null);
        setTaskDraft(null);
    };

    const saveTaskDetail = (): void => {
        if (editingTaskId === null || taskDraft === null || !currentTeam) {
            return;
        }

        const nextTitle = taskDraft.title.trim();

        if (nextTitle === '') {
            return;
        }

        router.put(
            updateTask({ current_team: currentTeam.slug, project: project.id, task: editingTaskId }).url,
            {
                title: nextTitle,
                status: taskDraft.status,
                description: taskDraft.description,
                tags: taskDraft.tags,
                attachments: taskDraft.newAttachments,
            },
            {
                preserveScroll: true,
                onSuccess: closeTaskDetail,
            },
        );
    };

    const deleteTask = (): void => {
        if (editingTaskId === null || !currentTeam) {
            return;
        }

        router.delete(
            destroyTask({ current_team: currentTeam.slug, project: project.id, task: editingTaskId }).url,
            {
                preserveScroll: true,
                onSuccess: closeTaskDetail,
            },
        );
    };

    const removeTaskQuick = (taskId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.delete(
            destroyTask({ current_team: currentTeam.slug, project: project.id, task: taskId }).url,
            { preserveScroll: true, preserveState: true },
        );
    };

    const setTaskStatus = (taskId: number, status: ProjectTaskStatus): void => {
        if (!currentTeam) {
            return;
        }

        router.patch(
            moveTask({ current_team: currentTeam.slug, project: project.id, task: taskId }).url,
            { status },
            { preserveScroll: true, preserveState: true },
        );
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
            newAttachments: [...taskDraft.newAttachments, ...files],
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
            existingAttachments: [...requestLog.attachments],
            newAttachments: [],
        });
    };

    const closeRequestDetail = (): void => {
        setEditingRequestId(null);
        setRequestDraft(null);
    };

    const saveRequestDetail = (): void => {
        if (requestDraft === null || requestDraft.text.trim() === '' || !currentTeam) {
            return;
        }

        const payload = {
            text: requestDraft.text.trim(),
            source: requestDraft.source,
            classification: requestDraft.classification,
            notes: requestDraft.notes,
            attachments: requestDraft.newAttachments,
        };

        if (editingRequestId === null) {
            router.post(
                storeRequestLog({ current_team: currentTeam.slug, project: project.id }).url,
                payload,
                { preserveScroll: true, onSuccess: closeRequestDetail },
            );
        } else {
            router.put(
                updateRequestLog({ current_team: currentTeam.slug, project: project.id, requestLog: editingRequestId }).url,
                payload,
                { preserveScroll: true, onSuccess: closeRequestDetail },
            );
        }
    };

    const dismissRequest = (requestId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.delete(
            destroyRequestLog({ current_team: currentTeam.slug, project: project.id, requestLog: requestId }).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (editingRequestId === requestId) {
                        closeRequestDetail();
                    }
                },
            },
        );
    };

    const convertRequestToTask = (requestId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.post(
            convertRequestLogToTask({ current_team: currentTeam.slug, project: project.id, requestLog: requestId }).url,
            {},
            { preserveScroll: true },
        );
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
            newAttachments: [...requestDraft.newAttachments, ...files],
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
        setExtractSaving(false);
    };

    const handleExtractFileChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const files = Array.from(event.target.files ?? []);

        setExtractFileNames(files.map((file) => file.name));
        event.target.value = '';
    };

    const addTasksSequentially = (titles: string[], onDone: () => void): void => {
        if (!currentTeam) {
            return;
        }

        if (titles.length === 0) {
            onDone();

            return;
        }

        const [first, ...rest] = titles;

        router.post(
            storeTask({ current_team: currentTeam.slug, project: project.id }).url,
            { title: first, status: 'backlog' },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => addTasksSequentially(rest, onDone),
            },
        );
    };

    const runExtract = (): void => {
        if (extractCandidates.length > 0) {
            const selectedCandidates = extractCandidates.filter(
                (candidate) => candidate.selected,
            );

            if (selectedCandidates.length === 0) {
                return;
            }

            setExtractSaving(true);
            addTasksSequentially(
                selectedCandidates.map((candidate) => candidate.text),
                closeExtractModal,
            );

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

            <div className="flex min-h-0 flex-1 flex-col">
                <div className="mb-[16px] flex shrink-0 items-start justify-between gap-[12px]">
                    <div>
                        <h1 className="mb-[5px] text-[21px] font-bold">{project.title}</h1>
                        <div className="flex flex-wrap items-center gap-[10px] text-[13px] text-bion-text-muted">
                            <span>{project.client}</span>
                            <span className={toneClassMap[project.tone]}>
                                <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[project.tone])} />
                                {project.stageLabel}
                            </span>
                            {project.dueAt !== '' ? <span>Due {project.dueAt}</span> : null}
                        </div>
                    </div>

                    {currentTeam ? (
                        <Link
                            href={projectEdit({ current_team: currentTeam.slug, project: project.id })}
                            className={BTN_GHOST}
                        >
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-edit" />
                            </svg>
                            Edit Project
                        </Link>
                    ) : null}
                </div>

                <div className="mb-[18px] flex shrink-0 gap-0 overflow-x-auto border-b border-bion-border">
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
                            className={activeTab === tab ? TAB_BTN_ACTIVE : TAB_BTN}
                            onClick={() => setActiveTab(tab)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                    <div className={cn('min-h-0 flex-col', activeTab === 'details' ? 'flex' : 'hidden')}>
                        <div className="max-w-[460px] overflow-y-auto">
                            <div className="mb-[18px]">
                                <span className={FIELD_LABEL}>Title</span>
                                <input
                                    className={FIELD_INPUT}
                                    value={detailsForm.title}
                                    onChange={(event) =>
                                        setDetailsForm((current) => ({
                                            ...current,
                                            title: event.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="mb-[18px]">
                                <span className={FIELD_LABEL}>Status</span>
                                <select
                                    className={FIELD_INPUT}
                                    value={detailsForm.status}
                                    onChange={(event) =>
                                        setDetailsForm((current) => ({
                                            ...current,
                                            status: event.target.value,
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

                            <div className="mb-[18px]">
                                <span className={FIELD_LABEL}>
                                    Description
                                </span>
                                <textarea
                                    className={cn(FIELD_INPUT, 'resize-y')}
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
                                className={BTN_PRIMARY}
                                onClick={saveDetails}
                                disabled={savingDetails}
                            >
                                {savingDetails ? 'Saving...' : 'Save changes'}
                            </button>

                            {currentTeam ? (
                                <p className="mt-[14px] text-[12.5px] text-bion-text-muted">
                                    Need to change the client, dates, or budget?{' '}
                                    <Link
                                        href={projectEdit({ current_team: currentTeam.slug, project: project.id })}
                                        className="font-medium text-bion-accent underline"
                                    >
                                        Edit full project details
                                    </Link>
                                    .
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className={cn('min-h-0 flex-col', activeTab === 'tasks' ? 'flex' : 'hidden')}>
                        <div className="mb-[14px] flex flex-wrap items-center justify-between gap-[10px]">
                            <div className="flex rounded-[8px] border border-bion-border bg-bion-surface p-[2px]">
                                <button
                                    type="button"
                                    className={cn(
                                        'flex items-center gap-[6px] rounded-[6px] px-[13px] py-[6px] text-[12.5px] font-medium text-bion-text-muted',
                                        taskView === 'board' && 'bg-bion-accent-soft! text-bion-accent!',
                                    )}
                                    onClick={() => setTaskView('board')}
                                >
                                    <svg className={ICON_SM_CLS}>
                                        <use href="#i-kanban" />
                                    </svg>
                                    Board
                                </button>
                                <button
                                    type="button"
                                    className={cn(
                                        'flex items-center gap-[6px] rounded-[6px] px-[13px] py-[6px] text-[12.5px] font-medium text-bion-text-muted',
                                        taskView === 'list' && 'bg-bion-accent-soft! text-bion-accent!',
                                    )}
                                    onClick={() => setTaskView('list')}
                                >
                                    <svg className={ICON_SM_CLS}>
                                        <use href="#i-list" />
                                    </svg>
                                    List
                                </button>
                            </div>

                            <div className="flex gap-[8px]">
                                <button
                                    type="button"
                                    className={BTN_GHOST_SM}
                                    onClick={openExtractModal}
                                >
                                    <svg className={ICON_SM_CLS}>
                                        <use href="#i-sparkles" />
                                    </svg>
                                    Extract with AI
                                </button>
                            </div>
                        </div>

                        <div className="mb-[14px] flex shrink-0 gap-[8px]">
                            <input
                                type="text"
                                className="flex-1 rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[9px] text-[13px] text-bion-text"
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
                                className={BTN_GHOST}
                                onClick={addTask}
                            >
                                Add task
                            </button>
                        </div>

                        {taskView === 'board' ? (
                            <div className="flex min-h-0 flex-1 gap-[14px] overflow-x-auto pb-[8px] max-[900px]:flex-col">
                                {groupedTasks.map((stage) => (
                                    <div key={stage.key} className="flex min-h-0 min-w-[200px] flex-1 flex-col">
                                        <div className="flex shrink-0 items-center gap-[7px] px-[4px] pb-[10px] text-[12.5px] font-semibold text-bion-text-muted">
                                            <span
                                                className="h-[6px] w-[6px] rounded-full"
                                                style={{
                                                    background:
                                                        toneColorMap[stage.tone],
                                                }}
                                            />
                                            {stage.label}
                                            <span className="ml-auto font-mono">
                                                {stage.items.length}
                                            </span>
                                        </div>
                                        <div
                                            className={cn(
                                                'flex min-h-0 flex-1 flex-col gap-[8px] overflow-y-auto rounded-[8px] p-[4px] [transition:background_0.12s_ease]',
                                                draggedTaskId !== null && 'bg-bion-accent-soft',
                                            )}
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
                                                    className="group rounded-[9px] border border-bion-border bg-bion-surface p-[10px_11px] text-[13px] [transition:border-color_0.12s_ease] cursor-pointer hover:border-bion-accent"
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
                                                    <div className="flex items-center justify-between gap-[8px]">
                                                        <span>{task.title}</span>
                                                        <button
                                                            type="button"
                                                            className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[5px] text-bion-text-muted opacity-0 [transition:opacity_0.12s_ease] group-hover:opacity-100 hover:bg-bion-danger-soft hover:text-bion-danger"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                removeTaskQuick(task.id);
                                                            }}
                                                        >
                                                            <svg className={ICON_SM_CLS}>
                                                                <use href="#i-x" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {(task.tags.length > 0 ||
                                                        task.description !==
                                                            '' ||
                                                        task.attachments
                                                            .length > 0) && (
                                                        <div className="mt-[8px] flex flex-wrap items-center gap-[10px]">
                                                            {task.tags.map(
                                                                (tag) => (
                                                                    <span
                                                                        key={tag}
                                                                        className="rounded-full bg-bion-accent-soft px-[8px] py-[2px] text-[10.5px] font-semibold text-bion-accent"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ),
                                                            )}
                                                            {task.description !==
                                                            '' ? (
                                                                <span className="flex items-center gap-[4px] text-[11px] text-bion-text-muted">
                                                                    <svg className="h-[13px] w-[13px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                                                        <use href="#i-align-left" />
                                                                    </svg>
                                                                </span>
                                                            ) : null}
                                                            {task.attachments
                                                                .length > 0 ? (
                                                                <span className="flex items-center gap-[4px] text-[11px] text-bion-text-muted">
                                                                    <svg className="h-[13px] w-[13px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
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
                            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 z-[5] bg-bion-surface">
                                            <tr>
                                                <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                                    Task
                                                </th>
                                                <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child_td]:border-b-0">
                                            {project.tasks.length > 0 ? (
                                                project.tasks.map((task) => (
                                                    <tr key={task.id}>
                                                        <td
                                                            className="cursor-pointer border-b border-bion-border px-[16px] py-[12px] text-[13px]"
                                                            onClick={() =>
                                                                openTaskDetail(
                                                                    task.id,
                                                                )
                                                            }
                                                        >
                                                            {task.title}
                                                        </td>
                                                        <td className="border-b border-bion-border px-[16px] py-[12px] text-[13px]">
                                                            <select
                                                                className="rounded-[6px] border border-bion-border bg-bion-bg px-[8px] py-[5px] text-[12.5px] text-bion-text"
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
                                                        className="border-b border-bion-border px-[16px] py-[12px] text-[12px] text-bion-text-muted italic"
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

                    <div className={cn('min-h-0 flex-col', activeTab === 'reqlog' ? 'flex' : 'hidden')}>
                        <div className="mb-[14px] shrink-0">
                            <div className="mb-[12px] flex justify-end">
                                <button
                                    type="button"
                                    className={BTN_GHOST_SM}
                                    onClick={() => openRequestDetail(null)}
                                >
                                    <svg className={ICON_SM_CLS}>
                                        <use href="#i-plus" />
                                    </svg>
                                    Add Request
                                </button>
                            </div>

                            <label className="mb-[12px] flex items-center gap-[8px] rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[8px] text-bion-text-muted">
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-search" />
                                </svg>
                                <input
                                    type="text"
                                    className="flex-1 border-none bg-transparent text-[13px] text-bion-text outline-none"
                                    placeholder="Search past requests by keyword, content..."
                                    value={reqSearch}
                                    onChange={(event) =>
                                        setReqSearch(event.target.value)
                                    }
                                />
                            </label>

                            <div className="flex flex-wrap gap-[8px]">
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
                                        className={cn(
                                            'rounded-full border border-bion-border bg-bion-surface px-[14px] py-[6px] text-[12.5px] font-medium text-bion-text-muted',
                                            reqFilter === key && 'border-bion-text! bg-bion-text! text-bion-bg!',
                                        )}
                                        onClick={() => setReqFilter(key)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {filteredRequestLogs.length > 0 ? (
                                filteredRequestLogs.map((requestLog) => (
                                    <div
                                        key={requestLog.id}
                                        className="mb-[10px] flex cursor-pointer items-center gap-[16px] rounded-[10px] border border-bion-border bg-bion-surface p-[14px_16px] max-[760px]:flex-col max-[760px]:items-start"
                                        onClick={() =>
                                            openRequestDetail(requestLog.id)
                                        }
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-[6px] text-[13.5px] font-medium">
                                                "{requestLog.text}"
                                            </div>
                                            <div className="flex flex-wrap items-center gap-[7px] text-[12px] text-bion-text-muted">
                                                <svg className={ICON_SM_CLS}>
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
                                                    <span className="flex items-center gap-[4px] text-[11px] text-bion-text-muted">
                                                        <svg className="h-[13px] w-[13px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                                            <use href="#i-align-left" />
                                                        </svg>
                                                    </span>
                                                ) : null}
                                                {requestLog.attachments.length >
                                                0 ? (
                                                    <span className="flex items-center gap-[4px] text-[11px] text-bion-text-muted">
                                                        <svg className="h-[13px] w-[13px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
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
                                            className={cn(
                                                'shrink-0 rounded-full px-[10px] py-[3px] text-[10.5px] font-bold uppercase [letter-spacing:0.03em]',
                                                requestClassMap[
                                                    requestLog.classification
                                                ],
                                            )}
                                        >
                                            {requestLog.classification}
                                        </span>
                                        <div
                                            className="flex shrink-0 gap-[8px] max-[760px]:w-full max-[760px]:flex-wrap"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <button
                                                type="button"
                                                className={BTN_GHOST_SM}
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
                                                className={BTN_GHOST_SM}
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
                                <div className="py-[6px] text-[12px] text-bion-text-muted italic">
                                    No requests match this filter.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cn('min-h-0 flex-col', activeTab === 'activity' ? 'flex' : 'hidden')}>
                        <div className="min-h-0 max-w-[560px] flex-1 overflow-y-auto">
                            {project.activity.length > 0 ? (
                                project.activity.map((entry, index) => (
                                    <div key={`${entry.text}-${index}`} className="flex gap-[12px] p-[11px_4px]">
                                        <div className="flex shrink-0 flex-col items-center pt-[3px]">
                                            <div
                                                className={cn(
                                                    'h-[7px] w-[7px] rounded-full bg-bion-border',
                                                    entry.tone === 'accent' && 'bg-bion-accent',
                                                    entry.tone === 'success' && 'bg-bion-success',
                                                    entry.tone === 'danger' && 'bg-bion-danger',
                                                )}
                                            />
                                            {index < project.activity.length - 1 ? (
                                                <div className="mt-[4px] w-px flex-1 bg-bion-border" />
                                            ) : null}
                                        </div>
                                        <div>
                                            <div className="mb-[2px] text-[13px]">
                                                {entry.text}
                                            </div>
                                            <div className="text-[11.5px] text-bion-text-muted">
                                                {entry.time}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-[6px] text-[12px] text-bion-text-muted italic">
                                    No activity yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={cn(MODAL_BACKDROP, editingTaskId !== null && 'open')}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeTaskDetail();
                    }
                }}
            >
                <div className={cn(MODAL, 'max-w-[520px]')}>
                    <div className={MODAL_HEAD}>
                        <h3 className="text-[15.5px] font-bold">Edit Task</h3>
                        <button
                            type="button"
                            className={SLIDEOVER_CLOSE}
                            onClick={closeTaskDetail}
                        >
                            <svg className={ICON_CLS}>
                                <use href="#i-x" />
                            </svg>
                        </button>
                    </div>

                    <div className={MODAL_BODY}>
                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Title</span>
                            <input
                                className={FIELD_INPUT}
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

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Status</span>
                            <select
                                className={FIELD_INPUT}
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

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Description</span>
                            <textarea
                                className={cn(FIELD_INPUT, 'resize-y')}
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

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Tags</span>
                            <div className="mb-[8px] flex flex-wrap gap-[6px]">
                                {taskDraft?.tags.map((tag, index) => (
                                    <span key={`${tag}-${index}`} className="inline-flex items-center gap-[5px] rounded-full bg-bion-accent-soft py-[3px] pr-[8px] pl-[10px] text-[11.5px] font-medium text-bion-accent">
                                        {tag}
                                        <button
                                            type="button"
                                            className="flex h-[14px] w-[14px] items-center justify-center text-bion-accent opacity-70 hover:opacity-100"
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
                                            <svg className="h-[11px] w-[11px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                                <use href="#i-x" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                className={FIELD_INPUT}
                                placeholder="Type a tag and press Enter"
                                onKeyDown={handleTaskTagEnter}
                            />
                        </div>

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Attachments</span>
                            <div className="mb-[10px] flex flex-col gap-[6px]">
                                {taskDraft?.existingAttachments.map(
                                    (attachment, index) => (
                                        <a
                                            key={`existing-${attachment.name}-${index}`}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-[8px] rounded-[7px] border border-bion-border bg-bion-surface px-[10px] py-[7px] text-[12.5px] hover:border-bion-accent"
                                        >
                                            <svg className={ICON_SM_CLS}>
                                                <use href="#i-paperclip" />
                                            </svg>
                                            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{attachment.name}</span>
                                        </a>
                                    ),
                                )}
                                {taskDraft?.newAttachments.map(
                                    (file, index) => (
                                        <div
                                            key={`new-${file.name}-${index}`}
                                            className="flex items-center gap-[8px] rounded-[7px] border border-bion-border bg-bion-surface px-[10px] py-[7px] text-[12.5px]"
                                        >
                                            <svg className={ICON_SM_CLS}>
                                                <use href="#i-paperclip" />
                                            </svg>
                                            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                                            <button
                                                type="button"
                                                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-bion-text-muted hover:text-bion-danger"
                                                onClick={() =>
                                                    setTaskDraft((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  newAttachments:
                                                                      current.newAttachments.filter(
                                                                          (
                                                                              _file,
                                                                              fileIndex,
                                                                          ) =>
                                                                              fileIndex !==
                                                                              index,
                                                                      ),
                                                              }
                                                            : current,
                                                    )
                                                }
                                            >
                                                <svg className={ICON_SM_CLS}>
                                                    <use href="#i-x" />
                                                </svg>
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-[7px] rounded-[8px] border border-bion-border bg-bion-surface px-[13px] py-[8px] text-[12.5px] font-semibold hover:bg-bion-surface-raised">
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-paperclip" />
                                </svg>
                                Add attachment
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleTaskAttachmentChange}
                                />
                            </label>
                        </div>
                    </div>

                    <div className={cn(MODAL_FOOT, 'justify-between')}>
                        <button
                            type="button"
                            className={cn(BTN_GHOST, 'text-bion-danger')}
                            onClick={deleteTask}
                        >
                            Delete task
                        </button>

                        <div className="flex gap-[10px]">
                            <button
                                type="button"
                                className={BTN_GHOST}
                                onClick={closeTaskDetail}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={BTN_PRIMARY}
                                onClick={saveTaskDetail}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={cn(MODAL_BACKDROP, requestDraft !== null && 'open')}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeRequestDetail();
                    }
                }}
            >
                <div className={cn(MODAL, 'max-w-[520px]')}>
                    <div className={MODAL_HEAD}>
                        <h3 className="text-[15.5px] font-bold">
                            {editingRequestId === null
                                ? 'Add Request'
                                : 'Request Detail'}
                        </h3>
                        <button
                            type="button"
                            className={SLIDEOVER_CLOSE}
                            onClick={closeRequestDetail}
                        >
                            <svg className={ICON_CLS}>
                                <use href="#i-x" />
                            </svg>
                        </button>
                    </div>

                    <div className={MODAL_BODY}>
                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Request text</span>
                            <textarea
                                className={cn(FIELD_INPUT, 'resize-y')}
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

                        <div className="flex gap-[12px] max-[760px]:flex-col">
                            <div className="mb-[18px] flex-1">
                                <span className={FIELD_LABEL}>Source</span>
                                <select
                                    className={FIELD_INPUT}
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

                            <div className="mb-[18px] flex-1">
                                <span className={FIELD_LABEL}>
                                    Classification
                                </span>
                                <select
                                    className={FIELD_INPUT}
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

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Notes</span>
                            <textarea
                                className={cn(FIELD_INPUT, 'resize-y')}
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

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Attachments</span>
                            <div className="mb-[10px] flex flex-col gap-[6px]">
                                {requestDraft?.existingAttachments.map(
                                    (attachment, index) => (
                                        <a
                                            key={`existing-${attachment.name}-${index}`}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-[8px] rounded-[7px] border border-bion-border bg-bion-surface px-[10px] py-[7px] text-[12.5px] hover:border-bion-accent"
                                        >
                                            <svg className={ICON_SM_CLS}>
                                                <use href="#i-paperclip" />
                                            </svg>
                                            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{attachment.name}</span>
                                        </a>
                                    ),
                                )}
                                {requestDraft?.newAttachments.map(
                                    (file, index) => (
                                        <div
                                            key={`new-${file.name}-${index}`}
                                            className="flex items-center gap-[8px] rounded-[7px] border border-bion-border bg-bion-surface px-[10px] py-[7px] text-[12.5px]"
                                        >
                                            <svg className={ICON_SM_CLS}>
                                                <use href="#i-paperclip" />
                                            </svg>
                                            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                                            <button
                                                type="button"
                                                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-bion-text-muted hover:text-bion-danger"
                                                onClick={() =>
                                                    setRequestDraft((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  newAttachments:
                                                                      current.newAttachments.filter(
                                                                          (
                                                                              _file,
                                                                              fileIndex,
                                                                          ) =>
                                                                              fileIndex !==
                                                                              index,
                                                                      ),
                                                              }
                                                            : current,
                                                    )
                                                }
                                            >
                                                <svg className={ICON_SM_CLS}>
                                                    <use href="#i-x" />
                                                </svg>
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-[7px] rounded-[8px] border border-bion-border bg-bion-surface px-[13px] py-[8px] text-[12.5px] font-semibold hover:bg-bion-surface-raised">
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-paperclip" />
                                </svg>
                                Add attachment
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleRequestAttachmentChange}
                                />
                            </label>
                        </div>
                    </div>

                    <div className={cn(MODAL_FOOT, 'justify-between')}>
                        <button
                            type="button"
                            className={cn(
                                BTN_GHOST,
                                editingRequestId === null ? 'text-bion-text' : 'text-bion-danger',
                            )}
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

                        <div className="flex gap-[10px]">
                            <button
                                type="button"
                                className={BTN_GHOST}
                                onClick={closeRequestDetail}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className={BTN_PRIMARY}
                                onClick={saveRequestDetail}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={cn(MODAL_BACKDROP, showExtractModal && 'open')}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeExtractModal();
                    }
                }}
            >
                <div className={cn(MODAL, 'max-w-[560px]')}>
                    <div className={MODAL_HEAD}>
                        <h3 className="flex items-center gap-[6px] text-[15.5px] font-bold">
                            <svg className={cn(ICON_SM_CLS, 'text-bion-accent')}>
                                <use href="#i-sparkles" />
                            </svg>
                            Extract tasks with AI
                        </h3>
                        <button
                            type="button"
                            className={SLIDEOVER_CLOSE}
                            onClick={closeExtractModal}
                        >
                            <svg className={ICON_CLS}>
                                <use href="#i-x" />
                            </svg>
                        </button>
                    </div>

                    <div className={MODAL_BODY}>
                        <div className="mb-[16px] flex rounded-[8px] border border-bion-border bg-bion-surface p-[2px]">
                            <button
                                type="button"
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-[6px] rounded-[6px] px-[13px] py-[6px] text-[12.5px] font-medium text-bion-text-muted',
                                    extractSource === 'text' && 'bg-bion-accent-soft! text-bion-accent!',
                                )}
                                onClick={() => setExtractSource('text')}
                            >
                                Paste Text
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-[6px] rounded-[6px] px-[13px] py-[6px] text-[12.5px] font-medium text-bion-text-muted',
                                    extractSource === 'file' && 'bg-bion-accent-soft! text-bion-accent!',
                                )}
                                onClick={() => setExtractSource('file')}
                            >
                                Upload File
                            </button>
                        </div>

                        {extractSource === 'text' ? (
                            <div className="mb-[18px]">
                                <span className={FIELD_LABEL}>
                                    Paste a description, chat, or any context
                                </span>
                                <textarea
                                    className={cn(FIELD_INPUT, 'resize-y')}
                                    rows={6}
                                    placeholder="Paste a project brief, chat, or meeting notes here..."
                                    value={extractInput}
                                    onChange={(event) =>
                                        setExtractInput(event.target.value)
                                    }
                                />
                            </div>
                        ) : (
                            <div className="mb-[18px]">
                                <span className={FIELD_LABEL}>
                                    Upload a screenshot, photo, or audio recording
                                </span>
                                <label className="inline-flex cursor-pointer items-center gap-[7px] rounded-[8px] border border-bion-border bg-bion-surface px-[13px] py-[8px] text-[12.5px] font-semibold hover:bg-bion-surface-raised">
                                    <svg className={ICON_SM_CLS}>
                                        <use href="#i-paperclip" />
                                    </svg>
                                    Choose file
                                    <input
                                        type="file"
                                        accept="image/*,audio/*"
                                        className="hidden"
                                        onChange={handleExtractFileChange}
                                    />
                                </label>
                                {extractFileNames.length > 0 ? (
                                    <div className="mt-[10px] flex flex-col gap-[8px]">
                                        {extractFileNames.map((fileName) => (
                                            <div
                                                key={fileName}
                                                className="flex items-center gap-[8px] rounded-[7px] border border-bion-border bg-bion-surface px-[10px] py-[7px] text-[12.5px]"
                                            >
                                                <svg className={ICON_SM_CLS}>
                                                    <use href="#i-paperclip" />
                                                </svg>
                                                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{fileName}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {extractCandidates.length > 0 ? (
                            <div>
                                <span className={FIELD_LABEL}>
                                    Suggested tasks, uncheck what you don't need
                                </span>
                                <div>
                                    {extractCandidates.map((candidate) => (
                                        <label
                                            key={candidate.id}
                                            className="flex cursor-pointer items-center gap-[10px] border-b border-bion-border py-[8px] last:border-b-0"
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-[16px] w-[16px] shrink-0 accent-bion-accent"
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

                    <div className={MODAL_FOOT}>
                        <button
                            type="button"
                            className={BTN_GHOST}
                            onClick={closeExtractModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={BTN_PRIMARY}
                            onClick={runExtract}
                            disabled={extractSaving}
                        >
                            {extractSaving
                                ? 'Adding...'
                                : extractCandidates.length > 0
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
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
