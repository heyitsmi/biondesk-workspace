import { useHttp } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BionAiMessage } from '@/types/bion-ai';

export type BionAiChatUrls = {
    send: string;
    status: string;
};

type SendResponse = {
    status: 'queued';
};

type StatusResponse = {
    status: 'ready' | 'pending';
    messages: BionAiMessage[] | null;
};

const MAX_POLL_ATTEMPTS = 40;
const POLL_INTERVAL_MS = 1500;

export function useBionAiChat(
    urls: BionAiChatUrls,
    initialMessages: BionAiMessage[],
) {
    const [messages, setMessages] = useState<BionAiMessage[]>(initialMessages);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const attemptsRef = useRef(0);
    const sendHttp = useHttp<{ content: string }, SendResponse>({
        content: '',
    });
    const statusHttp = useHttp<Record<string, never>, StatusResponse>({});
    const pollRef = useRef<() => void>(() => {});
    const initialMessagesRef = useRef(initialMessages);
    useEffect(() => {
        initialMessagesRef.current = initialMessages;
    });

    // The page component isn't remounted when Inertia navigates between
    // conversations (same route pattern), so state must be resynced
    // explicitly whenever the active conversation changes.
    useEffect(() => {
        setMessages(initialMessagesRef.current);
        setSending(false);
        setError(null);
        attemptsRef.current = 0;
    }, [urls.send]);

    const fail = useCallback((): void => {
        setSending(false);
        setError('BionAI could not respond. Please try again.');
    }, []);

    useEffect(() => {
        pollRef.current = (): void => {
            if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
                fail();

                return;
            }

            attemptsRef.current += 1;

            window.setTimeout(() => {
                void statusHttp.get(urls.status, {
                    onSuccess: (response) => {
                        if (response.status === 'ready' && response.messages) {
                            setMessages(response.messages);
                            setSending(false);

                            return;
                        }

                        pollRef.current();
                    },
                    onHttpException: fail,
                    onNetworkError: fail,
                });
            }, POLL_INTERVAL_MS);
        };
    }, [fail, statusHttp, urls.status]);

    const send = useCallback(
        (content: string): void => {
            const trimmed = content.trim();

            if (sending || trimmed === '') {
                return;
            }

            setSending(true);
            setError(null);
            attemptsRef.current = 0;
            setMessages((current) => [
                ...current,
                {
                    id: -Date.now(),
                    role: 'user',
                    content: trimmed,
                    toolName: null,
                    createdAt: new Date().toISOString(),
                },
            ]);

            sendHttp.setData('content', trimmed);
            void sendHttp.post(urls.send, {
                onSuccess: () => pollRef.current(),
                onHttpException: fail,
                onNetworkError: fail,
            });
        },
        [fail, sending, sendHttp, urls.send],
    );

    return { messages, sending, error, send };
}
