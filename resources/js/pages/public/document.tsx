import { Head } from '@inertiajs/react';
import { Fragment } from 'react';
import { useDocumentPdfDownload } from '@/hooks/use-document-pdf-download';
import { cn } from '@/lib/utils';
import type { BiondeskTone, PublicDocumentPageProps } from '@/types';

const ICON_CLS =
    'h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

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

function DownloadIcon() {
    return (
        <svg className={ICON_CLS} viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

function PrimaryActionIcon() {
    return (
        <svg className={ICON_CLS} viewBox="0 0 24 24">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    );
}

export default function PublicDocumentPage({ document }: PublicDocumentPageProps) {
    const pdf = useDocumentPdfDownload(document.pdfUrls);

    return (
        <>
            <Head title={`${document.number} — Biondesk`} />

            <div className="flex min-h-screen flex-col bg-bion-bg font-display text-[14px] text-bion-text antialiased">
                <header className="sticky top-0 z-10 flex h-[70px] items-center justify-between border-b border-bion-border bg-bion-surface px-[32px] max-[760px]:h-[60px] max-[760px]:px-[16px]">
                    <div className="flex items-center gap-[16px]">
                        <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] border border-bion-border bg-bion-surface-raised">
                            <span className="h-[8px] w-[8px] rounded-full bg-bion-accent" />
                        </div>
                        <div className="flex flex-col gap-[2px]">
                            <span className="text-[14.5px] font-semibold">
                                {document.kindLabel} {document.number}
                            </span>
                            <span className="text-[12px] text-bion-text-muted max-[760px]:hidden">
                                From {document.business.name} for {document.recipient.name}
                            </span>
                        </div>
                        <span className={cn(toneClassMap[document.tone], 'ml-[8px]')}>
                            <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[document.tone])} />
                            {document.statusLabel}
                        </span>
                    </div>

                    <div className="flex items-center gap-[12px]">
                        {document.amountDue !== null ? (
                            <div className="mr-[12px] font-mono text-[16px] font-bold text-bion-text max-[760px]:hidden">
                                {document.amountDue}{' '}
                                <span className="text-[12px] font-medium text-bion-text-muted">Due</span>
                            </div>
                        ) : null}
                        <button
                            type="button"
                            className="inline-flex items-center gap-[7px] rounded-[8px] bg-transparent px-[16px] py-[9px] text-[13.5px] font-semibold text-bion-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:bg-bion-surface-raised active:scale-[0.97]"
                            onClick={pdf.download}
                            disabled={pdf.downloading}
                        >
                            <DownloadIcon />
                            <span className="max-[760px]:hidden">
                                {pdf.downloading ? 'Generating…' : 'Download PDF'}
                            </span>
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-[7px] rounded-[8px] bg-bion-accent px-[16px] py-[9px] text-[13.5px] font-semibold text-bion-accent-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:opacity-[0.88] active:scale-[0.97]"
                        >
                            <PrimaryActionIcon />
                            {document.primaryActionLabel}
                        </button>
                    </div>
                </header>

                {pdf.error ? (
                    <div className="border-b border-bion-border bg-bion-danger-soft px-[32px] py-[8px] text-center text-[12.5px] text-bion-danger max-[760px]:px-[16px]">
                        {pdf.error}
                    </div>
                ) : null}

                <main className="flex flex-1 items-start justify-center px-[20px] py-[40px] max-[760px]:px-[10px] max-[760px]:py-[20px]">
                    <div className="w-full max-w-[820px]">
                        <div className="mx-auto w-full max-w-[820px] rounded-[12px] border border-bion-border bg-bion-surface p-[50px_60px] shadow-bion-raised max-[760px]:p-[30px_20px]">
                            <div className="mb-[50px] flex flex-wrap items-start justify-between gap-[30px] max-[760px]:mb-[30px] max-[760px]:flex-col">
                                <div>
                                    <h2 className="mb-[8px] text-[22px] font-bold">{document.business.name}</h2>
                                    <p className="whitespace-pre-line text-[13.5px] leading-[1.6] text-bion-text-muted">
                                        {document.business.address}
                                        {'\n'}
                                        {document.business.email}
                                    </p>
                                </div>
                                <div className="grid grid-cols-[auto_auto] items-center gap-x-[32px] gap-y-[12px] max-[760px]:w-full max-[760px]:grid-cols-2">
                                    {document.dateFields.map((field) => (
                                        <Fragment key={field.label}>
                                            <div className="text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                                {field.label}
                                            </div>
                                            <div
                                                className={cn(
                                                    'text-right font-mono text-[13px] font-medium max-[760px]:text-left',
                                                    field.danger && 'text-bion-danger',
                                                )}
                                            >
                                                {field.value}
                                            </div>
                                        </Fragment>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-[50px]">
                                <div className="text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                    {document.recipient.label}
                                </div>
                                <h3 className="my-[8px] mb-[4px] text-[16px] font-semibold">
                                    {document.recipient.name}
                                </h3>
                                <p className="whitespace-pre-line text-[13.5px] leading-[1.6] text-bion-text-muted">
                                    {`Attn: ${document.recipient.attn}\n${document.recipient.address}\n${document.recipient.email}`}
                                </p>
                            </div>

                            <div>
                                <table className="mb-[24px] w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border-b-2 border-bion-border px-[16px] py-[12px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                                Item &amp; Description
                                            </th>
                                            <th className="w-[80px] border-b-2 border-bion-border px-[16px] py-[12px] text-right font-mono text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em] max-[760px]:hidden">
                                                Qty
                                            </th>
                                            <th className="w-[120px] border-b-2 border-bion-border px-[16px] py-[12px] text-right font-mono text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em] max-[760px]:hidden">
                                                Price
                                            </th>
                                            <th className="w-[120px] border-b-2 border-bion-border px-[16px] py-[12px] text-right text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {document.lineItems.map((item) => (
                                            <tr key={item.name}>
                                                <td className="border-b border-bion-border px-[16px] py-[16px] align-top">
                                                    <div className="mb-[6px] text-[14px] font-semibold">
                                                        {item.name}
                                                    </div>
                                                    <div className="max-w-[400px] text-[12.5px] leading-[1.5] text-bion-text-muted">
                                                        {item.description}
                                                    </div>
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[16px] text-right align-top font-mono text-[13px] max-[760px]:hidden">
                                                    {item.qty}
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[16px] text-right align-top font-mono text-[13px] max-[760px]:hidden">
                                                    {item.price}
                                                </td>
                                                <td className="border-b border-bion-border px-[16px] py-[16px] text-right align-top font-mono text-[14px] font-semibold">
                                                    {item.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mb-[50px] ml-auto flex w-[320px] flex-col gap-[12px] max-[760px]:w-full">
                                    <div className="flex justify-between text-[14px] text-bion-text-muted">
                                        <span>Subtotal</span>
                                        <span className="font-mono text-bion-text">{document.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-[14px] text-bion-text-muted">
                                        <span>{document.adjustmentLabel}</span>
                                        <span className="font-mono text-bion-text">{document.adjustmentAmount}</span>
                                    </div>
                                    <div className="mt-[4px] flex justify-between border-t border-bion-border pt-[12px] text-[16px] font-semibold text-bion-text">
                                        <span>{document.totalLabel}</span>
                                        <span className="font-mono">{document.total}</span>
                                    </div>

                                    {document.amountPaid !== null ? (
                                        <div className="mt-[8px] flex justify-between text-[14px] text-bion-text-muted">
                                            <span>Amount Paid</span>
                                            <span className="font-mono text-bion-success">
                                                -{document.amountPaid}
                                            </span>
                                        </div>
                                    ) : null}

                                    {document.amountDue !== null ? (
                                        <div className="mt-[8px] flex justify-between rounded-[8px] bg-bion-accent-soft p-[16px] text-[18px] font-bold text-bion-accent">
                                            <span>Amount Due</span>
                                            <span className="font-mono text-bion-accent">{document.amountDue}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="border-t border-dashed border-bion-border pt-[32px]">
                                <h4 className="mb-[10px] text-[12.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                    {document.notesLabel}
                                </h4>
                                <p className="whitespace-pre-line text-[13px] leading-[1.6] text-bion-text-muted">
                                    {document.notes}
                                </p>
                            </div>
                        </div>

                        <div className="mt-[30px] text-center text-[12px] text-bion-text-muted">
                            Powered by{' '}
                            <span className="font-medium text-bion-text underline decoration-bion-border underline-offset-[3px]">
                                Biondesk
                            </span>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
