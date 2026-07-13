import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const PILL_CLS =
    'inline-flex h-[30px] min-w-[30px] items-center justify-center rounded-[7px] border border-bion-border px-[10px] text-[12.5px] font-medium text-bion-text hover:border-bion-accent disabled:pointer-events-none disabled:opacity-40';

function urlWithPage(baseUrl: string, page: number): string {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('page', String(page));

    return `${url.pathname}${url.search}`;
}

export default function Pagination({
    meta,
    baseUrl,
}: {
    meta: PaginationMeta;
    baseUrl: string;
}) {
    if (meta.last_page <= 1) {
        return null;
    }

    const hasPrevious = meta.current_page > 1;
    const hasNext = meta.current_page < meta.last_page;

    return (
        <div className="flex items-center justify-between gap-[12px] pt-[16px]">
            <span className="text-[12.5px] text-bion-text-muted">
                Page {meta.current_page} of {meta.last_page} ·{' '}
                {meta.total.toLocaleString()} total
            </span>

            <div className="flex items-center gap-[6px]">
                {hasPrevious ? (
                    <Link
                        href={urlWithPage(baseUrl, meta.current_page - 1)}
                        preserveScroll
                        preserveState
                        className={PILL_CLS}
                    >
                        Prev
                    </Link>
                ) : (
                    <span className={cn(PILL_CLS, 'opacity-40')}>Prev</span>
                )}

                {hasNext ? (
                    <Link
                        href={urlWithPage(baseUrl, meta.current_page + 1)}
                        preserveScroll
                        preserveState
                        className={PILL_CLS}
                    >
                        Next
                    </Link>
                ) : (
                    <span className={cn(PILL_CLS, 'opacity-40')}>Next</span>
                )}
            </div>
        </div>
    );
}
