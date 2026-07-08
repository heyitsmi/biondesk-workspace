import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as projectEdit, index as projects } from '@/routes/projects';
import type { ProjectEditPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center justify-center gap-[8px] rounded-[8px] px-[18px] py-[10px] text-[14px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted hover:bg-bion-surface-raised');
const BTN_DANGER = cn(BTN, 'border border-bion-danger-soft bg-transparent text-bion-danger hover:bg-bion-danger-soft');

const FIELD_LABEL = 'text-[13px] font-medium text-bion-text-muted';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

const TOOLBAR_BTN =
    'flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted [transition:background_0.12s_ease] hover:bg-bion-surface-raised hover:text-bion-text';

export default function ProjectEditPage({ stages, clients, leads, project }: ProjectEditPageProps) {
    const { currentTeam } = usePage().props;
    const [title, setTitle] = useState(project.title);
    const [clientId, setClientId] = useState<number | ''>(project.clientId);
    const [stage, setStage] = useState(project.stage);
    const [startDate, setStartDate] = useState(project.startDate);
    const [dueDate, setDueDate] = useState(project.dueDate);
    const [description, setDescription] = useState(project.description);
    const [leadId, setLeadId] = useState(project.leadId);
    const [budget, setBudget] = useState(project.budget);

    const backToProjects = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(projects(currentTeam.slug));
    };

    return (
        <>
            <Head title={`Edit ${title}`} />

            <div className="flex flex-1 flex-col items-center overflow-y-auto">
                <div className="w-full max-w-[680px] pb-[80px]">
                    <div className="mb-[24px]">
                        <h1 className="mb-[6px] text-[24px] font-semibold text-bion-text">Edit Project</h1>
                        <p className="text-[14px] text-bion-text-muted">Update this project's details.</p>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            backToProjects();
                        }}
                    >
                        <div className="mb-[24px] overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                            <div className="flex items-center gap-[10px] border-b border-bion-border px-[20px] py-[16px]">
                                <svg className={cn(ICON_SM_CLS, 'text-bion-text-muted')}>
                                    <use href="#i-briefcase" />
                                </svg>
                                <h2 className="text-[15px] font-semibold text-bion-text">Project Details</h2>
                            </div>
                            <div className="p-[20px]">
                                <div className="mb-[20px] grid grid-cols-2 gap-[20px] max-[760px]:grid-cols-1">
                                    <div className="col-span-full flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>
                                            Project Name <span className="text-bion-danger">*</span>
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
                                        <label className={FIELD_LABEL}>Client</label>
                                        <select
                                            className={FIELD_INPUT}
                                            value={clientId}
                                            onChange={(event) =>
                                                setClientId(event.target.value === '' ? '' : Number(event.target.value))
                                            }
                                        >
                                            <option value="">Select a client...</option>
                                            {clients.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Status</label>
                                        <select
                                            className={FIELD_INPUT}
                                            value={stage}
                                            onChange={(event) => setStage(event.target.value)}
                                        >
                                            {stages.map((stageOption) => (
                                                <option key={stageOption.key} value={stageOption.key}>
                                                    {stageOption.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Start Date</label>
                                        <input
                                            type="date"
                                            className={FIELD_INPUT}
                                            value={startDate}
                                            onChange={(event) => setStartDate(event.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Due Date</label>
                                        <input
                                            type="date"
                                            className={FIELD_INPUT}
                                            value={dueDate}
                                            onChange={(event) => setDueDate(event.target.value)}
                                        />
                                    </div>

                                    <div className="col-span-full flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Description</label>
                                        <div className="w-full overflow-hidden rounded-[8px] border border-bion-border bg-bion-bg text-[14px] text-bion-text [transition:border-color_0.15s_ease]">
                                            <div className="flex gap-[4px] border-b border-bion-border bg-bion-bg px-[10px] py-[8px]">
                                                <button type="button" className={TOOLBAR_BTN} title="Bold">
                                                    <svg className={ICON_SM_CLS}>
                                                        <use href="#i-bold" />
                                                    </svg>
                                                </button>
                                                <button type="button" className={TOOLBAR_BTN} title="Italic">
                                                    <svg className={ICON_SM_CLS}>
                                                        <use href="#i-italic" />
                                                    </svg>
                                                </button>
                                                <button type="button" className={TOOLBAR_BTN} title="Link">
                                                    <svg className={ICON_SM_CLS}>
                                                        <use href="#i-link" />
                                                    </svg>
                                                </button>
                                                <div className="mx-[4px] w-px bg-bion-border" />
                                                <button type="button" className={TOOLBAR_BTN} title="List">
                                                    <svg className={ICON_SM_CLS}>
                                                        <use href="#i-list" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <textarea
                                                className="min-h-[120px] w-full resize-y p-[14px] text-[14px] text-bion-text outline-none placeholder:text-bion-text-muted"
                                                value={description}
                                                onChange={(event) => setDescription(event.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-[24px] overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                            <div className="flex items-center gap-[10px] border-b border-bion-border px-[20px] py-[16px]">
                                <svg className={cn(ICON_SM_CLS, 'text-bion-text-muted')}>
                                    <use href="#i-users" />
                                </svg>
                                <h2 className="text-[15px] font-semibold text-bion-text">Team &amp; Budget</h2>
                            </div>
                            <div className="p-[20px]">
                                <div className="grid grid-cols-2 gap-[20px] max-[760px]:grid-cols-1">
                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Project Lead</label>
                                        <select
                                            className={FIELD_INPUT}
                                            value={leadId}
                                            onChange={(event) => setLeadId(Number(event.target.value))}
                                        >
                                            {leads.map((lead) => (
                                                <option key={lead.id} value={lead.id}>
                                                    {lead.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Estimated Budget</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-[14px] text-bion-text-muted">$</span>
                                            <input
                                                type="number"
                                                className={cn(FIELD_INPUT, 'pr-[14px] pl-[32px]')}
                                                value={budget}
                                                onChange={(event) => setBudget(event.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-[32px] flex justify-between gap-[12px] border-t border-bion-border pt-[24px]">
                            <button type="button" className={BTN_DANGER} onClick={backToProjects}>
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-trash" />
                                </svg>
                                Delete Project
                            </button>
                            <div className="flex gap-[12px]">
                                <button type="button" className={BTN_GHOST} onClick={backToProjects}>
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

ProjectEditPage.layout = (props: {
    currentTeam?: { slug: string } | null;
    project?: { id: number; title: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Projects',
            href: props.currentTeam ? projects(props.currentTeam.slug) : '/',
        },
        {
            title: props.project?.title ?? 'Edit Project',
            href:
                props.currentTeam && props.project
                    ? projectEdit({ current_team: props.currentTeam.slug, project: props.project.id })
                    : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col items-center overflow-hidden px-[24px] py-[32px] max-[760px]:px-[16px] max-[760px]:py-[20px]',
});
