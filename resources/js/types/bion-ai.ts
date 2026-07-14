export type BionAiMessageRole = 'user' | 'assistant' | 'tool';

export type BionAiMessage = {
    id: number;
    role: BionAiMessageRole;
    content: string | null;
    toolName: string | null;
    createdAt: string | null;
};

export type BionAiConversationSummary = {
    id: number;
    title: string | null;
    updatedAt: string | null;
};

export type BionAiConversationPageProps = {
    conversations: BionAiConversationSummary[];
    activeConversationId: number | null;
    messages: BionAiMessage[];
};
