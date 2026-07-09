import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { destroy as destroyProposal, edit as proposalEdit, index as proposals, update as updateProposal } from '@/routes/proposals';
import type { ProposalDraftLineItem, ProposalEditPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center justify-center gap-[8px] rounded-[8px] px-[18px] py-[10px] text-[14px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'w-full bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'w-full border border-bion-border bg-transparent text-bion-text hover:bg-bion-surface-raised');
const BTN_GHOST_SM =
    'inline-flex items-center gap-[6px] rounded-[6px] px-[12px] py-[8px] text-[13px] font-semibold text-bion-accent [transition:background_0.15s_ease] hover:bg-bion-accent-soft';
const BTN_DANGER_SM =
    'inline-flex w-full items-center justify-center gap-[7px] rounded-[8px] border border-bion-danger-soft bg-transparent px-[16px] py-[9px] text-[13.5px] font-semibold text-bion-danger [transition:opacity_0.12s_ease] hover:bg-bion-danger-soft';

const FIELD_LABEL_SM =
    'mb-[4px] text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]';
const DOC_FIELD_INPUT =
    'w-full rounded-[6px] border border-bion-border bg-bion-bg px-[10px] py-[7px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

const LINE_INPUT =
    'mb-[4px] w-full rounded-[6px] border border-bion-border bg-bion-bg px-[10px] py-[7px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

const SIDEBAR_LABEL = 'mb-[6px] block text-[12px] font-medium text-bion-text-muted';
const SIDEBAR_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[8px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

const formatMoney = (value: number): string => `$${value.toFixed(2)}`;

export default function ProposalEditPage({ clients, projects, proposal }: ProposalEditPageProps) {
    const { currentTeam } = usePage().props;
    const [title, setTitle] = useState(proposal.title);
    const [datePrepared, setDatePrepared] = useState(proposal.datePrepared);
    const [validUntil, setValidUntil] = useState(proposal.validUntil);
    const [clientId, setClientId] = useState<number | ''>(proposal.clientId);
    const [content, setContent] = useState(proposal.content);
    const [lineItems, setLineItems] = useState<ProposalDraftLineItem[]>(
        proposal.lineItems.length > 0
            ? proposal.lineItems
            : [{ name: '', description: '', qty: 1, price: '' }],
    );
    const [discountPercent, setDiscountPercent] = useState('0');
    const [taxPercent, setTaxPercent] = useState('0');
    const [notes, setNotes] = useState(proposal.notes);
    const [projectId, setProjectId] = useState('');
    const [currency, setCurrency] = useState('USD');

    const totals = useMemo(() => {
        const subtotal = lineItems.reduce(
            (sum, item) => sum + item.qty * (parseFloat(item.price) || 0),
            0,
        );
        const discountModifier = parseFloat(discountPercent) || 0;
        const taxModifier = parseFloat(taxPercent) || 0;
        const afterDiscount = subtotal - subtotal * (discountModifier / 100);
        const total = afterDiscount + afterDiscount * (taxModifier / 100);

        return { subtotal, total };
    }, [lineItems, discountPercent, taxPercent]);

    const updateLineItem = (index: number, patch: Partial<ProposalDraftLineItem>): void => {
        setLineItems((current) =>
            current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
        );
    };

    const addLineItem = (): void => {
        setLineItems((current) => [...current, { name: '', description: '', qty: 1, price: '' }]);
    };

    const removeLineItem = (index: number): void => {
        setLineItems((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current));
    };

    const backToProposals = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(proposals(currentTeam.slug));
    };

    const saveChanges = (): void => {
        if (!currentTeam) {
            return;
        }

        router.put(updateProposal({ current_team: currentTeam.slug, proposal: proposal.id }).url, {
            title,
            clientId,
            projectId,
            datePrepared,
            validUntil,
            content,
            notes,
            currency,
            discountPercent,
            taxPercent,
            items: lineItems,
        });
    };

    const deleteProposal = (): void => {
        if (!currentTeam) {
            return;
        }

        router.delete(destroyProposal({ current_team: currentTeam.slug, proposal: proposal.id }).url);
    };

    return (
        <>
            <Head title={title} />

            <div className="flex flex-1 min-h-0 gap-[24px] max-[1024px]:flex-col">
                <div className="flex flex-1 justify-center overflow-y-auto">
                    <form
                        className="flex w-full items-start justify-center"
                        onSubmit={(event) => {
                            event.preventDefault();
                            backToProposals();
                        }}
                    >
                        <div className="mb-[40px] w-full max-w-[800px] rounded-[12px] border border-bion-border bg-bion-surface p-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] max-[1024px]:p-[20px]">
                            <div className="mb-[40px]">
                                <input
                                    type="text"
                                    className="-ml-[12px] w-full rounded-[8px] border border-transparent bg-transparent px-[12px] py-[8px] font-display text-[32px] font-bold text-bion-text [transition:border-color_0.15s_ease,background_0.15s_ease] hover:bg-bion-bg focus:border-bion-accent focus:bg-bion-bg focus:outline-none"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                />
                            </div>

                            <div className="mb-[40px] grid grid-cols-2 gap-[24px] max-[760px]:grid-cols-1 max-[760px]:gap-[16px]">
                                <div className="flex flex-col gap-[12px]">
                                    <div>
                                        <div className={FIELD_LABEL_SM}>Date Prepared</div>
                                        <input
                                            type="date"
                                            className={DOC_FIELD_INPUT}
                                            value={datePrepared}
                                            onChange={(event) => setDatePrepared(event.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <div className={FIELD_LABEL_SM}>Valid Until</div>
                                        <input
                                            type="date"
                                            className={DOC_FIELD_INPUT}
                                            value={validUntil}
                                            onChange={(event) => setValidUntil(event.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-[12px]">
                                    <div>
                                        <div className={FIELD_LABEL_SM}>Prepared For</div>
                                        <select
                                            className={DOC_FIELD_INPUT}
                                            value={clientId}
                                            onChange={(event) =>
                                                setClientId(event.target.value === '' ? '' : Number(event.target.value))
                                            }
                                        >
                                            <option value="">-- Select Client --</option>
                                            {clients.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-[8px] text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                Proposal Content
                            </div>
                            <div className="mb-[40px] overflow-hidden rounded-[8px] border border-bion-border">
                                <div className="flex flex-wrap gap-[4px] border-b border-bion-border bg-bion-bg px-[10px] py-[8px]">
                                    <button type="button" className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text" title="Bold">
                                        <svg className={ICON_SM_CLS}>
                                            <use href="#i-bold" />
                                        </svg>
                                    </button>
                                    <button type="button" className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text" title="Italic">
                                        <svg className={ICON_SM_CLS}>
                                            <use href="#i-italic" />
                                        </svg>
                                    </button>
                                    <div className="mx-[4px] w-px bg-bion-border" />
                                    <button type="button" className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text" title="List">
                                        <svg className={ICON_SM_CLS}>
                                            <use href="#i-list" />
                                        </svg>
                                    </button>
                                </div>
                                <textarea
                                    className="min-h-[200px] w-full resize-y bg-bion-surface p-[20px] text-[14px] text-bion-text outline-none placeholder:text-bion-text-muted"
                                    placeholder="Write your executive summary, methodology, and proposal details here..."
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                />
                            </div>

                            <div className="mb-[8px] text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                Investment / Cost Breakdown
                            </div>
                            <div className="mb-[40px]">
                                <table className="mb-[16px] w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="w-[45%] border-b border-bion-border px-[8px] pb-[12px] text-left text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                                Service &amp; Description
                                            </th>
                                            <th className="w-[15%] border-b border-bion-border px-[8px] pb-[12px] text-right text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                                Qty
                                            </th>
                                            <th className="w-[20%] border-b border-bion-border px-[8px] pb-[12px] text-right text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                                Price
                                            </th>
                                            <th className="w-[15%] border-b border-bion-border px-[8px] pb-[12px] text-right text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                                Total
                                            </th>
                                            <th className="w-[5%] border-b border-bion-border px-[8px] pb-[12px]" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border-b border-bion-border px-[8px] py-[12px] align-top">
                                                    <input
                                                        type="text"
                                                        className={cn(LINE_INPUT, 'font-medium')}
                                                        placeholder="Service name"
                                                        value={item.name}
                                                        onChange={(event) =>
                                                            updateLineItem(index, { name: event.target.value })
                                                        }
                                                    />
                                                    <textarea
                                                        className={cn(LINE_INPUT, 'mb-0 min-h-[40px] resize-y text-[13px] text-bion-text-muted')}
                                                        placeholder="Description (optional)"
                                                        value={item.description}
                                                        onChange={(event) =>
                                                            updateLineItem(index, { description: event.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td className="border-b border-bion-border px-[8px] py-[12px] align-top">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        className={cn(LINE_INPUT, 'text-right')}
                                                        value={item.qty}
                                                        onChange={(event) =>
                                                            updateLineItem(index, {
                                                                qty: Math.max(1, parseInt(event.target.value, 10) || 1),
                                                            })
                                                        }
                                                    />
                                                </td>
                                                <td className="border-b border-bion-border px-[8px] py-[12px] align-top">
                                                    <input
                                                        type="text"
                                                        className={cn(LINE_INPUT, 'text-right')}
                                                        placeholder="0.00"
                                                        value={item.price}
                                                        onChange={(event) =>
                                                            updateLineItem(index, { price: event.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td className="border-b border-bion-border px-[8px] pt-[16px] text-right align-top">
                                                    {formatMoney(item.qty * (parseFloat(item.price) || 0))}
                                                </td>
                                                <td className="border-b border-bion-border px-[8px] pt-[12px] text-right align-top">
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-danger hover:bg-bion-surface-raised"
                                                        title="Remove Item"
                                                        onClick={() => removeLineItem(index)}
                                                    >
                                                        <svg className={ICON_SM_CLS}>
                                                            <use href="#i-trash" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button type="button" className={BTN_GHOST_SM} onClick={addLineItem}>
                                    <svg className={cn(ICON_SM_CLS, 'inline-block align-[-3px]')}>
                                        <use href="#i-plus" />
                                    </svg>
                                    Add Service
                                </button>
                            </div>

                            <div className="mb-[40px] flex flex-col items-end pr-[8px]">
                                <div className="flex w-[240px] items-center justify-between py-[6px] text-[14px]">
                                    <span className="text-bion-text-muted">Subtotal</span>
                                    <span className="font-medium text-bion-text">{formatMoney(totals.subtotal)}</span>
                                </div>
                                <div className="my-[8px] flex w-[240px] items-center justify-between py-[6px] text-[14px]">
                                    <span className="text-bion-text-muted">Discount (%)</span>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-[80px] rounded-[8px] border border-bion-border bg-bion-bg px-[8px] py-[4px] text-right text-[14px] text-bion-text outline-none focus:border-bion-accent"
                                        value={discountPercent}
                                        onChange={(event) => setDiscountPercent(event.target.value)}
                                    />
                                </div>
                                <div className="my-[8px] flex w-[240px] items-center justify-between py-[6px] text-[14px]">
                                    <span className="text-bion-text-muted">Tax (%)</span>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-[80px] rounded-[8px] border border-bion-border bg-bion-bg px-[8px] py-[4px] text-right text-[14px] text-bion-text outline-none focus:border-bion-accent"
                                        value={taxPercent}
                                        onChange={(event) => setTaxPercent(event.target.value)}
                                    />
                                </div>
                                <div className="mt-[8px] flex w-[240px] items-center justify-between border-t border-bion-border pt-[12px] text-[16px]">
                                    <span className="text-bion-text-muted">Estimated Total</span>
                                    <span className="font-bold text-bion-accent">{formatMoney(totals.total)}</span>
                                </div>
                            </div>

                            <div>
                                <div className="mb-[8px] text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                    Additional Notes
                                </div>
                                <textarea
                                    className="w-full rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[8px] text-[14px] text-bion-text outline-none focus:border-bion-accent"
                                    rows={4}
                                    placeholder="Terms and conditions or next steps..."
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="flex w-[300px] shrink-0 flex-col gap-[24px] overflow-y-auto border-l border-bion-border bg-bion-surface p-[20px] max-[1024px]:w-full max-[1024px]:border-l-0 max-[1024px]:border-t">
                    <div className="rounded-[10px] border border-bion-border bg-bion-bg p-[16px]">
                        <div className="mb-[12px] text-[13px] font-semibold text-bion-text uppercase [letter-spacing:0.04em]">
                            Publishing
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <button type="button" className={BTN_PRIMARY} onClick={saveChanges}>
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-check" />
                                </svg>
                                Save Changes
                            </button>
                            <button type="button" className={BTN_GHOST} onClick={backToProposals}>
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[10px] border border-bion-border bg-bion-bg p-[16px]">
                        <div className="mb-[12px] text-[13px] font-semibold text-bion-text uppercase [letter-spacing:0.04em]">
                            Settings
                        </div>

                        <div className="mb-[16px]">
                            <span className={SIDEBAR_LABEL}>Linked Project (Optional)</span>
                            <select
                                className={SIDEBAR_INPUT}
                                value={projectId}
                                onChange={(event) => setProjectId(event.target.value)}
                            >
                                <option value="">-- No Project --</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={SIDEBAR_LABEL}>Currency</span>
                            <select
                                className={SIDEBAR_INPUT}
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value)}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="IDR">IDR (Rp)</option>
                            </select>
                        </div>
                    </div>

                    <button type="button" className={BTN_DANGER_SM} onClick={deleteProposal}>
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-trash" />
                        </svg>
                        Delete Proposal
                    </button>
                </div>
            </div>
        </>
    );
}

ProposalEditPage.layout = (props: {
    currentTeam?: { slug: string } | null;
    proposal?: { id: number; title: string } | null;
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
            title: props.proposal?.title ?? 'Edit Proposal',
            href:
                props.currentTeam && props.proposal
                    ? proposalEdit({ current_team: props.currentTeam.slug, proposal: props.proposal.id })
                    : '/',
        },
    ],
    mainClassName: 'flex min-h-0 flex-1 flex-col overflow-hidden px-[24px] py-[40px] max-[1024px]:px-[16px] max-[1024px]:py-[20px]',
});
