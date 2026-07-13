import type {
    EventClickArg,
    EventDropArg,
    EventInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {
    DateClickArg,
    EventResizeDoneArg,
} from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import rrulePlugin from '@fullcalendar/rrule';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as calendarIndex } from '@/routes/calendar';
import {
    destroy as destroyEvent,
    move as moveEvent,
    store as storeEvent,
    update as updateEvent,
} from '@/routes/calendar/events';
import { show as invoiceShow } from '@/routes/invoices';
import { index as opportunitiesIndex } from '@/routes/opportunities';
import { show as projectShow } from '@/routes/projects';
import { show as quotationShow } from '@/routes/quotations';
import type {
    CalendarColor,
    CalendarEventItem,
    CalendarEventKind,
    CalendarPageProps,
    EventRecurrence,
} from '@/types/calendar';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';
const BTN_PRIMARY = cn(
    BTN,
    'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]',
);
const BTN_GHOST = cn(
    BTN,
    'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised',
);

const FIELD_LABEL =
    'mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-surface px-[11px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none';

const MODAL_BACKDROP =
    'group/modal fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-[20px] opacity-0 pointer-events-none [transition:opacity_0.15s_ease] [&.open]:opacity-100! [&.open]:pointer-events-auto!';
const MODAL =
    'w-full max-w-[440px] rounded-[14px] border border-bion-border bg-bion-surface-raised shadow-[0_24px_60px_rgba(0,0,0,0.4)] [transform:translateY(-10px)_scale(0.98)] [transition:transform_0.15s_ease] group-[.open]/modal:[transform:translateY(0)_scale(1)]';
const MODAL_HEAD =
    'flex items-center justify-between border-b border-bion-border p-[18px_20px]';
const MODAL_BODY = 'max-h-[60vh] overflow-y-auto p-[20px]';
const MODAL_FOOT =
    'flex justify-end gap-[10px] border-t border-bion-border p-[16px_20px]';
const SLIDEOVER_CLOSE =
    'flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] text-bion-text-muted hover:bg-bion-bg hover:text-bion-text';

const SOURCE_FILTERS: Array<{
    kind: CalendarEventKind;
    label: string;
    dot: string;
}> = [
    { kind: 'event', label: 'My Events', dot: 'bg-bion-accent' },
    { kind: 'invoice', label: 'Invoice Due', dot: 'bg-bion-danger' },
    { kind: 'quote', label: 'Quote Expiry', dot: 'bg-bion-accent' },
    { kind: 'project', label: 'Project Deadline', dot: 'bg-bion-info' },
    { kind: 'opportunity', label: 'Opportunity Close', dot: 'bg-bion-success' },
];

const COLOR_SWATCHES: Array<{
    value: CalendarColor;
    label: string;
    hex: string;
}> = [
    { value: 'accent', label: 'Amber', hex: '#e8a33d' },
    { value: 'success', label: 'Green', hex: '#34a87c' },
    { value: 'danger', label: 'Red', hex: '#e5484d' },
    { value: 'info', label: 'Blue', hex: '#60a5fa' },
    { value: 'muted', label: 'Gray', hex: '#8b93a6' },
];

const RECURRENCE_OPTIONS: Array<{
    value: EventRecurrence | '';
    label: string;
}> = [
    { value: '', label: 'Does not repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

type EventDraft = {
    title: string;
    description: string;
    allDay: boolean;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    location: string;
    color: CalendarColor;
    recurrence: EventRecurrence | '';
};

const pad = (value: number): string => String(value).padStart(2, '0');

const toDateInput = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toTimeInput = (date: Date): string =>
    `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const addMinutes = (date: Date, minutes: number): Date =>
    new Date(date.getTime() + minutes * 60000);

const parseFloatingDateTime = (value: string): Date => {
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);

    if (!timePart) {
        return new Date(year, month - 1, day);
    }

    const [hour, minute, second] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second ?? 0);
};

const emptyDraft = (baseDate: Date, allDay: boolean): EventDraft => ({
    title: '',
    description: '',
    allDay,
    startDate: toDateInput(baseDate),
    startTime: allDay ? '09:00' : toTimeInput(baseDate),
    endDate: toDateInput(baseDate),
    endTime: allDay ? '10:00' : toTimeInput(addMinutes(baseDate, 60)),
    location: '',
    color: 'accent',
    recurrence: '',
});

const draftFromEventItem = (item: CalendarEventItem): EventDraft => {
    const allDay = item.allDay;
    let start: Date;
    let end: Date;

    if (item.extendedProps.recurring && item.rrule) {
        start = parseFloatingDateTime(item.rrule.dtstart);

        if (
            allDay &&
            item.duration !== undefined &&
            typeof item.duration === 'object'
        ) {
            end = new Date(start);
            end.setDate(
                end.getDate() + Math.max(0, (item.duration.days ?? 1) - 1),
            );
        } else if (!allDay && typeof item.duration === 'string') {
            const [hours, minutes] = item.duration.split(':').map(Number);
            end = addMinutes(start, hours * 60 + minutes);
        } else {
            end = start;
        }
    } else {
        start = item.start ? parseFloatingDateTime(item.start) : new Date();
        end = item.end ? parseFloatingDateTime(item.end) : start;
    }

    return {
        title: item.title,
        description: item.extendedProps.description,
        allDay,
        startDate: toDateInput(start),
        startTime: allDay ? '09:00' : toTimeInput(start),
        endDate: toDateInput(end),
        endTime: allDay ? '10:00' : toTimeInput(end),
        location: item.extendedProps.location,
        color: item.extendedProps.colorToken,
        recurrence: item.extendedProps.recurrence ?? '',
    };
};

export default function CalendarPage({
    events,
    aggregated,
}: CalendarPageProps) {
    const { currentTeam } = usePage().props;
    const [visibleKinds, setVisibleKinds] = useState<Set<CalendarEventKind>>(
        () => new Set(SOURCE_FILTERS.map((filter) => filter.kind)),
    );
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draft, setDraft] = useState<EventDraft | null>(null);
    const [isNew, setIsNew] = useState(false);

    const calendarEvents = useMemo<EventInput[]>(() => {
        const sources = [
            ...(visibleKinds.has('event') ? events : []),
            ...aggregated.filter((item) =>
                visibleKinds.has(item.extendedProps.kind),
            ),
        ];

        return sources as unknown as EventInput[];
    }, [events, aggregated, visibleKinds]);

    const toggleSource = (kind: CalendarEventKind): void => {
        setVisibleKinds((current) => {
            const next = new Set(current);

            if (next.has(kind)) {
                next.delete(kind);
            } else {
                next.add(kind);
            }

            return next;
        });
    };

    const closeModal = (): void => {
        setDraft(null);
        setEditingId(null);
        setIsNew(false);
    };

    const openCreateModal = (
        baseDate: Date = new Date(),
        allDay = false,
    ): void => {
        setEditingId(null);
        setIsNew(true);
        setDraft(emptyDraft(baseDate, allDay));
    };

    const openEditModal = (item: CalendarEventItem): void => {
        setEditingId(item.extendedProps.recordId);
        setIsNew(false);
        setDraft(draftFromEventItem(item));
    };

    const handleDateClick = (info: DateClickArg): void => {
        openCreateModal(info.date, info.allDay);
    };

    const handleEventClick = (info: EventClickArg): void => {
        if (!currentTeam) {
            return;
        }

        const kind = info.event.extendedProps.kind as CalendarEventKind;
        const recordId = info.event.extendedProps.recordId as number;

        if (kind === 'invoice') {
            router.visit(
                invoiceShow({
                    current_team: currentTeam.slug,
                    invoice: recordId,
                }).url,
            );

            return;
        }

        if (kind === 'quote') {
            router.visit(
                quotationShow({
                    current_team: currentTeam.slug,
                    quotation: recordId,
                }).url,
            );

            return;
        }

        if (kind === 'project') {
            router.visit(
                projectShow({
                    current_team: currentTeam.slug,
                    project: recordId,
                }).url,
            );

            return;
        }

        if (kind === 'opportunity') {
            router.visit(opportunitiesIndex(currentTeam.slug).url);

            return;
        }

        const item = events.find(
            (event) => event.extendedProps.recordId === recordId,
        );

        if (item) {
            openEditModal(item);
        }
    };

    const handleEventDropOrResize = (
        info: EventDropArg | EventResizeDoneArg,
    ): void => {
        if (!currentTeam) {
            info.revert();

            return;
        }

        const kind = info.event.extendedProps.kind as CalendarEventKind;
        const recurring = info.event.extendedProps.recurring as boolean;

        if (kind !== 'event' || recurring || !info.event.start) {
            info.revert();

            return;
        }

        const allDay = info.event.allDay;
        const start = info.event.start;
        const end = info.event.end;
        const recordId = info.event.extendedProps.recordId as number;

        const startsAt = allDay
            ? toDateInput(start)
            : `${toDateInput(start)}T${toTimeInput(start)}:00`;
        const endsAt = end
            ? allDay
                ? toDateInput(end)
                : `${toDateInput(end)}T${toTimeInput(end)}:00`
            : null;

        router.patch(
            moveEvent({ current_team: currentTeam.slug, event: recordId }).url,
            { starts_at: startsAt, ends_at: endsAt },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => info.revert(),
            },
        );
    };

    const saveDraft = (): void => {
        if (!currentTeam || draft === null || draft.title.trim() === '') {
            return;
        }

        const startsAt = draft.allDay
            ? draft.startDate
            : `${draft.startDate}T${draft.startTime}:00`;
        const endsAt = draft.allDay
            ? draft.endDate !== draft.startDate
                ? draft.endDate
                : null
            : `${draft.endDate}T${draft.endTime}:00`;

        const payload = {
            title: draft.title.trim(),
            description: draft.description,
            starts_at: startsAt,
            ends_at: endsAt,
            all_day: draft.allDay,
            location: draft.location,
            color: draft.color,
            recurrence: draft.recurrence === '' ? null : draft.recurrence,
        };

        if (isNew || editingId === null) {
            router.post(storeEvent(currentTeam.slug).url, payload, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        router.put(
            updateEvent({ current_team: currentTeam.slug, event: editingId })
                .url,
            payload,
            { preserveScroll: true, onSuccess: closeModal },
        );
    };

    const deleteDraft = (): void => {
        if (!currentTeam || editingId === null) {
            return;
        }

        router.delete(
            destroyEvent({ current_team: currentTeam.slug, event: editingId })
                .url,
            {
                preserveScroll: true,
                onSuccess: closeModal,
            },
        );
    };

    const setDraftField = <K extends keyof EventDraft>(
        key: K,
        value: EventDraft[K],
    ): void => {
        setDraft((current) =>
            current ? { ...current, [key]: value } : current,
        );
    };

    return (
        <>
            <Head title="Calendar" />

            <div className="flex min-h-0 flex-1 flex-col">
                <div className="mb-[16px] flex shrink-0 items-center justify-between gap-[12px]">
                    <h1 className="text-[21px] font-bold">Calendar</h1>
                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        onClick={() => openCreateModal()}
                    >
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-plus" />
                        </svg>
                        Add Event
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 gap-[18px] max-[900px]:flex-col">
                    <aside className="w-[220px] shrink-0 max-[900px]:w-full">
                        <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[14px]">
                            <span className={FIELD_LABEL}>Sources</span>
                            <div className="flex flex-col gap-[10px]">
                                {SOURCE_FILTERS.map((filter) => (
                                    <label
                                        key={filter.kind}
                                        className="flex cursor-pointer items-center gap-[9px] text-[13px] text-bion-text"
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-[15px] w-[15px] shrink-0 accent-bion-accent"
                                            checked={visibleKinds.has(
                                                filter.kind,
                                            )}
                                            onChange={() =>
                                                toggleSource(filter.kind)
                                            }
                                        />
                                        <span
                                            className={cn(
                                                'h-[8px] w-[8px] shrink-0 rounded-full',
                                                filter.dot,
                                            )}
                                        />
                                        {filter.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div className="min-h-0 flex-1 overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface p-[14px]">
                        <FullCalendar
                            plugins={[
                                dayGridPlugin,
                                timeGridPlugin,
                                listPlugin,
                                interactionPlugin,
                                rrulePlugin,
                            ]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                            }}
                            height="100%"
                            events={calendarEvents}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            eventDrop={handleEventDropOrResize}
                            eventResize={handleEventDropOrResize}
                        />
                    </div>
                </div>
            </div>

            <div
                className={cn(MODAL_BACKDROP, draft !== null && 'open')}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeModal();
                    }
                }}
            >
                <div className={cn(MODAL, 'max-w-[480px]')}>
                    <div className={MODAL_HEAD}>
                        <h3 className="text-[15.5px] font-bold">
                            {isNew ? 'Add Event' : 'Edit Event'}
                        </h3>
                        <button
                            type="button"
                            className={SLIDEOVER_CLOSE}
                            onClick={closeModal}
                        >
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-x" />
                            </svg>
                        </button>
                    </div>

                    <div className={MODAL_BODY}>
                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Title</span>
                            <input
                                className={FIELD_INPUT}
                                value={draft?.title ?? ''}
                                onChange={(event) =>
                                    setDraftField('title', event.target.value)
                                }
                            />
                        </div>

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Description</span>
                            <textarea
                                className={cn(FIELD_INPUT, 'resize-y')}
                                rows={2}
                                value={draft?.description ?? ''}
                                onChange={(event) =>
                                    setDraftField(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <label className="mb-[18px] flex cursor-pointer items-center gap-[9px] text-[13px] text-bion-text">
                            <input
                                type="checkbox"
                                className="h-[15px] w-[15px] shrink-0 accent-bion-accent"
                                checked={draft?.allDay ?? false}
                                onChange={(event) =>
                                    setDraftField(
                                        'allDay',
                                        event.target.checked,
                                    )
                                }
                            />
                            All-day event
                        </label>

                        <div className="mb-[18px] flex gap-[10px] max-[480px]:flex-col">
                            <div className="flex-1">
                                <span className={FIELD_LABEL}>Start date</span>
                                <input
                                    type="date"
                                    className={FIELD_INPUT}
                                    value={draft?.startDate ?? ''}
                                    onChange={(event) =>
                                        setDraftField(
                                            'startDate',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            {!draft?.allDay ? (
                                <div className="flex-1">
                                    <span className={FIELD_LABEL}>
                                        Start time
                                    </span>
                                    <input
                                        type="time"
                                        className={FIELD_INPUT}
                                        value={draft?.startTime ?? ''}
                                        onChange={(event) =>
                                            setDraftField(
                                                'startTime',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="mb-[18px] flex gap-[10px] max-[480px]:flex-col">
                            <div className="flex-1">
                                <span className={FIELD_LABEL}>End date</span>
                                <input
                                    type="date"
                                    className={FIELD_INPUT}
                                    value={draft?.endDate ?? ''}
                                    onChange={(event) =>
                                        setDraftField(
                                            'endDate',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            {!draft?.allDay ? (
                                <div className="flex-1">
                                    <span className={FIELD_LABEL}>
                                        End time
                                    </span>
                                    <input
                                        type="time"
                                        className={FIELD_INPUT}
                                        value={draft?.endTime ?? ''}
                                        onChange={(event) =>
                                            setDraftField(
                                                'endTime',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Location</span>
                            <input
                                className={FIELD_INPUT}
                                value={draft?.location ?? ''}
                                onChange={(event) =>
                                    setDraftField(
                                        'location',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="mb-[18px]">
                            <span className={FIELD_LABEL}>Color</span>
                            <div className="flex gap-[8px]">
                                {COLOR_SWATCHES.map((swatch) => (
                                    <button
                                        key={swatch.value}
                                        type="button"
                                        title={swatch.label}
                                        className={cn(
                                            'h-[24px] w-[24px] shrink-0 rounded-full border-2',
                                            draft?.color === swatch.value
                                                ? 'border-bion-text'
                                                : 'border-transparent',
                                        )}
                                        style={{ background: swatch.hex }}
                                        onClick={() =>
                                            setDraftField('color', swatch.value)
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-[6px]">
                            <span className={FIELD_LABEL}>Repeat</span>
                            <select
                                className={FIELD_INPUT}
                                value={draft?.recurrence ?? ''}
                                onChange={(event) =>
                                    setDraftField(
                                        'recurrence',
                                        event.target.value as
                                            EventRecurrence | '',
                                    )
                                }
                            >
                                {RECURRENCE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={cn(MODAL_FOOT, 'justify-between')}>
                        {!isNew ? (
                            <button
                                type="button"
                                className={cn(BTN_GHOST, 'text-bion-danger')}
                                onClick={deleteDraft}
                            >
                                Delete event
                            </button>
                        ) : (
                            <span />
                        )}

                        <div className="flex gap-[10px]">
                            <button
                                type="button"
                                className={BTN_GHOST}
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={BTN_PRIMARY}
                                onClick={saveDraft}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

CalendarPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Calendar',
            href: props.currentTeam
                ? calendarIndex(props.currentTeam.slug)
                : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] py-[24px] max-[760px]:px-[16px] max-[760px]:pt-[20px] max-[760px]:pb-[40px]',
});
