import { Head, router, useForm, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as projectCreate, index as projects, store as storeProject } from '@/routes/projects';
import type { ProjectCreatePageProps, ProjectFormValues } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center justify-center gap-[8px] rounded-[8px] px-[18px] py-[10px] text-[14px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted hover:bg-bion-surface-raised');

const FIELD_LABEL = 'text-[13px] font-medium text-bion-text-muted';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

const TOOLBAR_BTN =
    'flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-bion-text-muted [transition:background_0.12s_ease] hover:bg-bion-surface-raised hover:text-bion-text';

type ProjectFieldErrors = Partial<
    Record<'opportunity_id' | 'title' | 'status' | 'start_date' | 'due_date' | 'description' | 'budget_value', string>
>;

export default function ProjectCreatePage({ stages, opportunities: opportunityOptions, defaults }: ProjectCreatePageProps) {
    const { currentTeam } = usePage().props;
    const { data, setData, post, processing, errors } = useForm<ProjectFormValues>(defaults);
    const fieldErrors = errors as ProjectFieldErrors;

    const backToProjects = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(projects(currentTeam.slug));
    };

    const submit = (): void => {
        if (!currentTeam) {
            return;
        }

        post(storeProject(currentTeam.slug).url);
    };

    const selectOpportunity = (opportunityId: number | ''): void => {
        const selected = opportunityOptions.find((opportunity) => opportunity.id === opportunityId);
        const shouldFillTitle = opportunityId !== '' && data.title === '' && selected;

        setData((current) => ({
            ...current,
            opportunityId,
            title: shouldFillTitle ? selected.title : current.title,
        }));
    };

    return (
        <>
            <Head title="New Project" />

            <div className="flex flex-1 flex-col items-center overflow-y-auto">
                <div className="w-full max-w-[680px] pb-[80px]">
                    <div className="mb-[24px]">
                        <h1 className="mb-[6px] text-[24px] font-semibold text-bion-text">Create New Project</h1>
                        <p className="text-[14px] text-bion-text-muted">
                            Setup a new project space to manage tasks, team members, and progress.
                        </p>
                    </div>

                    {opportunityOptions.length === 0 ? (
                        <div className="rounded-[12px] border border-dashed border-bion-border bg-bion-surface p-[24px] text-center text-[13.5px] text-bion-text-muted">
                            No opportunities are available to turn into a project yet. Mark an opportunity as{' '}
                            <strong>Won</strong> first, then come back here.
                        </div>
                    ) : (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                submit();
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
                                                Opportunity <span className="text-bion-danger">*</span>
                                            </label>
                                            <select
                                                className={FIELD_INPUT}
                                                value={data.opportunityId}
                                                onChange={(event) =>
                                                    selectOpportunity(event.target.value === '' ? '' : Number(event.target.value))
                                                }
                                                required
                                            >
                                                <option value="">Select an opportunity...</option>
                                                {opportunityOptions.map((opportunity) => (
                                                    <option key={opportunity.id} value={opportunity.id}>
                                                        {opportunity.title} — {opportunity.company}
                                                    </option>
                                                ))}
                                            </select>
                                            {fieldErrors.opportunity_id ? (
                                                <span className="text-[12px] text-bion-danger">{fieldErrors.opportunity_id}</span>
                                            ) : null}
                                        </div>

                                        <div className="col-span-full flex flex-col gap-[8px]">
                                            <label className={FIELD_LABEL}>
                                                Project Name <span className="text-bion-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={FIELD_INPUT}
                                                placeholder="e.g. Acme Website Redesign"
                                                value={data.title}
                                                onChange={(event) => setData('title', event.target.value)}
                                                required
                                            />
                                            {fieldErrors.title ? (
                                                <span className="text-[12px] text-bion-danger">{fieldErrors.title}</span>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-col gap-[8px]">
                                            <label className={FIELD_LABEL}>Status</label>
                                            <select
                                                className={FIELD_INPUT}
                                                value={data.status}
                                                onChange={(event) => setData('status', event.target.value)}
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
                                                value={data.startDate}
                                                onChange={(event) => setData('startDate', event.target.value)}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-[8px]">
                                            <label className={FIELD_LABEL}>Due Date</label>
                                            <input
                                                type="date"
                                                className={FIELD_INPUT}
                                                value={data.dueDate}
                                                onChange={(event) => setData('dueDate', event.target.value)}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-[8px]">
                                            <label className={FIELD_LABEL}>Estimated Budget</label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-[14px] text-bion-text-muted">$</span>
                                                <input
                                                    type="number"
                                                    className={cn(FIELD_INPUT, 'pr-[14px] pl-[32px]')}
                                                    placeholder="0.00"
                                                    value={data.budgetValue}
                                                    onChange={(event) => setData('budgetValue', event.target.value)}
                                                />
                                            </div>
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
                                                    placeholder="Brief overview of this project's goals..."
                                                    value={data.description}
                                                    onChange={(event) => setData('description', event.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-[32px] flex justify-end gap-[12px] border-t border-bion-border pt-[24px]">
                                <button type="button" className={BTN_GHOST} onClick={backToProjects}>
                                    Cancel
                                </button>
                                <button type="submit" className={BTN_PRIMARY} disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

ProjectCreatePage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
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
            title: 'New Project',
            href: props.currentTeam ? projectCreate(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col items-center overflow-hidden px-[24px] py-[32px] max-[760px]:px-[16px] max-[760px]:py-[20px]',
});
