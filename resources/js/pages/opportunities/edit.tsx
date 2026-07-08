import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as opportunityEdit, index as opportunities } from '@/routes/opportunities';
import type { OpportunityEditPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center justify-center gap-[8px] rounded-[8px] px-[18px] py-[10px] text-[14px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted hover:bg-bion-surface-raised');
const BTN_DANGER = cn(BTN, 'border-none bg-transparent text-bion-danger hover:bg-bion-danger-soft');

const FIELD_LABEL = 'text-[13px] font-medium text-bion-text-muted';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

export default function OpportunityEditPage({ stages, contacts, opportunity }: OpportunityEditPageProps) {
    const { currentTeam } = usePage().props;
    const [title, setTitle] = useState(opportunity.title);
    const [contactId, setContactId] = useState<number | ''>(opportunity.contactId);
    const [amountValue, setAmountValue] = useState(opportunity.amountValue);
    const [stage, setStage] = useState(opportunity.stage);
    const [closeDate, setCloseDate] = useState(opportunity.closeDate);
    const [priority, setPriority] = useState(opportunity.priority);
    const [description, setDescription] = useState(opportunity.description);

    const backToOpportunities = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(opportunities(currentTeam.slug));
    };

    return (
        <>
            <Head title={`Edit ${title}`} />

            <div className="flex flex-1 justify-center overflow-y-auto">
                <div className="w-full max-w-[680px] pb-[80px]">
                    <div className="mb-[24px]">
                        <h1 className="mb-[6px] text-[24px] font-semibold text-bion-text">Edit Opportunity</h1>
                        <p className="text-[14px] text-bion-text-muted">Update details for this potential deal.</p>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            backToOpportunities();
                        }}
                    >
                        <div className="mb-[24px] overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                            <div className="flex items-center gap-[10px] border-b border-bion-border px-[20px] py-[16px]">
                                <svg className={cn(ICON_SM_CLS, 'text-bion-text-muted')}>
                                    <use href="#i-kanban" />
                                </svg>
                                <div className="text-[15px] font-semibold text-bion-text">Opportunity Details</div>
                            </div>
                            <div className="p-[20px]">
                                <div className="mb-[20px] grid grid-cols-2 gap-[20px] max-[760px]:grid-cols-1">
                                    <div className="col-span-full flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>
                                            Opportunity Name <span className="text-bion-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={FIELD_INPUT}
                                            value={title}
                                            onChange={(event) => setTitle(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>
                                            Client / Contact <span className="text-bion-danger">*</span>
                                        </label>
                                        <select
                                            className={FIELD_INPUT}
                                            value={contactId}
                                            onChange={(event) =>
                                                setContactId(event.target.value === '' ? '' : Number(event.target.value))
                                            }
                                            required
                                        >
                                            <option value="" disabled>
                                                Select an existing contact...
                                            </option>
                                            {contacts.map((contact) => (
                                                <option key={contact.id} value={contact.id}>
                                                    {contact.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Estimated Value</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-[14px] text-bion-text-muted">$</span>
                                            <input
                                                type="number"
                                                className={cn(FIELD_INPUT, 'pr-[14px] pl-[32px]')}
                                                min={0}
                                                step="0.01"
                                                value={amountValue}
                                                onChange={(event) => setAmountValue(event.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>
                                            Pipeline Stage <span className="text-bion-danger">*</span>
                                        </label>
                                        <select
                                            className={FIELD_INPUT}
                                            value={stage}
                                            onChange={(event) => setStage(event.target.value)}
                                            required
                                        >
                                            {stages.map((stageOption) => (
                                                <option key={stageOption.key} value={stageOption.key}>
                                                    {stageOption.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Expected Close Date</label>
                                        <input
                                            type="date"
                                            className={FIELD_INPUT}
                                            value={closeDate}
                                            onChange={(event) => setCloseDate(event.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Priority</label>
                                        <select
                                            className={FIELD_INPUT}
                                            value={priority}
                                            onChange={(event) =>
                                                setPriority(event.target.value as 'low' | 'medium' | 'high')
                                            }
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div className="col-span-full flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Description &amp; Notes</label>
                                        <textarea
                                            className={cn(FIELD_INPUT, 'min-h-[80px] resize-y')}
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-[32px] flex items-center justify-between gap-[12px] border-t border-bion-border pt-[24px]">
                            <button type="button" className={BTN_DANGER} onClick={backToOpportunities}>
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-trash" />
                                </svg>
                                Delete Opportunity
                            </button>
                            <div className="flex gap-[12px]">
                                <button type="button" className={BTN_GHOST} onClick={backToOpportunities}>
                                    Cancel
                                </button>
                                <button type="submit" className={BTN_PRIMARY}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

OpportunityEditPage.layout = (props: {
    currentTeam?: { slug: string } | null;
    opportunity?: { id: number; title: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Opportunities',
            href: props.currentTeam ? opportunities(props.currentTeam.slug) : '/',
        },
        {
            title: props.opportunity?.title ?? 'Edit Opportunity',
            href:
                props.currentTeam && props.opportunity
                    ? opportunityEdit({ current_team: props.currentTeam.slug, opportunity: props.opportunity.id })
                    : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden p-[32px] max-[760px]:px-[16px] max-[760px]:py-[20px]',
});
