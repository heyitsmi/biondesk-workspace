import type { ReactNode } from 'react';
import StatusPill from '@/components/biondesk/status-pill';
import type { BiondeskTone } from '@/types';

type Props = {
    title: string;
    count: number;
    tone: BiondeskTone;
    children: ReactNode;
};

export default function BoardColumn({ title, count, tone, children }: Props) {
    return (
        <section className="flex w-[292px] shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-bion-text">
                        {title}
                    </h2>
                    <StatusPill
                        tone={tone}
                        label={count.toString()}
                        className="px-2 py-0.5"
                    />
                </div>
            </div>

            <div className="flex min-h-[16rem] flex-col gap-3 rounded-2xl border border-bion-border bg-bion-surface/70 p-3 shadow-xs">
                {children}
            </div>
        </section>
    );
}
