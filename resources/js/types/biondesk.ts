export type BiondeskTone = 'accent' | 'success' | 'danger' | 'muted';

export type DashboardStat = {
    label: string;
    value: string;
    change: string;
    tone: BiondeskTone;
};

export type DashboardPriorityAction = {
    id: number;
    title: string;
    company: string;
    amount: string;
    actionLabel: string;
    tone: BiondeskTone;
};

export type DashboardOpportunity = {
    id: number;
    title: string;
    client: string;
    amount: string;
    stageLabel: string;
    tone: BiondeskTone;
};

export type ActivityItem = {
    title: string;
    when: string;
    tone: BiondeskTone;
};

export type PipelineStage = {
    key: string;
    label: string;
    tone: BiondeskTone;
    count?: number;
};

export type DashboardPageProps = {
    stats: DashboardStat[];
    priorityActions: DashboardPriorityAction[];
    recentOpportunities: DashboardOpportunity[];
    activityFeed: ActivityItem[];
};

export type OpportunitySummary = {
    openCount: string;
    winRate: string;
    averageValue: string;
};

export type OpportunityItem = {
    id: number;
    title: string;
    company: string;
    contact: string;
    source: string;
    amount: string;
    amountValue: number;
    stage: string;
    stageLabel: string;
    tone: BiondeskTone;
    lastActivity: string;
    activityOrder: number;
    summary: string;
};

export type OpportunitiesPageProps = {
    defaultView: 'board' | 'list';
    summary: OpportunitySummary;
    stages: PipelineStage[];
    opportunities: OpportunityItem[];
};

export type ProjectTask = {
    id: number;
    title: string;
    done: boolean;
};

export type ProjectTaskStatus =
    | 'backlog'
    | 'todo'
    | 'in_progress'
    | 'in_review'
    | 'done';

export type ProjectAttachment = {
    name: string;
};

export type ProjectDetailTask = {
    id: number;
    title: string;
    status: ProjectTaskStatus;
    description: string;
    tags: string[];
    attachments: ProjectAttachment[];
};

export type ProjectRequestLog = {
    id: number;
    message: string;
    createdAt: string;
};

export type ProjectRequestClassification =
    | 'new'
    | 'duplicate'
    | 'related'
    | 'contradiction';

export type ProjectRequestSource =
    | 'WhatsApp'
    | 'Email'
    | 'Telegram'
    | 'Phone call'
    | 'Other';

export type ProjectDetailRequestLog = {
    id: number;
    text: string;
    source: ProjectRequestSource;
    date: string;
    classification: ProjectRequestClassification;
    notes: string;
    attachments: ProjectAttachment[];
};

export type ProjectActivityEntry = {
    text: string;
    time: string;
    tone: BiondeskTone;
};

export type ProjectItem = {
    id: number;
    title: string;
    client: string;
    stage: string;
    stageLabel: string;
    tone: BiondeskTone;
    progress: number;
    dueAt: string;
    dueOrder: number;
    budget: string;
    requestLogCount: number;
    tasks: ProjectTask[];
    requestLogs: ProjectRequestLog[];
};

export type ProjectsPageProps = {
    defaultView: 'board' | 'list';
    summary: {
        activeCount: string;
        waitingCount: string;
        completionRate: string;
    };
    stages: PipelineStage[];
    projects: ProjectItem[];
};

export type ProjectDetail = {
    id: number;
    title: string;
    client: string;
    stage: string;
    stageLabel: string;
    tone: BiondeskTone;
    dueAt: string;
    description: string;
    tasks: ProjectDetailTask[];
    requestLogs: ProjectDetailRequestLog[];
    activity: ProjectActivityEntry[];
};

export type ProjectShowPageProps = {
    project: ProjectDetail;
    stages: PipelineStage[];
    defaultTaskView: 'board' | 'list';
    taskStages: Array<{
        key: ProjectTaskStatus;
        label: string;
        tone: BiondeskTone;
    }>;
};

export type ProposalLineItem = {
    label: string;
    amount: string;
};

export type ProposalDocument = {
    id: number;
    title: string;
    number: string;
    client: string;
    stage: string;
    stageLabel: string;
    tone: BiondeskTone;
    amount: string;
    amountValue: number;
    updatedAt: string;
    dateSort: number;
    shareUrl: string;
    items: ProposalLineItem[];
};

export type ProposalsPageProps = {
    defaultView: 'board' | 'list';
    summary: {
        draftCount: string;
        sentCount: string;
        acceptedCount: string;
    };
    stages: PipelineStage[];
    documents: ProposalDocument[];
    profileLibrarySummary: {
        title: string;
        description: string;
    };
};

export type PublicLeadFormPageProps = {
    team: {
        name: string;
        slug: string;
    };
    hero: {
        title: string;
        description: string;
        bannerLabel: string;
    };
    highlights: string[];
};
