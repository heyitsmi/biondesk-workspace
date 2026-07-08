import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as opportunityCreate, edit as opportunityEdit, index as opportunities } from '@/routes/opportunities';
import type {
    BiondeskTone,
    OpportunitiesPageProps,
} from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised');

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

type SortKey = 'value' | 'activity';

export default function OpportunitiesPage({
    defaultView,
    stages,
    opportunities: initialOpportunities,
}: OpportunitiesPageProps) {
    const { currentTeam } = usePage().props;
    const [view, setView] = useState<'board' | 'list'>(defaultView);
    const [items, setItems] = useState(initialOpportunities);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({
        key: 'value',
        asc: true,
    });
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [draggedOpportunityId, setDraggedOpportunityId] =
        useState<number | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    const [showConfirmProjectModal, setShowConfirmProjectModal] = useState<string | null>(null);

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

    const visitEditOpportunity = (opportunityId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(opportunityEdit({ current_team: currentTeam.slug, opportunity: opportunityId }));
    };

    const visitCreateOpportunity = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(opportunityCreate(currentTeam.slug));
    };

    const handleDropToStage = (stageKey: string): void => {
        if (draggedOpportunityId !== null) {
            setOpportunityStage(draggedOpportunityId, stageKey);
        }

        setDraggedOpportunityId(null);
        setDragOverStage(null);
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

            <div className="flex min-h-0 flex-1 flex-col">
                <p className="mb-[14px] shrink-0 text-[13px] text-bion-text-muted">
                    Track leads from any source, from first contact to won or
                    lost.
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
                                placeholder="Search opportunities or clients..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        onClick={() => visitCreateOpportunity()}
                    >
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-plus" />
                        </svg>
                        New Opportunity
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
                                        {stage.items.length > 0 ? (
                                            stage.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    className={cn(
                                                        'cursor-pointer rounded-[10px] border border-bion-border border-l-[3px] bg-bion-surface p-[12px] [transition:border-color_0.12s_ease,box-shadow_0.12s_ease,opacity_0.12s_ease] hover:border-bion-accent hover:shadow-bion-raised',
                                                        draggedOpportunityId === item.id && 'opacity-35',
                                                    )}
                                                    draggable
                                                    style={{
                                                        borderLeftColor:
                                                            toneColorMap[
                                                                item.tone
                                                            ],
                                                    }}
                                                    onClick={() =>
                                                        visitEditOpportunity(
                                                            item.id,
                                                        )
                                                    }
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter' || event.key === ' ') {
                                                            event.preventDefault();
                                                            visitEditOpportunity(item.id);
                                                        }
                                                    }}
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

                                                    <div className="mb-[12px] text-[12px] text-bion-text-muted">
                                                        {item.company}
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11.5px]">
                                                        <span className="text-bion-text-muted">
                                                            {item.source}
                                                        </span>
                                                        <span className="font-mono font-semibold">
                                                            {item.amount}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-[10px] border border-dashed border-bion-border p-[18px_14px] text-center text-[12.5px] text-bion-text-muted">
                                                No visible opportunities.
                                            </div>
                                        )}
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
                                                Opportunity
                                            </th>
                                            <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none">
                                                Stage
                                            </th>
                                            <th className="border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none">
                                                Source
                                            </th>
                                            <th
                                                className="cursor-pointer border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none"
                                                onClick={() =>
                                                    toggleSort('value')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-[4px]">
                                                    Value
                                                    <svg className={ICON_SM_CLS}>
                                                        <use href="#i-chevron-down" />
                                                    </svg>
                                                </span>
                                            </th>
                                            <th
                                                className="cursor-pointer border-b border-bion-border px-[16px] py-[12px] text-left text-[11px] text-bion-text-muted uppercase [letter-spacing:0.05em] select-none"
                                                onClick={() =>
                                                    toggleSort('activity')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-[4px]">
                                                    Last Activity
                                                    <svg className={ICON_SM_CLS}>
                                                        <use href="#i-chevron-down" />
                                                    </svg>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child_td]:border-b-0">
                                        {listItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="cursor-pointer [transition:background_0.1s_ease] hover:[&>td]:bg-bion-bg"
                                                onClick={() =>
                                                    visitEditOpportunity(
                                                        item.id,
                                                    )
                                                }
                                            >
                                                <td className="border-b border-bion-border px-[16px] py-[13px] text-[13px]">
                                                    <div className="mb-[2px] font-medium">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-[12px] text-bion-text-muted">
                                                        {item.company}
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
                                                <td className="border-b border-bion-border px-[16px] py-[13px] text-[12px] text-bion-text-muted">
                                                    {item.source}
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[13px] text-right font-mono text-[13px] font-medium">
                                                    {item.amount}
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[13px] text-[12px] text-bion-text-muted">
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
                    className={cn(
                        'group/modal fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-[20px] opacity-0 pointer-events-none [transition:opacity_0.15s_ease] [&.open]:opacity-100! [&.open]:pointer-events-auto!',
                        showConfirmProjectModal && 'open',
                    )}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowConfirmProjectModal(null);
                        }
                    }}
                >
                    <div className="w-full max-w-[440px] rounded-[14px] border border-bion-border bg-bion-surface-raised shadow-[0_24px_60px_rgba(0,0,0,0.4)] [transform:translateY(-10px)_scale(0.98)] [transition:transform_0.15s_ease] group-[.open]/modal:[transform:translateY(0)_scale(1)]">
                        <div className="border-b border-bion-border p-[18px_20px]">
                            <h3 className="text-[15.5px] font-bold">Nice, deal won!</h3>
                        </div>
                        <div className="p-[20px]">
                            <p className="text-[13.5px] leading-[1.6] text-bion-text-muted">
                                Want to create a Project for{' '}
                                <strong>{showConfirmProjectModal}</strong> now,
                                so you can start tracking tasks right away?
                            </p>
                        </div>
                        <div className="flex justify-end gap-[10px] border-t border-bion-border p-[16px_20px]">
                            <button
                                type="button"
                                className={BTN_GHOST}
                                onClick={() =>
                                    setShowConfirmProjectModal(null)
                                }
                            >
                                Not now
                            </button>
                            <button
                                type="button"
                                className={BTN_PRIMARY}
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
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
