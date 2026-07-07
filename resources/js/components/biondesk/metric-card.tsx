import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { BiondeskTone } from '@/types';

type Props = {
    label: string;
    value: string;
    meta: string;
    tone: BiondeskTone;
    icon?: ReactNode;
};

export default function MetricCard({
    label,
    value,
    meta,
    tone,
    icon,
}: Props) {
    return (
        <article className="rounded-2xl border border-bion-border bg-bion-surface p-5 shadow-xs">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-bion-text-muted uppercase">
                        {label}
                    </p>
                    <p className="font-mono text-3xl font-semibold tracking-tight text-bion-text">
                        {value}
                    </p>
                </div>
                {icon ? (
                    <div className="flex size-10 items-center justify-center rounded-xl border border-bion-border bg-bion-surface-raised text-bion-accent">
                        {icon}
                    </div>
                ) : null}
            </div>
            <p
                className={cn('text-xs font-medium', {
                    'text-bion-accent': tone === 'accent',
                    'text-bion-success': tone === 'success',
                    'text-bion-danger': tone === 'danger',
                    'text-bion-text-muted': tone === 'muted',
                })}
            >
                {meta}
            </p>
        </article>
    );
}
