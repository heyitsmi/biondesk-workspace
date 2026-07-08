import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as projectCreate, edit as projectEdit, index as projects, show as projectShow } from '@/routes/projects';
import type {
    BiondeskTone,
    ProjectItem,
    ProjectsPageProps,
} from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');

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

const toneColorMap: Record<BiondeskTone, string> = {
    accent: 'var(--bion-accent)',
    success: 'var(--bion-success)',
    danger: 'var(--bion-danger)',
    muted: 'var(--bion-text-muted)',
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

    const visitEditProject = (projectId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(projectEdit({ current_team: currentTeam.slug, project: projectId }));
    };

    const visitCreateProject = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(projectCreate(currentTeam.slug));
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

    return (
        <>
            <Head title="Projects" />

            <div className="flex min-h-0 flex-1 flex-col">
                <p className="mb-[14px] shrink-0 text-[13px] text-bion-text-muted">
                    Every project&apos;s execution, from tasks to client
                    requests, tracked in one place.
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
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-kanban" />
                                </svg>
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
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-list" />
                                </svg>
                                List
                            </button>
                        </div>

                        <label className="flex w-[260px] items-center gap-[8px] rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[7px] text-bion-text-muted max-[760px]:w-full">
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-search" />
                            </svg>
                            <input
                                type="text"
                                className="flex-1 border-none bg-transparent text-[13px] text-bion-text outline-none"
                                placeholder="Search projects or clients..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        onClick={visitCreateProject}
                    >
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-plus" />
                        </svg>
                        New Project
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                    {view === 'board' ? (
                        <div className="flex min-h-0 flex-1 items-stretch gap-[14px] overflow-x-auto overflow-y-hidden pb-[10px]">
                            {groupedItems.map((stage) => (
                                <div key={stage.key} className="flex w-[272px] shrink-0 flex-col min-h-0">
                                    <div className="flex shrink-0 items-center justify-between px-[6px] pt-[4px] pb-[12px]">
                                        <span className="flex items-center gap-[8px] text-[13px] font-semibold">
                                            <span
                                                className="h-[7px] w-[7px] rounded-full"
                                                style={{ background: toneColorMap[stage.tone] }}
                                            />
                                            {stage.label}
                                        </span>
                                        <span className="font-mono text-[12px] text-bion-text-muted">
                                            {stage.items.length}
                                        </span>
                                    </div>

                                    <div
                                        className={cn(
                                            'flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto rounded-[10px] p-[4px_6px_4px_4px] [transition:background_0.12s_ease]',
                                            dragOverStage === stage.key && 'bg-bion-accent-soft',
                                        )}
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
                                                <div
                                                    key={item.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    className={cn(
                                                        'cursor-pointer rounded-[10px] border border-bion-border border-l-[3px] bg-bion-surface p-[12px] [transition:border-color_0.12s_ease,box-shadow_0.12s_ease,opacity_0.12s_ease] hover:border-bion-accent hover:shadow-bion-raised',
                                                        draggedProjectId === item.id && 'opacity-35',
                                                    )}
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
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter' || event.key === ' ') {
                                                            event.preventDefault();
                                                            visitProjectDetail(item.id);
                                                        }
                                                    }}
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
                                                    <div className="mb-[8px] flex items-start justify-between gap-[8px]">
                                                        <span className="text-[13.5px] font-semibold leading-[1.35]">
                                                            {item.title}
                                                        </span>

                                                        <div
                                                            className="relative shrink-0"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-bg hover:text-bion-text"
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
                                                                <svg className={ICON_SM_CLS}>
                                                                    <use href="#i-more" />
                                                                </svg>
                                                            </button>

                                                            <div
                                                                className={cn(
                                                                    'absolute top-[26px] right-0 z-20 w-[170px] rounded-[10px] border border-bion-border bg-bion-surface-raised p-[6px] opacity-0 pointer-events-none shadow-bion-raised [transform:translateY(-4px)_scale(0.98)] [transition:opacity_0.12s_ease,transform_0.12s_ease]',
                                                                    menuOpenId === item.id &&
                                                                        'opacity-100! pointer-events-auto! [transform:translateY(0)_scale(1)]!',
                                                                )}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-text hover:bg-bion-bg"
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
                                                                <button
                                                                    type="button"
                                                                    className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-text hover:bg-bion-bg"
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        event.stopPropagation();
                                                                        setMenuOpenId(null);
                                                                        visitEditProject(item.id);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <div className="px-[8px] pt-[6px] pb-[4px] text-[11px] text-bion-text-muted uppercase">
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
                                                                            className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-left text-[13px] text-bion-text hover:bg-bion-bg"
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

                                                    <div className="mb-[12px] text-[12px] text-bion-text-muted">
                                                        {item.client}
                                                    </div>

                                                    <div className="mb-[11px] flex items-center gap-[8px]">
                                                        <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-bion-border">
                                                            <div
                                                                className="h-full rounded-full bg-bion-accent [transition:width_0.2s_ease]"
                                                                style={{
                                                                    width: `${percent}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="shrink-0 font-mono text-[11px] text-bion-text-muted">
                                                            {done}/{total}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11.5px]">
                                                        <span className="flex items-center gap-[5px] text-bion-text-muted">
                                                            <svg className="h-[12px] w-[12px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                                                <use href="#i-calendar" />
                                                            </svg>
                                                            {item.dueAt}
                                                        </span>
                                                        {item.requestLogs.length >
                                                        0 ? (
                                                            <span className="inline-flex items-center gap-[4px] rounded-full bg-bion-danger-soft px-[8px] py-[2px] font-semibold text-bion-danger">
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
                                                </div>
                                            );
                                        })}
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
                                                Project
                                            </th>
                                            <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none">
                                                Status
                                            </th>
                                            <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none">
                                                Progress
                                            </th>
                                            <th
                                                className="cursor-pointer border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none"
                                                onClick={() =>
                                                    setSortAsc((current) => !current)
                                                }
                                            >
                                                <span className="inline-flex items-center gap-[4px]">
                                                    Due Date
                                                    <svg className={ICON_SM_CLS}>
                                                        <use href="#i-chevron-down" />
                                                    </svg>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child_td]:border-b-0">
                                        {listItems.map((item) => {
                                            const { done, total, percent } =
                                                projectProgress(item);

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="cursor-pointer [transition:background_0.1s_ease] hover:[&>td]:bg-bion-bg"
                                                    onClick={() =>
                                                        visitProjectDetail(item.id)
                                                    }
                                                >
                                                    <td className="border-b border-bion-border px-[16px] py-[13px] text-[13px]">
                                                        <div className="mb-[2px] font-medium">
                                                            {item.title}
                                                        </div>
                                                        <div className="text-[12px] text-bion-text-muted">
                                                            {item.client}
                                                        </div>
                                                    </td>
                                                    <td className="border-b border-bion-border px-[16px] py-[13px] text-[13px]">
                                                        <span
                                                            className={
                                                                toneClassMap[
                                                                    item.tone
                                                                ]
                                                            }
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'h-[6px] w-[6px] rounded-full',
                                                                    toneDotMap[item.tone],
                                                                )}
                                                            />
                                                            {item.stageLabel}
                                                        </span>
                                                    </td>
                                                    <td className="border-b border-bion-border px-[16px] py-[13px] text-[13px]">
                                                        <div className="flex w-[120px] items-center gap-[8px]">
                                                            <div className="h-[5px] w-[60px] shrink-0 overflow-hidden rounded-full bg-bion-border">
                                                                <div
                                                                    className="h-full rounded-full bg-bion-accent [transition:width_0.2s_ease]"
                                                                    style={{
                                                                        width: `${percent}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="font-mono text-[11px] text-bion-text-muted">
                                                                {done}/{total}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="border-b border-bion-border px-[16px] py-[13px] text-[12px] text-bion-text-muted">
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
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
