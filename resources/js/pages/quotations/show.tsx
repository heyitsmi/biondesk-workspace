import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useDocumentPdfDownload } from '@/hooks/use-document-pdf-download';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { show as projectShow } from '@/routes/projects';
import { convertToInvoice as convertQuotationToInvoice, index as quotations, move as moveQuotation } from '@/routes/quotations';
import type { BiondeskTone, QuotationShowPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] max-[760px]:flex-1 max-[760px]:justify-center';
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised');
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');

const BTN_SIDEBAR_LIST =
    'inline-flex w-full items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised justify-start';
const BTN_SIDEBAR_PRIMARY =
    'inline-flex w-full items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] bg-bion-accent text-bion-accent-text hover:opacity-[0.88] justify-start';

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

export default function QuotationShowPage({ quotation }: QuotationShowPageProps) {
    const { currentTeam } = usePage().props;
    const [linkCopied, setLinkCopied] = useState(false);
    const [sentToClient, setSentToClient] = useState(quotation.status !== 'draft');
    const pdf = useDocumentPdfDownload(quotation.pdfUrls);

    const copyShareLink = async (): Promise<void> => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(quotation.shareUrl);
            setLinkCopied(true);
            window.setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            return;
        }
    };

    const sendToClient = (): void => {
        if (!currentTeam) {
            return;
        }

        router.patch(
            moveQuotation({ current_team: currentTeam.slug, quotation: quotation.id }).url,
            { status: 'sent' },
            { preserveScroll: true, onSuccess: () => setSentToClient(true) },
        );
    };

    const convertToInvoice = (): void => {
        if (!currentTeam) {
            return;
        }

        router.post(convertQuotationToInvoice({ current_team: currentTeam.slug, quotation: quotation.id }).url);
    };

    return (
        <>
            <Head title={quotation.number} />

            <div className="mb-[20px] flex shrink-0 flex-wrap items-start justify-between gap-[16px]">
                <div>
                    <h1 className="mb-[6px] font-mono text-[24px] font-bold [letter-spacing:-0.02em]">
                        {quotation.number}
                    </h1>
                    <div className="flex flex-wrap items-center gap-[12px] text-[13px] text-bion-text-muted">
                        <span className={toneClassMap[quotation.tone]}>
                            <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[quotation.tone])} />
                            {quotation.statusLabel}
                        </span>
                        <span>{quotation.validityLabel}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-[8px] max-[760px]:w-full max-[760px]:justify-between">
                    <button type="button" className={BTN_GHOST}>
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-eye" />
                        </svg>
                        Preview
                    </button>
                    <button type="button" className={BTN_GHOST} onClick={copyShareLink}>
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-link" />
                        </svg>
                        {linkCopied ? 'Link Copied' : 'Copy Link'}
                    </button>
                    <button
                        type="button"
                        className={BTN_PRIMARY}
                        onClick={sendToClient}
                    >
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-send" />
                        </svg>
                        {sentToClient ? 'Sent to Client' : 'Send to Client'}
                    </button>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 gap-[24px] max-[1100px]:flex-col">
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="flex-1 overflow-y-auto p-[40px] text-bion-text">
                        <div className="mb-[40px] flex flex-wrap items-start justify-between max-[760px]:flex-col max-[760px]:gap-[24px]">
                            <div className="flex-1">
                                <h2 className="mb-[4px] text-[18px] font-semibold">{quotation.business.name}</h2>
                                <p className="leading-normal text-[13.5px] text-bion-text-muted whitespace-pre-line">
                                    {quotation.business.address}
                                    {'\n'}
                                    {quotation.business.email}
                                </p>
                            </div>
                            <div className="text-right max-[760px]:text-left">
                                <div className="mb-[2px] text-[12px] text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                    Quotation Number
                                </div>
                                <div className="mb-[12px] font-mono text-[14px] font-medium">{quotation.number}</div>

                                <div className="mb-[2px] text-[12px] text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                    Date Issued
                                </div>
                                <div className="mb-[12px] font-mono text-[14px] font-medium">{quotation.issuedAt}</div>

                                <div className="mb-[2px] text-[12px] text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                    Expiry Date
                                </div>
                                <div className="mb-[12px] font-mono text-[14px] font-medium">{quotation.expiryAt}</div>
                            </div>
                        </div>

                        <div className="mb-[32px] rounded-[8px] border border-bion-border bg-bion-surface-raised p-[20px]">
                            <div className="mb-[6px] text-[12px] text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                Prepared For
                            </div>
                            <h3 className="mb-[4px] text-[16px] font-semibold">{quotation.preparedFor.name}</h3>
                            <p className="leading-normal text-[13.5px] text-bion-text-muted whitespace-pre-line">
                                {`Attn: ${quotation.preparedFor.attn}\n${quotation.preparedFor.address}\n${quotation.preparedFor.email}`}
                            </p>
                        </div>

                        <div className="mb-[32px] overflow-hidden rounded-[8px] border border-bion-border">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-1/2 border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-left text-[12px] font-semibold text-bion-text-muted">
                                            Item &amp; Description
                                        </th>
                                        <th className="w-[16.6%] border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-right text-[12px] font-semibold text-bion-text-muted">
                                            Qty
                                        </th>
                                        <th className="w-[16.6%] border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-right text-[12px] font-semibold text-bion-text-muted">
                                            Price
                                        </th>
                                        <th className="w-[16.6%] border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-right text-[12px] font-semibold text-bion-text-muted">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child_td]:border-b-0">
                                    {quotation.lineItems.map((item) => (
                                        <tr key={item.name}>
                                            <td className="border-b border-bion-border px-[16px] py-[14px] align-top text-[13.5px]">
                                                <div className="mb-[4px] font-medium">{item.name}</div>
                                                <div className="text-[12.5px] leading-[1.4] text-bion-text-muted">
                                                    {item.description}
                                                </div>
                                            </td>
                                            <td className="border-b border-bion-border px-[16px] py-[14px] text-right align-top font-mono text-[13.5px]">
                                                {item.qty}
                                            </td>
                                            <td className="border-b border-bion-border px-[16px] py-[14px] text-right align-top font-mono text-[13.5px]">
                                                {item.price}
                                            </td>
                                            <td className="border-b border-bion-border px-[16px] py-[14px] text-right align-top font-mono text-[13.5px] font-semibold">
                                                {item.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex flex-col items-end gap-[8px] bg-bion-surface-raised px-[24px] py-[16px]">
                                <div className="flex w-[280px] justify-between text-[13.5px]">
                                    <span className="text-bion-text-muted">Subtotal</span>
                                    <span className="font-mono font-medium">{quotation.subtotal}</span>
                                </div>
                                <div className="flex w-[280px] justify-between text-[13.5px]">
                                    <span className="text-bion-text-muted">{quotation.discountLabel}</span>
                                    <span className="font-mono font-medium">{quotation.discountAmount}</span>
                                </div>
                                <div className="mt-[8px] flex w-[280px] justify-between border-t border-dashed border-bion-border pt-[12px] text-[18px] font-bold text-bion-text">
                                    <span className="text-bion-text-muted">Total Estimate</span>
                                    <span className="font-mono font-medium text-bion-accent">{quotation.total}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-[32px] border-t border-bion-border pt-[24px]">
                            <h4 className="mb-[8px] text-[13px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                Terms &amp; Conditions
                            </h4>
                            <p className="whitespace-pre-wrap text-[13.5px] leading-normal text-bion-text-muted">
                                {quotation.terms}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex w-[340px] shrink-0 flex-col gap-[16px] overflow-y-auto pr-[4px] max-[1100px]:w-full">
                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[16px] flex items-center justify-between text-[13.5px] font-semibold">
                            Settings
                        </div>

                        <div className="mb-[14px]">
                            <span className="mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                Linked Project
                            </span>
                            {quotation.linkedProject && currentTeam ? (
                                <Link
                                    href={projectShow({
                                        current_team: currentTeam.slug,
                                        project: quotation.linkedProject.id,
                                    })}
                                    className="block rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[10px] text-[13.5px] font-medium"
                                >
                                    <svg className={cn(ICON_SM_CLS, 'mr-[6px] inline-block align-[-3px] text-bion-text-muted')}>
                                        <use href="#i-briefcase" />
                                    </svg>
                                    {quotation.linkedProject.title}
                                </Link>
                            ) : (
                                <div className="rounded-[8px] border border-dashed border-bion-border px-[12px] py-[10px] text-[13.5px] text-bion-text-muted">
                                    No linked project
                                </div>
                            )}
                        </div>

                        <div className="mb-0">
                            <span className="mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                Currency
                            </span>
                            <select
                                className="w-full rounded-[8px] border border-bion-border bg-bion-bg px-[11px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none"
                                defaultValue={quotation.currency}
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="IDR">IDR - Indonesian Rupiah</option>
                                <option value="EUR">EUR - Euro</option>
                            </select>
                        </div>
                    </div>

                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[16px] flex items-center justify-between text-[13.5px] font-semibold">
                            Actions
                        </div>
                        <div className="flex flex-col gap-[8px]">
                            <button type="button" className={BTN_SIDEBAR_PRIMARY} onClick={convertToInvoice}>
                                <svg className={cn(ICON_SM_CLS, 'mr-[4px]')}>
                                    <use href="#i-receipt" />
                                </svg>
                                Convert to Invoice
                            </button>
                            <button type="button" className={BTN_SIDEBAR_LIST}>
                                <svg className={cn(ICON_SM_CLS, 'mr-[4px]')}>
                                    <use href="#i-bell" />
                                </svg>
                                Schedule Auto-Reminder
                            </button>
                            <button
                                type="button"
                                className={BTN_SIDEBAR_LIST}
                                onClick={pdf.download}
                                disabled={pdf.downloading}
                            >
                                <svg className={cn(ICON_SM_CLS, 'mr-[4px]')}>
                                    <use href="#i-download" />
                                </svg>
                                {pdf.downloading ? 'Generating…' : 'Download PDF'}
                            </button>
                            {pdf.error ? (
                                <p className="text-[12px] text-bion-danger">{pdf.error}</p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

QuotationShowPage.layout = (props: { currentTeam?: { slug: string } | null; quotation?: { number: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Quotations',
            href: props.currentTeam ? quotations(props.currentTeam.slug) : '/',
        },
        {
            title: props.quotation?.number ?? 'Quotation',
            href: '#',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
