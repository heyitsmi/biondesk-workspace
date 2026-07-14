export type BiondeskTone = 'accent' | 'success' | 'danger' | 'muted';

export type DocumentPdfUrls = {
    generate: string;
    status: string;
    download: string;
};

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

export type DashboardUpcomingEventKind =
    'event' | 'invoice' | 'quote' | 'project' | 'opportunity';

export type DashboardUpcomingEvent = {
    id: string;
    kind: DashboardUpcomingEventKind;
    recordId: number;
    title: string;
    dateLabel: string;
    dateSort: number;
    tone: BiondeskTone;
    recurring: boolean;
};

export type DashboardPageProps = {
    stats: DashboardStat[];
    priorityActions: DashboardPriorityAction[];
    recentOpportunities: DashboardOpportunity[];
    activityFeed: ActivityItem[];
    upcomingEvents: DashboardUpcomingEvent[];
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
    winProbability: number | null;
    stage: string;
    stageLabel: string;
    tone: BiondeskTone;
    lastActivity: string;
    activityOrder: number;
    summary: string;
    projectId: number | null;
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
    winProbability: string;
    stage: string;
    closeDate: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
};

export type OpportunityCreatePageProps = {
    stages: PipelineStage[];
    contacts: OpportunityContactOption[];
    quickAddedContact?: OpportunityContactOption | null;
    defaults: OpportunityFormValues;
};

export type OpportunityEditPageProps = {
    stages: PipelineStage[];
    contacts: OpportunityContactOption[];
    quickAddedContact?: OpportunityContactOption | null;
    opportunity: OpportunityFormValues & { id: number };
};

export type ProjectTask = {
    id: number;
    title: string;
    done: boolean;
};

export type ProjectTaskStatus =
    'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export type ProjectAttachment = {
    name: string;
    url: string;
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
    'new' | 'duplicate' | 'related' | 'contradiction';

export type ProjectRequestSource =
    'WhatsApp' | 'Email' | 'Telegram' | 'Phone call' | 'Client portal' | 'Other';

export type ProjectRequestStatus =
    'submitted' | 'reviewing' | 'in_progress' | 'resolved' | 'declined';

export type ProjectRequestMessage = {
    id: number;
    authorType: 'client' | 'team';
    authorLabel: string;
    body: string;
    createdAt: string;
    attachments: ProjectAttachment[];
};

export type ProjectDetailRequestLog = {
    id: number;
    uuid: string;
    text: string;
    source: ProjectRequestSource;
    date: string;
    classification: ProjectRequestClassification;
    status: ProjectRequestStatus;
    statusLabel: string;
    statusTone: BiondeskTone;
    notes: string;
    attachments: ProjectAttachment[];
    messages: ProjectRequestMessage[];
};

export type ProjectActivityEntry = {
    text: string;
    time: string;
    tone: BiondeskTone;
};

export type RequestLogDetailProject = {
    id: number;
    title: string;
    client: string;
    stageLabel: string;
    tone: BiondeskTone;
};

export type RequestLogDetailPageProps = {
    project: RequestLogDetailProject;
    requestLog: ProjectDetailRequestLog;
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
    sortOrder: number;
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

export type ProjectOpportunityOption = {
    id: number;
    title: string;
    company: string;
};

export type ProjectFormValues = {
    opportunityId: number | '';
    title: string;
    status: string;
    startDate: string;
    dueDate: string;
    description: string;
    budgetValue: string;
};

export type ProjectCreatePageProps = {
    stages: PipelineStage[];
    opportunities: ProjectOpportunityOption[];
    defaults: ProjectFormValues;
};

export type ProjectEditPageProps = {
    stages: PipelineStage[];
    project: Omit<ProjectFormValues, 'opportunityId'> & {
        id: number;
        opportunityTitle: string;
        client: string;
    };
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
    portalUrl: string;
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

export type ProposalDetailLineItem = {
    name: string;
    description: string;
    qty: number;
    price: string;
    total: string;
};

export type ProposalDetail = ProposalDocument & {
    datePrepared: string;
    datePreparedIso: string;
    validUntil: string;
    validUntilIso: string;
    preparedFor: {
        name: string;
        attn: string;
        address: string;
        email: string;
    };
    business: {
        name: string;
        address: string;
        email: string;
    };
    summary: string;
    scopeIntro: string;
    scopeItems: string[];
    timeline: string;
    lineItems: ProposalDetailLineItem[];
    subtotal: string;
    taxLabel: string;
    taxAmount: string;
    total: string;
    notes: string;
    linkedProject: { id: number; title: string } | null;
    currency: string;
    pdfUrls: DocumentPdfUrls;
};

export type ProposalShowPageProps = {
    proposal: ProposalDetail;
};

export type InvoiceStatus =
    'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'overdue';

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
    shareUrl: string;
    isRecurring: boolean;
};

export type RecurringInvoiceListItem = {
    id: number;
    client: string;
    title: string;
    cadenceLabel: string;
    nextInvoiceAt: string;
    nextInvoiceSort: number;
    statusLabel: 'Active' | 'Paused';
    tone: BiondeskTone;
    amount: string;
    amountValue: number;
    autoSend: boolean;
};

export type RecurringInvoiceDetailLineItem = {
    name: string;
    description: string;
    qty: number;
    price: string;
};

export type RecurringInvoiceDetail = RecurringInvoiceListItem & {
    intervalMonths: number;
    dueDays: number;
    startsAt: string;
    endsAt: string | null;
    occurrencesGenerated: number;
    notes: string;
    currency: string;
    taxPercent: number;
    contactId: number | '';
    projectId: number | '';
    lineItems: RecurringInvoiceDetailLineItem[];
    generatedInvoices: InvoiceListItem[];
};

export type RecurringInvoiceShowPageProps = {
    template: RecurringInvoiceDetail;
};

export type RecurringInvoiceCreatePageProps = {
    defaultStartsAt: string;
    clients: InvoiceCreateClientOption[];
    projects: InvoiceCreateProjectOption[];
};

export type RecurringInvoiceEditPageProps = {
    template: RecurringInvoiceDetail;
    clients: InvoiceCreateClientOption[];
    projects: InvoiceCreateProjectOption[];
};

export type InvoicesPageProps = {
    invoices: InvoiceListItem[];
    recurringTemplates: RecurringInvoiceListItem[];
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
    pdfUrls: DocumentPdfUrls;
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

export type QuotationStatus =
    'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';

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
    shareUrl: string;
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
    pdfUrls: DocumentPdfUrls;
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

export type ReminderLinkKind = 'invoice' | 'quotation';

export type ReminderLink = {
    kind: ReminderLinkKind;
    label: string;
    id: number;
};

export type ReminderItem = {
    id: number;
    title: string;
    bucket: ReminderBucket;
    dueLabel: string;
    dueSort: number;
    completed: boolean;
    link: ReminderLink;
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
    imageUrl: string | null;
};

export type ProfilesPageProps = {
    profiles: ProfileItem[];
};

export type ProfileFormValues = {
    title: string;
    category: '' | ProfileCategory;
    shortDescription: string;
    body: string;
    image: File | null;
};

export type ProfileCreatePageProps = {
    defaults: ProfileFormValues;
};

export type ProfileEditPageProps = {
    profile: ProfileItem;
};

export type PublicLeadFormBackgroundTheme =
    'dark' | 'light' | 'brand' | 'custom';

export type SocialLinkPlatform =
    | 'instagram'
    | 'twitter'
    | 'linkedin'
    | 'facebook'
    | 'tiktok'
    | 'youtube'
    | 'github'
    | 'dribbble'
    | 'behance'
    | 'website';

export type SocialLink = {
    platform: SocialLinkPlatform;
    url: string;
};

export type PublicLeadFormSettings = {
    enabled: boolean;
    slug: string;
    customSlug: string | null;
    title: string;
    welcomeMessage: string;
    backgroundTheme: PublicLeadFormBackgroundTheme;
    backgroundColor: string | null;
    backgroundImageUrl: string | null;
    coverUrl: string | null;
    services: string[];
    socialLinks: SocialLink[];
    askBudget: boolean;
    allowAttachments: boolean;
    bannerUrl: string | null;
    metaTitle: string;
    metaDescription: string;
    ogImageUrl: string | null;
};

export type PublicLeadFormPageProps = {
    team: {
        name: string;
        slug: string;
        leadFormSlug: string;
    };
    settings: PublicLeadFormSettings;
    turnstileSiteKey: string | null;
};

export type SettingsLeadFormPageProps = {
    formUrl: string;
    settings: PublicLeadFormSettings;
};

export type PublicDocumentKind = 'invoice' | 'quotation' | 'proposal';

export type PublicDocumentLineItem = {
    name: string;
    description: string;
    qty: number;
    price: string;
    total: string;
};

export type PublicDocumentDateField = {
    label: string;
    value: string;
    danger: boolean;
};

export type PublicDocument = {
    kind: PublicDocumentKind;
    kindLabel: string;
    number: string;
    context: string;
    statusLabel: string;
    tone: BiondeskTone;
    business: {
        name: string;
        address: string;
        email: string;
    };
    recipient: {
        label: string;
        name: string;
        attn: string;
        address: string;
        email: string;
    };
    dateFields: PublicDocumentDateField[];
    lineItems: PublicDocumentLineItem[];
    subtotal: string;
    adjustmentLabel: string;
    adjustmentAmount: string;
    totalLabel: string;
    total: string;
    amountPaid: string | null;
    amountDue: string | null;
    notesLabel: string;
    notes: string;
    primaryActionLabel: string;
    currency: string;
    pdfUrls: DocumentPdfUrls;
};

export type PublicDocumentPageProps = {
    document: PublicDocument;
};

export type ClientPortalRequest = {
    id: number;
    uuid: string;
    projectId: number;
    text: string;
    sourceLabel: string;
    createdAt: string;
    status: ProjectRequestStatus;
    statusLabel: string;
    statusTone: BiondeskTone;
    attachments: ProjectAttachment[];
    messages: ProjectRequestMessage[];
    projectTitle?: string;
};

export type ClientPortalTask = {
    id: number;
    title: string;
    statusLabel: string;
    tone: BiondeskTone;
};

export type ClientPortalProject = {
    id: number;
    title: string;
    statusLabel: string;
    tone: BiondeskTone;
    dueAt: string;
    progress: number;
    tasks: ClientPortalTask[];
    requests: ClientPortalRequest[];
};

export type ClientPortalDocument = {
    id: number;
    kind: PublicDocumentKind;
    kindLabel: string;
    number: string;
    title: string;
    statusLabel: string;
    tone: BiondeskTone;
    amount: string;
    issuedAt: string;
    url: string;
};

export type ClientPortal = {
    teamName: string;
    portalToken: string;
    contact: {
        name: string;
        fullName: string;
        company: string | null;
        initials: string;
        email: string | null;
    };
    stats: {
        activeProjects: number;
        documents: number;
        openRequests: number;
    };
    projects: ClientPortalProject[];
    documents: ClientPortalDocument[];
    requests: ClientPortalRequest[];
};

export type ClientPortalPageProps = {
    portal: ClientPortal;
};

export type ClientPortalRequestShowPageProps = {
    portal: Pick<ClientPortal, 'teamName' | 'portalToken' | 'contact'>;
    project: Pick<ClientPortalProject, 'id' | 'title' | 'statusLabel' | 'tone' | 'dueAt'>;
    requestLog: ClientPortalRequest & {
        projectTitle: string;
    };
};
