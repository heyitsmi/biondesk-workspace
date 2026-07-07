import { LayoutGrid, Rows3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'board' | 'list';

type Props = {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
};

export default function ViewToggle({ value, onChange }: Props) {
    return (
        <div className="inline-flex items-center rounded-lg border border-bion-border bg-bion-surface p-1 shadow-xs">
            <button
                type="button"
                onClick={() => onChange('board')}
                className={cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    value === 'board'
                        ? 'bg-bion-accent-soft text-bion-accent'
                        : 'text-bion-text-muted hover:text-bion-text',
                )}
            >
                <LayoutGrid className="size-3.5" />
                Board
            </button>
            <button
                type="button"
                onClick={() => onChange('list')}
                className={cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    value === 'list'
                        ? 'bg-bion-accent-soft text-bion-accent'
                        : 'text-bion-text-muted hover:text-bion-text',
                )}
            >
                <Rows3 className="size-3.5" />
                List
            </button>
        </div>
    );
}
