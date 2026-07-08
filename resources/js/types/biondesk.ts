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

export type OpportunityContactOption = {
    id: number;
    name: string;
};

export type OpportunityFormValues = {
    title: string;
    contactId: number | '';
    amountValue: string;
    stage: string;
    closeDate: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
};

export type OpportunityCreatePageProps = {
    stages: PipelineStage[];
    contacts: OpportunityContactOption[];
    defaults: OpportunityFormValues;
};

export type OpportunityEditPageProps = {
    stages: PipelineStage[];
    contacts: OpportunityContactOption[];
    opportunity: OpportunityFormValues & { id: number };
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

export type ProjectClientOption = {
    id: number;
    name: string;
};

export type ProjectLeadOption = {
    id: number;
    name: string;
};

export type ProjectFormValues = {
    title: string;
    clientId: number | '';
    stage: string;
    startDate: string;
    dueDate: string;
    description: string;
    leadId: number;
    budget: string;
};

export type ProjectCreatePageProps = {
    stages: PipelineStage[];
    clients: ProjectClientOption[];
    leads: ProjectLeadOption[];
    defaults: ProjectFormValues;
};

export type ProjectEditPageProps = {
    stages: PipelineStage[];
    clients: ProjectClientOption[];
    leads: ProjectLeadOption[];
    project: ProjectFormValues & { id: number };
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

export type ContactType = 'client' | 'lead' | 'vendor';

export type ContactStatus = 'active' | 'prospect' | 'inactive';

export type ContactFormValues = {
    type: ContactType;
    company: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    website: string;
    notes: string;
};

export type ContactListItem = {
    id: number;
    code: string;
    fullName: string;
    firstName: string;
    lastName: string;
    initials: string;
    company: string;
    email: string;
    phone: string;
    type: ContactType;
    typeLabel: string;
    typeTone: BiondeskTone;
    status: ContactStatus;
    statusLabel: string;
    statusTone: BiondeskTone;
};

export type ContactRelatedProject = {
    id: number;
    title: string;
    stageLabel: string;
    tone: BiondeskTone;
    dueAt: string;
};

export type ContactRelatedInvoice = {
    id: number;
    number: string;
    amount: string;
    statusLabel: string;
    tone: BiondeskTone;
    dueAt: string;
};

export type ContactNoteFile = {
    id: number;
    label: string;
    kind: 'note' | 'file';
    meta: string;
};

export type ContactActivityItem = {
    id: number;
    title: string;
    description: string;
    when: string;
    tone: BiondeskTone;
};

export type ContactDetail = ContactListItem & {
    role: string;
    location: string;
    website: string;
    notes: string;
    billingAddress: string;
    relatedProjects: ContactRelatedProject[];
    relatedInvoices: ContactRelatedInvoice[];
    notesAndFiles: ContactNoteFile[];
    activity: ContactActivityItem[];
};

export type ContactsIndexPageProps = {
    contacts: ContactListItem[];
    contactsCount: string;
    defaultFilters: {
        search: string;
        type: '' | ContactType;
    };
};

export type ContactCreatePageProps = {
    contactsCount: string;
    defaults: ContactFormValues;
};

export type ContactEditPageProps = {
    contactsCount: string;
    contact: ContactDetail;
};

export type ContactShowPageProps = {
    contactsCount: string;
    contact: ContactDetail;
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

export type ProposalClientOption = {
    id: number;
    name: string;
};

export type ProposalProjectOption = {
    id: number;
    title: string;
};

export type ProposalCreatePageProps = {
    nextNumber: string;
    defaultDatePrepared: string;
    defaultValidUntil: string;
    clients: ProposalClientOption[];
    projects: ProposalProjectOption[];
};

export type ProposalDraftLineItem = {
    name: string;
    description: string;
    qty: number;
    price: string;
};

export type ProposalEditPageProps = {
    clients: ProposalClientOption[];
    projects: ProposalProjectOption[];
    proposal: {
        id: number;
        title: string;
        number: string;
        clientId: number | '';
        datePrepared: string;
        validUntil: string;
        content: string;
        lineItems: ProposalDraftLineItem[];
        notes: string;
    };
};

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type InvoiceListItem = {
    id: number;
    number: string;
    client: string;
    context: string;
    status: InvoiceStatus;
    statusLabel: string;
    tone: BiondeskTone;
    issuedAt: string;
    issuedSort: number;
    dueAt: string;
    dueSort: number;
    amount: string;
    amountValue: number;
};

export type InvoicesPageProps = {
    invoices: InvoiceListItem[];
};

export type InvoiceDetailLineItem = {
    name: string;
    description: string;
    qty: number;
    price: string;
    total: string;
};

export type InvoicePayment = {
    id: number;
    label: string;
    amount: string;
    recordedAt: string;
};

export type InvoiceDetail = InvoiceListItem & {
    dueInLabel: string;
    business: {
        name: string;
        address: string;
        email: string;
    };
    billTo: {
        name: string;
        attn: string;
        address: string;
        email: string;
    };
    lineItems: InvoiceDetailLineItem[];
    subtotal: string;
    taxLabel: string;
    taxAmount: string;
    total: string;
    amountPaid: string;
    amountDue: string;
    paymentInstructions: string;
    payments: InvoicePayment[];
    linkedProject: { id: number; title: string } | null;
    currency: string;
};

export type InvoiceShowPageProps = {
    invoice: InvoiceDetail;
};

export type InvoiceCreateClientOption = {
    id: number;
    name: string;
};

export type InvoiceCreateProjectOption = {
    id: number;
    title: string;
};

export type InvoiceCreatePageProps = {
    nextNumber: string;
    defaultIssuedAt: string;
    defaultDueAt: string;
    clients: InvoiceCreateClientOption[];
    projects: InvoiceCreateProjectOption[];
};

export type QuotationStatus = 'draft' | 'pending' | 'accepted' | 'declined';

export type QuotationListItem = {
    id: number;
    number: string;
    client: string;
    context: string;
    status: QuotationStatus;
    statusLabel: string;
    tone: BiondeskTone;
    issuedAt: string;
    issuedSort: number;
    expiryAt: string;
    expirySort: number;
    amount: string;
    amountValue: number;
};

export type QuotationsPageProps = {
    quotations: QuotationListItem[];
};

export type QuotationDetailLineItem = {
    name: string;
    description: string;
    qty: number;
    price: string;
    total: string;
};

export type QuotationDetail = QuotationListItem & {
    validityLabel: string;
    business: {
        name: string;
        address: string;
        email: string;
    };
    preparedFor: {
        name: string;
        attn: string;
        address: string;
        email: string;
    };
    lineItems: QuotationDetailLineItem[];
    subtotal: string;
    discountLabel: string;
    discountAmount: string;
    total: string;
    terms: string;
    linkedProject: { id: number; title: string } | null;
    currency: string;
};

export type QuotationShowPageProps = {
    quotation: QuotationDetail;
};

export type QuotationCreateClientOption = {
    id: number;
    name: string;
};

export type QuotationCreateProjectOption = {
    id: number;
    title: string;
};

export type QuotationCreatePageProps = {
    nextNumber: string;
    defaultIssuedAt: string;
    defaultExpiryAt: string;
    clients: QuotationCreateClientOption[];
    projects: QuotationCreateProjectOption[];
};

export type ReminderBucket = 'overdue' | 'today' | 'upcoming';

export type ReminderLinkKind = 'proposal' | 'project' | 'contact' | 'invoice';

export type ReminderLink = {
    kind: ReminderLinkKind;
    label: string;
    id: number | null;
};

export type ReminderItem = {
    id: number;
    title: string;
    bucket: ReminderBucket;
    dueLabel: string;
    dueSort: number;
    completed: boolean;
    link: ReminderLink | null;
};

export type ReminderSummary = {
    allCount: number;
    todayCount: number;
    upcomingCount: number;
    overdueCount: number;
};

export type RemindersPageProps = {
    summary: ReminderSummary;
    reminders: ReminderItem[];
};

export type ProfileCategory = 'company' | 'team' | 'case' | 'asset';

export type ProfileItem = {
    id: number;
    title: string;
    description: string;
    category: ProfileCategory;
    categoryLabel: string;
    icon: string;
    updatedAt: string;
    shortDescription: string;
    body: string;
    hasImage: boolean;
};

export type ProfilesPageProps = {
    profiles: ProfileItem[];
};

export type ProfileFormValues = {
    title: string;
    category: '' | ProfileCategory;
    shortDescription: string;
    body: string;
};

export type ProfileCreatePageProps = {
    defaults: ProfileFormValues;
};

export type ProfileEditPageProps = {
    profile: ProfileItem;
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

export type PublicLeadFormBackgroundTheme = 'dark' | 'light' | 'brand';

export type PublicLeadFormSettings = {
    formUrl: string;
    enabled: boolean;
    formTitle: string;
    welcomeMessage: string;
    backgroundTheme: PublicLeadFormBackgroundTheme;
    services: string[];
    askBudget: boolean;
    allowAttachments: boolean;
};

export type SettingsLeadFormPageProps = {
    settings: PublicLeadFormSettings;
};
