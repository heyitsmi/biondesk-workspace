import { Head, router, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as invoices, show as invoiceShow } from '@/routes/invoices';
import {
    edit as recurringEdit,
    move as moveRecurring,
} from '@/routes/invoices/recurring';
import type { BiondeskTone, RecurringInvoiceShowPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(
    BTN,
    'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]',
);
const BTN_GHOST = cn(
    BTN,
    'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised',
);

const PILL_BASE =
    'inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-medium whitespace-nowrap';

const toneClassMap: Record<BiondeskTone, string> = {
    accent: cn(PILL_BASE, 'bg-bion-accent-soft text-bion-accent'),
    success: cn(PILL_BASE, 'bg-bion-success-soft text-bion-success'),
    danger: cn(PILL_BASE, 'bg-bion-danger-soft text-bion-danger'),
    muted: cn(
        PILL_BASE,
        'border border-bion-border bg-bion-surface-raised text-bion-text-muted',
    ),
};

const toneDotMap: Record<BiondeskTone, string> = {
    accent: 'bg-bion-accent',
    success: 'bg-bion-success',
    danger: 'bg-bion-danger',
    muted: 'bg-bion-text-muted',
};

const CARD =
    'overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface';
const CARD_BODY = 'flex flex-col gap-[16px] p-[24px]';

const TH_CLS =
    'border-b border-bion-border px-[16px] py-[10px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]';
const TD_CLS = 'border-b border-bion-border px-[16px] py-[12px] text-[13.5px]';

export default function RecurringInvoiceShowPage({
    template,
}: RecurringInvoiceShowPageProps) {
    const { currentTeam } = usePage().props;

    const togglePause = (): void => {
        if (!currentTeam) {
            return;
        }

        router.patch(
            moveRecurring({
                current_team: currentTeam.slug,
                template: template.id,
            }).url,
            { is_active: template.statusLabel !== 'Active' },
            { preserveScroll: true },
        );
    };

    const visitInvoice = (invoiceId: number): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(
            invoiceShow({ current_team: currentTeam.slug, invoice: invoiceId }),
        );
    };

    const visitEdit = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(
            recurringEdit({
                current_team: currentTeam.slug,
                template: template.id,
            }),
        );
    };

    return (
        <>
            <Head
                title={
                    template.title || `Recurring invoice for ${template.client}`
                }
            />

            <div className="mb-[20px] flex shrink-0 flex-wrap items-center justify-between gap-[16px]">
                <div>
                    <h1 className="font-mono text-[24px] font-bold [letter-spacing:-0.02em]">
                        {template.title ||
                            `Recurring invoice for ${template.client}`}
                    </h1>
                    <p className="mt-[4px] text-[13px] text-bion-text-muted">
                        {template.client} &middot; {template.cadenceLabel}
                    </p>
                </div>
                <div className="flex items-center gap-[10px]">
                    <button
                        type="button"
                        className={BTN_GHOST}
                        onClick={visitEdit}
                    >
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-pencil" />
                        </svg>
                        Edit
                    </button>
                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        onClick={togglePause}
                    >
                        {template.statusLabel === 'Active' ? 'Pause' : 'Resume'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-[24px]">
                <div className={CARD}>
                    <div className={CARD_BODY}>
                        <div className="flex flex-wrap items-center gap-[16px]">
                            <span className={toneClassMap[template.tone]}>
                                <span
                                    className={cn(
                                        'h-[6px] w-[6px] rounded-full',
                                        toneDotMap[template.tone],
                                    )}
                                />
                                {template.statusLabel}
                            </span>
                            {template.autoSend ? (
                                <span className="text-[12.5px] text-bion-text-muted">
                                    Auto-sends to client each cycle
                                </span>
                            ) : (
                                <span className="text-[12.5px] text-bion-text-muted">
                                    Generates as draft for manual review
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-[16px] max-[600px]:grid-cols-1">
                            <div>
                                <div className="text-[11.5px] [letter-spacing:0.04em] text-bion-text-muted uppercase">
                                    Next Invoice
                                </div>
                                <div className="mt-[4px] font-mono text-[14px]">
                                    {template.nextInvoiceAt || '—'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11.5px] [letter-spacing:0.04em] text-bion-text-muted uppercase">
                                    Amount
                                </div>
                                <div className="mt-[4px] font-mono text-[14px] font-semibold">
                                    {template.amount}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11.5px] [letter-spacing:0.04em] text-bion-text-muted uppercase">
                                    Due Within
                                </div>
                                <div className="mt-[4px] font-mono text-[14px]">
                                    {template.dueDays} days
                                </div>
                            </div>
                            <div>
                                <div className="text-[11.5px] [letter-spacing:0.04em] text-bion-text-muted uppercase">
                                    Starts
                                </div>
                                <div className="mt-[4px] font-mono text-[14px]">
                                    {template.startsAt}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11.5px] [letter-spacing:0.04em] text-bion-text-muted uppercase">
                                    Ends
                                </div>
                                <div className="mt-[4px] font-mono text-[14px]">
                                    {template.endsAt || 'No end date'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11.5px] [letter-spacing:0.04em] text-bion-text-muted uppercase">
                                    Invoices Generated
                                </div>
                                <div className="mt-[4px] font-mono text-[14px]">
                                    {template.occurrencesGenerated}
                                </div>
                            </div>
                        </div>

                        {template.notes ? (
                            <div>
                                <div className="text-[11.5px] [letter-spacing:0.04em] text-bion-text-muted uppercase">
                                    Payment Instructions &amp; Notes
                                </div>
                                <p className="mt-[6px] text-[13.5px] whitespace-pre-line text-bion-text">
                                    {template.notes}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className={CARD}>
                    <div className={CARD_BODY}>
                        <div className="text-[13.5px] font-semibold">
                            Line Items
                        </div>
                        <div className="overflow-hidden rounded-[8px] border border-bion-border">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className={TH_CLS}>Item</th>
                                        <th
                                            className={cn(TH_CLS, 'text-right')}
                                        >
                                            Qty
                                        </th>
                                        <th
                                            className={cn(TH_CLS, 'text-right')}
                                        >
                                            Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child_td]:border-b-0">
                                    {template.lineItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className={TD_CLS}>
                                                <div className="font-medium">
                                                    {item.name}
                                                </div>
                                                {item.description ? (
                                                    <div className="text-[12.5px] text-bion-text-muted">
                                                        {item.description}
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td
                                                className={cn(
                                                    TD_CLS,
                                                    'text-right font-mono',
                                                )}
                                            >
                                                {item.qty}
                                            </td>
                                            <td
                                                className={cn(
                                                    TD_CLS,
                                                    'text-right font-mono',
                                                )}
                                            >
                                                {item.price}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className={CARD}>
                    <div className={CARD_BODY}>
                        <div className="text-[13.5px] font-semibold">
                            Generated Invoices
                        </div>
                        <div className="overflow-hidden rounded-[8px] border border-bion-border">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className={TH_CLS}>Invoice ID</th>
                                        <th className={TH_CLS}>Status</th>
                                        <th className={TH_CLS}>Issued On</th>
                                        <th
                                            className={cn(TH_CLS, 'text-right')}
                                        >
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child_td]:border-b-0">
                                    {template.generatedInvoices.map(
                                        (invoice) => (
                                            <tr
                                                key={invoice.id}
                                                className="cursor-pointer [transition:background_0.12s_ease] hover:bg-bion-surface-raised"
                                                onClick={() =>
                                                    visitInvoice(invoice.id)
                                                }
                                            >
                                                <td
                                                    className={cn(
                                                        TD_CLS,
                                                        'font-mono text-bion-text-muted',
                                                    )}
                                                >
                                                    {invoice.number}
                                                </td>
                                                <td className={TD_CLS}>
                                                    <span
                                                        className={
                                                            toneClassMap[
                                                                invoice.tone
                                                            ]
                                                        }
                                                    >
                                                        <span
                                                            className={cn(
                                                                'h-[6px] w-[6px] rounded-full',
                                                                toneDotMap[
                                                                    invoice.tone
                                                                ],
                                                            )}
                                                        />
                                                        {invoice.statusLabel}
                                                    </span>
                                                </td>
                                                <td
                                                    className={cn(
                                                        TD_CLS,
                                                        'font-mono',
                                                    )}
                                                >
                                                    {invoice.issuedAt}
                                                </td>
                                                <td
                                                    className={cn(
                                                        TD_CLS,
                                                        'text-right font-mono font-semibold',
                                                    )}
                                                >
                                                    {invoice.amount}
                                                </td>
                                            </tr>
                                        ),
                                    )}

                                    {template.generatedInvoices.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-[16px] py-[32px] text-center text-[13px] text-bion-text-muted"
                                            >
                                                No invoices generated yet.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

RecurringInvoiceShowPage.layout = (props: {
    currentTeam?: { slug: string } | null;
    template?: { title: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Invoices',
            href: props.currentTeam ? invoices(props.currentTeam.slug) : '/',
        },
        {
            title: props.template?.title || 'Recurring Invoice',
            href: '#',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-y-auto px-[32px] py-[24px] max-[760px]:px-[16px] max-[760px]:pt-[20px] max-[760px]:pb-[40px]',
});
