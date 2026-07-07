import type { ReactNode } from 'react';

type Props = {
    title: string;
    description: string;
    actions?: ReactNode;
};

export default function PageHeader({ title, description, actions }: Props) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-bion-text-muted uppercase">
                    Biondesk App
                </p>
                <div className="space-y-1">
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-bion-text sm:text-3xl">
                        {title}
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-bion-text-muted">
                        {description}
                    </p>
                </div>
            </div>

            {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
    );
}
