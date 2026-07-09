import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as proposals, move as moveProposal } from '@/routes/proposals';
import type { BiondeskTone, ProposalShowPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] max-[760px]:flex-1 max-[760px]:justify-center';
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-bion-surface text-bion-text hover:bg-bion-surface-raised');
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');

const BTN_SIDEBAR_GHOST =
    'inline-flex w-full items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted justify-center';

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

export default function ProposalShowPage({ proposal }: ProposalShowPageProps) {
    const { currentTeam } = usePage().props;
    const [linkCopied, setLinkCopied] = useState(false);
    const [sentToClient, setSentToClient] = useState(proposal.stage !== 'draft');

    const copyShareLink = async (): Promise<void> => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(proposal.shareUrl);
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
            moveProposal({ current_team: currentTeam.slug, proposal: proposal.id }).url,
            { status: 'sent' },
            { preserveScroll: true, onSuccess: () => setSentToClient(true) },
        );
    };

    return (
        <>
            <Head title={proposal.title} />

            <div className="mb-[20px] flex shrink-0 flex-wrap items-start justify-between gap-[16px]">
                <div>
                    <h1 className="mb-[6px] text-[21px] font-bold">{proposal.title}</h1>
                    <div className="flex flex-wrap items-center gap-[12px] text-[13px] text-bion-text-muted">
                        <span className={toneClassMap[proposal.tone]}>
                            <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[proposal.tone])} />
                            {proposal.stageLabel}
                        </span>
                        <span className="flex items-center gap-[5px]">
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-file" />
                            </svg>
                            {proposal.number}
                        </span>
                        <span>Prepared {proposal.datePrepared}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-[8px] max-[760px]:w-full max-[760px]:justify-between">
                    <button type="button" className={BTN_GHOST}>
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-eye" />
                        </svg>
                        Preview
                    </button>
                    <button type="button" className={BTN_GHOST} onClick={() => void copyShareLink()}>
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-link" />
                        </svg>
                        {linkCopied ? 'Link Copied' : 'Copy Link'}
                    </button>
                    <button type="button" className={BTN_PRIMARY} onClick={sendToClient}>
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-send" />
                        </svg>
                        {sentToClient ? 'Sent to Client' : 'Send to Client'}
                    </button>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 gap-[24px] max-[1100px]:flex-col">
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="flex shrink-0 items-center gap-[12px] overflow-x-auto border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px]">
                        <div className="flex gap-[4px] border-r border-bion-border pr-[12px]">
                            <button
                                type="button"
                                className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] bg-bion-accent-soft text-bion-accent"
                            >
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-bold" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-bg hover:text-bion-text"
                            >
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-italic" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-bg hover:text-bion-text"
                            >
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-list" />
                                </svg>
                            </button>
                        </div>
                        <div className="ml-auto flex gap-[4px]">
                            <button
                                type="button"
                                className="inline-flex items-center gap-[7px] rounded-[6px] border border-bion-accent-soft bg-bion-accent-soft px-[12px] py-[6px] text-[12.5px] font-semibold text-bion-accent"
                            >
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-sparkles" />
                                </svg>
                                AI Enhance
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-[40px] py-[32px] leading-[1.6] text-bion-text" contentEditable suppressContentEditableWarning>
                        <h2 className="mb-[16px] text-[20px] font-semibold outline-none">Proposal Content</h2>
                        <p className="mb-[16px] whitespace-pre-wrap outline-none">{proposal.summary}</p>

                        <div className="my-[32px] overflow-hidden rounded-[8px] border border-bion-border" contentEditable={false}>
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
                                    {proposal.lineItems.map((item) => (
                                        <tr key={item.name}>
                                            <td className="border-b border-bion-border px-[16px] py-[12px] text-[13.5px]">
                                                <div>{item.name}</div>
                                                <div className="mt-[4px] text-[12px] text-bion-text-muted">
                                                    {item.description}
                                                </div>
                                            </td>
                                            <td className="border-b border-bion-border px-[16px] py-[12px] text-right text-[13.5px]">
                                                {item.qty}
                                            </td>
                                            <td className="border-b border-bion-border px-[16px] py-[12px] text-right text-[13.5px]">
                                                {item.price}
                                            </td>
                                            <td className="border-b border-bion-border px-[16px] py-[12px] text-right font-mono text-[13.5px] font-semibold">
                                                {item.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex flex-col items-end gap-[8px] bg-bion-surface-raised p-[16px]">
                                <div className="flex w-[240px] justify-between text-[13.5px]">
                                    <span className="text-bion-text-muted">Subtotal</span>
                                    <span className="font-mono">{proposal.subtotal}</span>
                                </div>
                                <div className="flex w-[240px] justify-between text-[13.5px]">
                                    <span className="text-bion-text-muted">{proposal.taxLabel}</span>
                                    <span className="font-mono">{proposal.taxAmount}</span>
                                </div>
                                <div className="mt-[8px] flex w-[240px] justify-between border-t border-dashed border-bion-border pt-[8px] text-[16px] font-bold text-bion-text">
                                    <span className="text-bion-text-muted">Total Amount</span>
                                    <span className="font-mono">{proposal.total}</span>
                                </div>
                            </div>
                        </div>

                        {proposal.notes ? (
                            <>
                                <h2 className="mb-[16px] text-[20px] font-semibold outline-none">Notes</h2>
                                <p className="mb-[16px] whitespace-pre-wrap outline-none">{proposal.notes}</p>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="flex w-[320px] shrink-0 flex-col gap-[16px] overflow-y-auto pr-[4px] max-[1100px]:w-full">
                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[12px] flex items-center justify-between text-[13.5px] font-semibold">
                            Settings
                        </div>

                        <div className="mb-[14px]">
                            <span className="mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                Document ID
                            </span>
                            <input
                                className="w-full rounded-[8px] border border-bion-border bg-bion-bg px-[11px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none"
                                defaultValue={proposal.number}
                            />
                        </div>

                        <div className="mb-[14px]">
                            <span className="mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                Client / Opportunity
                            </span>
                            <div className="flex items-start gap-[12px] rounded-[8px] border border-bion-border bg-bion-bg p-[12px]">
                                <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] bg-bion-surface-raised font-semibold text-bion-text-muted">
                                    {proposal.preparedFor.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-[2px] text-[13.5px] font-semibold">
                                        {proposal.preparedFor.name}
                                    </div>
                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-bion-text-muted">
                                        {proposal.preparedFor.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-[14px]">
                            <span className="mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                Valid Until
                            </span>
                            <input
                                type="date"
                                className="w-full rounded-[8px] border border-bion-border bg-bion-bg px-[11px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none"
                                defaultValue={proposal.validUntilIso}
                            />
                        </div>

                        <div>
                            <span className="mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                Currency
                            </span>
                            <select
                                className="w-full rounded-[8px] border border-bion-border bg-bion-bg px-[11px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none"
                                defaultValue={proposal.currency}
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="IDR">IDR - Indonesian Rupiah</option>
                                <option value="EUR">EUR - Euro</option>
                            </select>
                        </div>
                    </div>

                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[12px] flex items-center justify-between text-[13.5px] font-semibold">
                            Export
                        </div>
                        <button type="button" className={BTN_SIDEBAR_GHOST}>
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-download" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

ProposalShowPage.layout = (props: {
    currentTeam?: { slug: string } | null;
    proposal?: { title: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Proposals',
            href: props.currentTeam ? proposals(props.currentTeam.slug) : '/',
        },
        {
            title: props.proposal?.title ?? 'Proposal',
            href: '#',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
