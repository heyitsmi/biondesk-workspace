import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as invoices } from '@/routes/invoices';
import { update as updateRecurring } from '@/routes/invoices/recurring';
import type { RecurringInvoiceEditPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(
    BTN,
    'w-full justify-center bg-bion-accent text-bion-accent-text hover:opacity-[0.88]',
);

const FIELD_LABEL_SM =
    'mb-[7px] block text-[11.5px] text-bion-text-muted uppercase [letter-spacing:0.04em]';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[9px] text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-[0.6]';

const LINE_INPUT =
    'mb-[4px] w-full rounded-[6px] border border-transparent bg-transparent px-[12px] py-[8px] text-[14px] text-bion-text [transition:border-color_0.15s_ease,background_0.15s_ease] hover:bg-bion-surface-raised focus:border-bion-accent focus:bg-bion-bg focus:outline-none';
const LINE_TEXTAREA = cn(
    LINE_INPUT,
    'mb-0 min-h-[40px] resize-y text-[12.5px] text-bion-text-muted',
);

const TOGGLE_TRACK =
    'relative inline-block h-[22px] w-[40px] shrink-0 cursor-pointer';
const TOGGLE_KNOB =
    'before:absolute before:bottom-[3px] before:left-[3px] before:h-[16px] before:w-[16px] before:rounded-full before:bg-white before:shadow-[0_2px_4px_rgba(0,0,0,0.2)] before:content-[""] before:[transition:.2s]';

type DraftLineItem = {
    id: number;
    name: string;
    description: string;
    qty: number;
    price: string;
};

const INTERVAL_OPTIONS: Array<[number, string]> = [
    [1, 'Monthly'],
    [3, 'Every 3 months'],
    [6, 'Every 6 months'],
    [12, 'Annually'],
];

const formatMoney = (value: number): string => `$${value.toFixed(2)}`;

const parsePrice = (formatted: string): string =>
    formatted.replace(/[^0-9.]/g, '');

export default function RecurringInvoiceEditPage({
    template,
    clients,
    projects,
}: RecurringInvoiceEditPageProps) {
    const { currentTeam } = usePage().props;
    const [title, setTitle] = useState(template.title);
    const [clientId, setClientId] = useState(String(template.contactId));
    const [intervalMonths, setIntervalMonths] = useState(
        template.intervalMonths,
    );
    const [startsAt, setStartsAt] = useState(template.startsAt);
    const [endsAt, setEndsAt] = useState(template.endsAt ?? '');
    const [dueDays, setDueDays] = useState(String(template.dueDays));
    const [autoSend, setAutoSend] = useState(template.autoSend);
    const [lineItems, setLineItems] = useState<DraftLineItem[]>(
        template.lineItems.map((item, index) => ({
            id: index + 1,
            name: item.name,
            description: item.description,
            qty: item.qty,
            price: parsePrice(item.price),
        })),
    );
    const [taxPercent, setTaxPercent] = useState(String(template.taxPercent));
    const [notes, setNotes] = useState(template.notes);
    const [projectId, setProjectId] = useState(String(template.projectId));
    const [currency, setCurrency] = useState(template.currency);

    const startsAtLocked = template.occurrencesGenerated > 0;

    const totals = useMemo(() => {
        const subtotal = lineItems.reduce(
            (sum, item) => sum + item.qty * (parseFloat(item.price) || 0),
            0,
        );
        const taxModifier = parseFloat(taxPercent) || 0;
        const total = subtotal + subtotal * (taxModifier / 100);

        return { subtotal, total };
    }, [lineItems, taxPercent]);

    const updateLineItem = (
        id: number,
        patch: Partial<DraftLineItem>,
    ): void => {
        setLineItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, ...patch } : item,
            ),
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
        setLineItems((current) =>
            current.length > 1
                ? current.filter((item) => item.id !== id)
                : current,
        );
    };

    const submit = (): void => {
        if (!currentTeam) {
            return;
        }

        router.put(
            updateRecurring({
                current_team: currentTeam.slug,
                template: template.id,
            }).url,
            {
                title,
                clientId,
                projectId,
                intervalMonths,
                startsAt,
                endsAt,
                dueDays,
                autoSend,
                currency,
                notes,
                taxPercent,
                items: lineItems,
            },
        );
    };

    return (
        <>
            <Head title={`Edit ${template.title || 'Recurring Invoice'}`} />

            <div className="mb-[20px] flex shrink-0 flex-wrap items-center justify-between gap-[16px]">
                <h1 className="font-mono text-[24px] font-bold [letter-spacing:-0.02em]">
                    Edit Recurring Invoice
                </h1>
            </div>

            <div className="flex min-h-0 flex-1 gap-[24px] max-[1100px]:flex-col">
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="flex-1 overflow-y-auto p-[40px] text-bion-text">
                        <div className="mb-[32px]">
                            <span className={FIELD_LABEL_SM}>
                                Title (Optional)
                            </span>
                            <input
                                type="text"
                                className={FIELD_INPUT}
                                placeholder="e.g. Monthly retainer"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                            />
                        </div>

                        <div className="mb-[32px] flex flex-col gap-[12px] rounded-[8px] border border-dashed border-bion-border bg-bion-surface-raised p-[20px]">
                            <div className="text-[12px] [letter-spacing:0.05em] text-bion-text-muted uppercase">
                                Bill To
                            </div>
                            <select
                                className={FIELD_INPUT}
                                value={clientId}
                                onChange={(event) =>
                                    setClientId(event.target.value)
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

                        <div className="mb-[32px] grid grid-cols-2 gap-[16px] rounded-[8px] border border-bion-border p-[20px] max-[600px]:grid-cols-1">
                            <div>
                                <span className={FIELD_LABEL_SM}>
                                    Bills Every
                                </span>
                                <select
                                    className={FIELD_INPUT}
                                    value={intervalMonths}
                                    onChange={(event) =>
                                        setIntervalMonths(
                                            Number(event.target.value),
                                        )
                                    }
                                >
                                    {INTERVAL_OPTIONS.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <span className={FIELD_LABEL_SM}>
                                    Due Within (Days)
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    className={FIELD_INPUT}
                                    value={dueDays}
                                    onChange={(event) =>
                                        setDueDays(event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <span className={FIELD_LABEL_SM}>
                                    Starts On
                                </span>
                                <input
                                    type="date"
                                    className={FIELD_INPUT}
                                    value={startsAt}
                                    disabled={startsAtLocked}
                                    onChange={(event) =>
                                        setStartsAt(event.target.value)
                                    }
                                />
                                {startsAtLocked ? (
                                    <p className="mt-[6px] text-[11.5px] text-bion-text-muted">
                                        Locked after the first invoice has been
                                        generated.
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <span className={FIELD_LABEL_SM}>
                                    Ends On (Optional)
                                </span>
                                <input
                                    type="date"
                                    className={FIELD_INPUT}
                                    value={endsAt}
                                    onChange={(event) =>
                                        setEndsAt(event.target.value)
                                    }
                                />
                            </div>
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
                                                    className={cn(
                                                        LINE_INPUT,
                                                        'font-medium',
                                                    )}
                                                    placeholder="Item name"
                                                    value={item.name}
                                                    onChange={(event) =>
                                                        updateLineItem(
                                                            item.id,
                                                            {
                                                                name: event
                                                                    .target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <textarea
                                                    className={LINE_TEXTAREA}
                                                    placeholder="Description (optional)"
                                                    value={item.description}
                                                    onChange={(event) =>
                                                        updateLineItem(
                                                            item.id,
                                                            {
                                                                description:
                                                                    event.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="border-b border-bion-border p-[8px] align-top">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    className={cn(
                                                        LINE_INPUT,
                                                        'text-right font-mono',
                                                    )}
                                                    value={item.qty}
                                                    onChange={(event) =>
                                                        updateLineItem(
                                                            item.id,
                                                            {
                                                                qty: Math.max(
                                                                    1,
                                                                    parseInt(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                        10,
                                                                    ) || 1,
                                                                ),
                                                            },
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="border-b border-bion-border p-[8px] align-top">
                                                <input
                                                    type="text"
                                                    className={cn(
                                                        LINE_INPUT,
                                                        'text-right font-mono',
                                                    )}
                                                    placeholder="0.00"
                                                    value={item.price}
                                                    onChange={(event) =>
                                                        updateLineItem(
                                                            item.id,
                                                            {
                                                                price: event
                                                                    .target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="border-b border-bion-border px-[8px] pt-[16px] pb-[8px] text-right align-top">
                                                {formatMoney(
                                                    item.qty *
                                                        (parseFloat(
                                                            item.price,
                                                        ) || 0),
                                                )}
                                            </td>
                                            <td className="border-b border-bion-border px-[8px] pt-[12px] pb-[8px] text-right align-top">
                                                <button
                                                    type="button"
                                                    className="relative inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] text-bion-danger hover:bg-bion-surface-raised"
                                                    title="Remove Item"
                                                    onClick={() =>
                                                        removeLineItem(item.id)
                                                    }
                                                >
                                                    <svg
                                                        className={ICON_SM_CLS}
                                                    >
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
                                <svg
                                    className={cn(
                                        ICON_SM_CLS,
                                        'mr-[4px] inline-block align-[-3px]',
                                    )}
                                >
                                    <use href="#i-plus" />
                                </svg>
                                Add Line Item
                            </button>
                        </div>

                        <div className="-mt-[24px] mb-[32px] flex flex-col items-end gap-[8px] rounded-b-[8px] border border-t-0 border-bion-border bg-bion-surface-raised px-[24px] py-[16px]">
                            <div className="flex w-[280px] items-center justify-between text-[13.5px]">
                                <span className="text-bion-text-muted">
                                    Subtotal
                                </span>
                                <span className="font-mono font-medium">
                                    {formatMoney(totals.subtotal)}
                                </span>
                            </div>
                            <div className="my-[8px] flex w-[280px] items-center justify-between text-[13.5px]">
                                <span className="text-bion-text-muted">
                                    Tax (%)
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-[80px] rounded-[8px] border border-bion-border bg-bion-bg px-[8px] py-[4px] text-right text-[13.5px] text-bion-text focus:border-bion-accent focus:outline-none"
                                    value={taxPercent}
                                    onChange={(event) =>
                                        setTaxPercent(event.target.value)
                                    }
                                />
                            </div>
                            <div className="mt-[8px] flex w-[280px] items-center justify-between border-t border-dashed border-bion-border pt-[12px] text-[18px] font-bold text-bion-text">
                                <span className="text-bion-text-muted">
                                    Invoice Total
                                </span>
                                <span className="font-mono font-medium text-bion-accent">
                                    {formatMoney(totals.total)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-[32px] border-t border-bion-border pt-[24px]">
                            <h4 className="mb-[8px] text-[13px] font-semibold [letter-spacing:0.05em] text-bion-text-muted uppercase">
                                Payment Instructions &amp; Notes
                            </h4>
                            <textarea
                                className={cn(
                                    FIELD_INPUT,
                                    'min-h-[110px] resize-y',
                                )}
                                rows={5}
                                placeholder="Enter bank details, payment links, or special notes here..."
                                value={notes}
                                onChange={(event) =>
                                    setNotes(event.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="flex w-[340px] shrink-0 flex-col gap-[16px] overflow-y-auto pr-[4px] max-[1100px]:w-full">
                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[16px] flex items-center justify-between text-[13.5px] font-semibold">
                            Publishing
                        </div>
                        <div className="mb-[16px] flex items-center justify-between">
                            <div className="flex flex-col gap-[2px]">
                                <span className="text-[13px] font-medium text-bion-text">
                                    Auto-send
                                </span>
                                <span className="text-[11.5px] text-bion-text-muted">
                                    Email the client automatically each cycle
                                </span>
                            </div>
                            <label className={TOGGLE_TRACK}>
                                <input
                                    type="checkbox"
                                    className="peer h-0 w-0 opacity-0"
                                    checked={autoSend}
                                    onChange={(event) =>
                                        setAutoSend(event.target.checked)
                                    }
                                />
                                <span
                                    className={cn(
                                        'absolute inset-0 rounded-[22px] [transition:.2s]',
                                        TOGGLE_KNOB,
                                        autoSend
                                            ? 'bg-bion-success before:translate-x-[18px]'
                                            : 'bg-bion-border',
                                    )}
                                />
                            </label>
                        </div>
                        <button
                            type="button"
                            className={BTN_PRIMARY}
                            onClick={submit}
                        >
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-check" />
                            </svg>
                            Save Changes
                        </button>
                    </div>

                    <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[16px]">
                        <div className="mb-[16px] flex items-center justify-between text-[13.5px] font-semibold">
                            Settings
                        </div>

                        <div className="mb-[14px]">
                            <span className={FIELD_LABEL_SM}>
                                Linked Project (Optional)
                            </span>
                            <select
                                className={FIELD_INPUT}
                                value={projectId}
                                onChange={(event) =>
                                    setProjectId(event.target.value)
                                }
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
                                onChange={(event) =>
                                    setCurrency(event.target.value)
                                }
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="IDR">
                                    IDR - Indonesian Rupiah
                                </option>
                                <option value="EUR">EUR - Euro</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

RecurringInvoiceEditPage.layout = (props: {
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
            title: `Edit ${props.template?.title || 'Recurring Invoice'}`,
            href: '#',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
