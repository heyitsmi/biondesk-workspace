import { useHttp } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type DocumentPdfUrls = {
    generate: string;
    status: string;
    download: string;
};

type PdfStatusResponse = {
    status: 'ready' | 'queued' | 'pending';
};

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 1500;

export function useDocumentPdfDownload(urls: DocumentPdfUrls) {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const attemptsRef = useRef(0);
    const generateHttp = useHttp<Record<string, never>, PdfStatusResponse>({});
    const statusHttp = useHttp<Record<string, never>, PdfStatusResponse>({});

    const fail = useCallback((): void => {
        setDownloading(false);
        setError('Could not generate the PDF. Please try again.');
    }, []);

    const finish = useCallback((): void => {
        setDownloading(false);
        window.location.href = urls.download;
    }, [urls.download]);

    const pollRef = useRef<() => void>(() => {});

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
                        if (response.status === 'ready') {
                            finish();

                            return;
                        }

                        pollRef.current();
                    },
                    onHttpException: fail,
                    onNetworkError: fail,
                });
            }, POLL_INTERVAL_MS);
        };
    }, [fail, finish, statusHttp, urls.status]);

    const download = useCallback((): void => {
        if (downloading) {
            return;
        }

        setDownloading(true);
        setError(null);
        attemptsRef.current = 0;

        void generateHttp.post(urls.generate, {
            onSuccess: (response) => {
                if (response.status === 'ready') {
                    finish();

                    return;
                }

                pollRef.current();
            },
            onHttpException: fail,
            onNetworkError: fail,
        });
    }, [downloading, fail, finish, generateHttp, urls.generate]);

    return { downloading, error, download };
}
