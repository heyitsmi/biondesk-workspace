export type CalendarColor = 'accent' | 'success' | 'danger' | 'info' | 'muted';

export type EventRecurrence = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type CalendarEventKind =
    'event' | 'invoice' | 'quote' | 'project' | 'opportunity';

export type CalendarEventExtendedProps = {
    kind: 'event';
    recordId: number;
    description: string;
    location: string;
    colorToken: CalendarColor;
    recurring: boolean;
    recurrence: EventRecurrence | null;
};

export type CalendarEventItem = {
    id: string;
    title: string;
    allDay: boolean;
    editable: boolean;
    backgroundColor: string;
    borderColor: string;
    extendedProps: CalendarEventExtendedProps;
    start?: string;
    end?: string | null;
    rrule?: { freq: EventRecurrence; dtstart: string };
    duration?: string | { days: number };
};

export type CalendarAggregatedExtendedProps = {
    kind: Exclude<CalendarEventKind, 'event'>;
    recordId: number;
};

export type CalendarAggregatedItem = {
    id: string;
    title: string;
    start: string;
    allDay: true;
    editable: false;
    backgroundColor: string;
    borderColor: string;
    extendedProps: CalendarAggregatedExtendedProps;
};

export type CalendarPageProps = {
    events: CalendarEventItem[];
    aggregated: CalendarAggregatedItem[];
};
