import type { BiondeskTone } from './biondesk';

export type OpsStatTile = {
    label: string;
    value: string;
    change: string;
    tone: BiondeskTone;
};

export type OpsRecentSignup = {
    id: number;
    name: string;
    email: string;
    joinedAt: string | null;
};

export type OpsDashboardPageProps = {
    stats: OpsStatTile[];
    recentSignups: OpsRecentSignup[];
};

export type OpsUser = {
    id: number;
    name: string;
    email: string;
    teamsCount: number;
    isSuperAdmin: boolean;
    emailVerified: boolean;
    joinedAt: string | null;
};

export type OpsAiUsageLog = {
    id: number;
    teamName: string | null;
    userName: string | null;
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costFormatted: string;
    createdAt: string | null;
};

export type OpsActivityLog = {
    id: number;
    logName: string | null;
    description: string;
    event: string | null;
    subjectType: string | null;
    subjectId: number | string | null;
    causerName: string | null;
    createdAt: string | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
