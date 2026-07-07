import { cn } from '@/lib/utils';
import type { BiondeskTone } from '@/types';

const toneClasses: Record<BiondeskTone, string> = {
    accent: 'border border-bion-accent/20 bg-bion-accent-soft text-bion-accent',
    success:
        'border border-bion-success/20 bg-bion-success-soft text-bion-success',
    danger: 'border border-bion-danger/20 bg-bion-danger-soft text-bion-danger',
    muted:
        'border border-bion-border bg-bion-surface-raised text-bion-text-muted',
};

type Props = {
    tone: BiondeskTone;
    label: string;
    className?: string;
};

export default function StatusPill({ tone, label, className }: Props) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium',
                toneClasses[tone],
                className,
            )}
        >
            <span
                className={cn('size-1.5 rounded-full', {
                    'bg-bion-accent': tone === 'accent',
                    'bg-bion-success': tone === 'success',
                    'bg-bion-danger': tone === 'danger',
                    'bg-bion-text-muted': tone === 'muted',
                })}
            />
            {label}
        </span>
    );
}
