import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as quotationCreate, index as quotations, show as quotationShow } from '@/routes/quotations';
import type { BiondeskTone, QuotationStatus, QuotationsPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');

const PILL_BASE =
    'inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-medium whitespace-nowrap';

const toneClassMap: Record<BiondeskTone, string> = {
    accent: cn(PILL_BASE, 'bg-bion-accent-soft text-bion-accent'),
    success: cn(PILL_BASE, 'bg-bion-success-soft text-bion-success'),
    danger: cn(PILL_BASE, 'bg-bion-danger-soft text-bion-danger'),
    muted: cn(PILL_BASE, 'border border-bion-border bg-bion-surface-raised text-bion-text-muted'),
};

const toneDotMap: Record<BiondeskTone, string> = {
    accent: 'bg-bion-accent',
    success: 'bg-bion-success',
    danger: 'bg-bion-danger',
    muted: 'bg-bion-text-muted',
};

const TH_CLS =
    'border-b border-bion-border px-[20px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]';
const TD_CLS = 'border-b border-bion-border px-[20px] py-[14px] text-[13.5px]';

export default function QuotationsPage({ quotations: initialQuotations }: QuotationsPageProps) {
    const { currentTeam } = usePage().props;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'' | QuotationStatus>('');

    const filteredQuotations = useMemo(() => {
        const query = search.trim().toLowerCase();

        return initialQuotations.filter((quotation) => {
            const matchesQuery =
                query === '' ||
                quotation.number.toLowerCase().includes(query) ||
                quotation.client.toLowerCase().includes(query);
            const matchesStatus = statusFilter === '' || quotation.status === statusFilter;

            return matchesQuery && matchesStatus;
        });
    }, [initialQuotations, search, statusFilter]);

    const visitQuotation = (quotationId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(quotationShow({ current_team: currentTeam.slug, quotation: quotationId }));
    };

    const visitCreateQuotation = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(quotationCreate(currentTeam.slug));
    };

    return (
        <>
            <Head title="Quotations" />

            <div className="flex min-h-0 flex-1 flex-col">
                <p className="mb-[14px] shrink-0 text-[13px] text-bion-text-muted">
                    Manage your quotations and estimates sent to potential clients.
                </p>

                <div className="mb-[16px] flex shrink-0 flex-wrap items-center justify-between gap-[12px]">
                    <div className="flex flex-wrap items-center gap-[12px]">
                        <label className="flex w-[260px] max-w-full items-center gap-[8px] rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[7px] text-bion-text-muted">
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-search" />
                            </svg>
                            <input
                                type="text"
                                className="flex-1 border-none bg-transparent text-[13px] text-bion-text outline-none"
                                placeholder="Search by ID or client..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                        <select
                            className="rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[7px] text-[13px] text-bion-text outline-none"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value as '' | QuotationStatus)}
                        >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="viewed">Viewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <button type="button" className={BTN_PRIMARY} onClick={visitCreateQuotation}>
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-plus" />
                        </svg>
                        Create Quotation
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-[5] bg-bion-surface">
                                <tr>
                                    <th className={TH_CLS}>Quotation ID</th>
                                    <th className={TH_CLS}>Client</th>
                                    <th className={cn(TH_CLS, 'max-[760px]:hidden')}>Project / Context</th>
                                    <th className={TH_CLS}>Status</th>
                                    <th className={cn(TH_CLS, 'max-[760px]:hidden')}>Issued On</th>
                                    <th className={TH_CLS}>Expiry Date</th>
                                    <th className={cn(TH_CLS, 'text-right')}>Amount</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child_td]:border-b-0">
                                {filteredQuotations.map((quotation) => (
                                    <tr
                                        key={quotation.id}
                                        className="cursor-pointer [transition:background_0.12s_ease] hover:bg-bion-surface-raised"
                                        onClick={() => visitQuotation(quotation.id)}
                                    >
                                        <td className={cn(TD_CLS, 'font-mono text-[13px] text-bion-text-muted')}>
                                            {quotation.number}
                                        </td>
                                        <td className={cn(TD_CLS, 'font-semibold text-bion-text')}>
                                            {quotation.client}
                                        </td>
                                        <td className={cn(TD_CLS, 'text-[13px] text-bion-text-muted max-[760px]:hidden')}>
                                            {quotation.context}
                                        </td>
                                        <td className={TD_CLS}>
                                            <span className={toneClassMap[quotation.tone]}>
                                                <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[quotation.tone])} />
                                                {quotation.statusLabel}
                                            </span>
                                        </td>
                                        <td className={cn(TD_CLS, 'font-mono text-[13px] max-[760px]:hidden')}>
                                            {quotation.issuedAt}
                                        </td>
                                        <td className={cn(TD_CLS, 'font-mono text-[13px]')}>{quotation.expiryAt}</td>
                                        <td className={cn(TD_CLS, 'text-right font-mono text-[14px] font-semibold')}>
                                            {quotation.amount}
                                        </td>
                                    </tr>
                                ))}

                                {filteredQuotations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-[20px] py-[40px] text-center text-[13px] text-bion-text-muted"
                                        >
                                            No quotations match your filters.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

QuotationsPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Quotations',
            href: props.currentTeam ? quotations(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] py-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
