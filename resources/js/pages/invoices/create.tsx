import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as invoiceCreate, index as invoices, store as storeInvoice } from '@/routes/invoices';
import type { InvoiceCreatePageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'w-full justify-center bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'w-full justify-center border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted');

const FIELD_LABEL_SM = 'mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none';

const LINE_INPUT =
    'mb-[4px] w-full rounded-[6px] border border-transparent bg-transparent px-[12px] py-[8px] text-[14px] text-bion-text [transition:border-color_0.15s_ease,background_0.15s_ease] hover:bg-bion-surface-raised focus:border-bion-accent focus:bg-bion-bg focus:outline-none';
const LINE_TEXTAREA = cn(LINE_INPUT, 'mb-0 min-h-[40px] resize-y text-[12.5px] text-bion-text-muted');

type DraftLineItem = {
    id: number;
    name: string;
    description: string;
    qty: number;
    price: string;
};

const formatMoney = (value: number): string => `$${value.toFixed(2)}`;

export default function InvoiceCreatePage({
    nextNumber,
    defaultIssuedAt,
    defaultDueAt,
    clients,
    projects,
}: InvoiceCreatePageProps) {
    const { currentTeam } = usePage().props;
    const [invoiceNumber, setInvoiceNumber] = useState(nextNumber);
    const [issuedAt, setIssuedAt] = useState(defaultIssuedAt);
    const [dueAt, setDueAt] = useState(defaultDueAt);
    const [clientId, setClientId] = useState('');
    const [lineItems, setLineItems] = useState<DraftLineItem[]>([
        { id: 1, name: '', description: '', qty: 1, price: '' },
    ]);
    const [taxPercent, setTaxPercent] = useState('0');
    const [notes, setNotes] = useState('');
    const [projectId, setProjectId] = useState('');
    const [currency, setCurrency] = useState('USD');

    const totals = useMemo(() => {
        const subtotal = lineItems.reduce(
            (sum, item) => sum + item.qty * (parseFloat(item.price) || 0),
            0,
        );
        const taxModifier = parseFloat(taxPercent) || 0;
        const total = subtotal + subtotal * (taxModifier / 100);

        return { subtotal, total };
    }, [lineItems, taxPercent]);

    const updateLineItem = (id: number, patch: Partial<DraftLineItem>): void => {
        setLineItems((current) =>
            current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        );
    };

    const addLineItem = (): void => {
        const nextId = Math.max(...lineItems.map((item) => item.id), 0) + 1;
        setLineItems((current) => [
            ...current,
            { id: nextId, name: '', description: '', qty: 1, price: '' },
        ]);
    };

    const removeLineItem = (id: number): void => {
        setLineItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
    };

    const submit = (status: 'draft' | 'sent'): void => {
        if (!currentTeam) {
            return;
        }

        router.post(storeInvoice(currentTeam.slug).url, {
            status,
            clientId,
            projectId,
            issuedAt,
            dueAt,
            currency,
            notes,
            taxPercent,
            items: lineItems,
        });
    };

    return (
        <>
            <Head title="New Invoice" />

            <div className="mb-[20px] flex shrink-0 flex-wrap items-center justify-between gap-[16px]">
                <h1 className="font-mono text-[24px] font-bold [letter-spacing:-0.02em]">New Invoice</h1>
            </div>

            <div className="flex min-h-0 flex-1 gap-[24px] max-[1100px]:flex-col">
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="flex-1 overflow-y-auto p-[40px] text-bion-text">
                        <div className="mb-[40px] flex items-start justify-between gap-[24px] max-[760px]:flex-col">
                            <div className="flex-1">
                                <h2 className="mb-[4px] px-[12px] text-[18px] font-semibold">Biondesk Studio</h2>
                                <p className="px-[12px] leading-normal text-[13.5px] text-bion-text-muted">
                                    123 Creative Street, Tech District
                                    <br />
                                    Jakarta, Indonesia 12345
                                </p>
                            </div>
                            <div className="grid w-[320px] grid-cols-[auto_1fr] items-center gap-x-[16px] gap-y-[8px] max-[760px]:w-full max-[760px]:grid-cols-[100px_1fr]">
                                <div className="text-right text-[12px] text-bion-text-muted uppercase [letter-spacing:0.05em] max-[760px]:text-left">
                                    Invoice #
                                </div>
                                <input
                                    type="text"
                                    className={cn(FIELD_INPUT, 'font-mono')}
                                    value={invoiceNumber}
                                    onChange={(event) => setInvoiceNumber(event.target.value)}
                                />

                                <div className="text-right text-[12px] text-bion-text-muted uppercase [letter-spacing:0.05em] max-[760px]:text-left">
                                    Date Issued
                                </div>
                                <input
                                    type="date"
                                    className={FIELD_INPUT}
                                    value={issuedAt}
                                    onChange={(event) => setIssuedAt(event.target.value)}
                                />

                                <div className="text-right text-[12px] text-bion-text-muted uppercase [letter-spacing:0.05em] max-[760px]:text-left">
                                    Due Date
                                </div>
                                <input
                                    type="date"
                                    className={FIELD_INPUT}
                                    value={dueAt}
                                    onChange={(event) => setDueAt(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mb-[32px] flex flex-col gap-[12px] rounded-[8px] border border-dashed border-bion-border bg-bion-surface-raised p-[20px]">
                            <div className="text-[12px] text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                Bill To
                            </div>
                            <select
                                className={FIELD_INPUT}
                                value={clientId}
                                onChange={(event) => setClientId(event.target.value)}
                            >
                                <option value="">-- Select Client --</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                                <option value="new">+ Add New Client</option>
                            </select>
                        </div>

                        <div className="mb-[24px] overflow-hidden rounded-[8px] border border-bion-border">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-[45%] border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-left text-[12px] font-semibold text-bion-text-muted">
                                            Item &amp; Description
                                        </th>
                                        <th className="w-[15%] border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-right text-[12px] font-semibold text-bion-text-muted">
                                            Qty
                                        </th>
                                        <th className="w-[15%] border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-right text-[12px] font-semibold text-bion-text-muted">
                                            Price
                                        </th>
                                        <th className="w-[15%] border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-right text-[12px] font-semibold text-bion-text-muted">
                                            Total
                                        </th>
                                        <th className="w-[10%] border-b border-bion-border bg-bion-surface-raised px-[16px] py-[10px] text-right text-[12px] font-semibold text-bion-text-muted" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="border-b border-bion-border p-[8px] align-top">
                                                <input
                                                    type="text"
                                                    className={cn(LINE_INPUT, 'font-medium')}
                                                    placeholder="Item name"
                                                    value={item.name}
                                                    onChange={(event) =>
                                                        updateLineItem(item.id, { name: event.target.value })
                                                    }
                                                />
                                                <textarea
                                                    className={LINE_TEXTAREA}
                                                    placeholder="Description (optional)"
                                                    value={item.description}
                                                    onChange={(event) =>
                                                        updateLineItem(item.id, { description: event.target.value })
                                                    }
                                                />
                                            </td>
                                            <td className="border-b border-bion-border p-[8px] align-top">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    className={cn(LINE_INPUT, 'text-right font-mono')}
                                                    value={item.qty}
                                                    onChange={(event) =>
                                                        updateLineItem(item.id, {
                                                            qty: Math.max(1, parseInt(event.target.value, 10) || 1),
                                                        })
                                                    }
                                                />
                                            </td>
                                            <td className="border-b border-bion-border p-[8px] align-top">
                                                <input
                                                    type="text"
                                                    className={cn(LINE_INPUT, 'text-right font-mono')}
                                                    placeholder="0.00"
                                                    value={item.price}
                                                    onChange={(event) =>
                                                        updateLineItem(item.id, { price: event.target.value })
                                                    }
                                                />
                                            </td>
                                            <td className="border-b border-bion-border px-[8px] pt-[16px] pb-[8px] text-right align-top">
                                                {formatMoney(item.qty * (parseFloat(item.price) || 0))}
                                            </td>
                                            <td className="border-b border-bion-border px-[8px] pt-[12px] pb-[8px] text-right align-top">
                                                <button
                                                    type="button"
                                                    className="relative inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] text-bion-danger hover:bg-bion-surface-raised"
                                                    title="Remove Item"
                                                    onClick={() => removeLineItem(item.id)}
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
                            <button
                                type="button"
                                className="w-full bg-bion-accent-soft p-[12px] text-center text-[13px] font-medium text-bion-accent [transition:opacity_0.15s_ease] hover:opacity-80"
                                onClick={addLineItem}
                            >
                                <svg className={cn(ICON_SM_CLS, 'mr-[4px] inline-block align-[-3px]')}>
                                    <use href="#i-plus" />
                                </svg>
                                Add Line Item
                            </button>
                        </div>

                        <div className="-mt-[24px] mb-[32px] flex flex-col items-end gap-[8px] rounded-b-[8px] border border-t-0 border-bion-border bg-bion-surface-raised px-[24px] py-[16px]">
                            <div className="flex w-[280px] items-center justify-between text-[13.5px]">
                                <span className="text-bion-text-muted">Subtotal</span>
                                <span className="font-mono font-medium">{formatMoney(totals.subtotal)}</span>
                            </div>
                            <div className="my-[8px] flex w-[280px] items-center justify-between text-[13.5px]">
                                <span className="text-bion-text-muted">Tax (%)</span>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-[80px] rounded-[8px] border border-bion-border bg-bion-bg px-[8px] py-[4px] text-right text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none"
                                    value={taxPercent}
                                    onChange={(event) => setTaxPercent(event.target.value)}
                                />
                            </div>
                            <div className="mt-[8px] flex w-[280px] items-center justify-between border-t border-dashed border-bion-border pt-[12px] text-[18px] font-bold text-bion-text">
                                <span className="text-bion-text-muted">Invoice Total</span>
                                <span className="font-mono font-medium text-bion-accent">
                                    {formatMoney(totals.total)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-[32px] border-t border-bion-border pt-[24px]">
                            <h4 className="mb-[8px] text-[13px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.05em]">
                                Payment Instructions &amp; Notes
                            </h4>
                            <textarea
                                className={cn(FIELD_INPUT, 'min-h-[110px] resize-y')}
                                rows={5}
                                placeholder="Enter bank details, payment links, or special notes here..."
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex w-[340px] shrink-0 flex-col gap-[16px] overflow-y-auto pr-[4px] max-[1100px]:w-full">
                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[16px] flex items-center justify-between text-[13.5px] font-semibold">
                            Publishing
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <button type="button" className={BTN_PRIMARY} onClick={() => submit('sent')}>
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-check" />
                                </svg>
                                Save &amp; Send to Client
                            </button>
                            <button type="button" className={BTN_GHOST} onClick={() => submit('draft')}>
                                Save as Draft
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[16px] flex items-center justify-between text-[13.5px] font-semibold">
                            Settings
                        </div>

                        <div className="mb-[14px]">
                            <span className={FIELD_LABEL_SM}>Linked Project (Optional)</span>
                            <select
                                className={FIELD_INPUT}
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

                        <div className="mb-0">
                            <span className={FIELD_LABEL_SM}>Currency</span>
                            <select
                                className={FIELD_INPUT}
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value)}
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="IDR">IDR - Indonesian Rupiah</option>
                                <option value="EUR">EUR - Euro</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

InvoiceCreatePage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
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
            title: 'New Invoice',
            href: props.currentTeam ? invoiceCreate(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
