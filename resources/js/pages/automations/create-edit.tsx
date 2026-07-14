import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { FormEvent } from 'react';
import { dashboard } from '@/routes';
import {
    index as automations,
    store as storeAutomation,
    update as updateAutomation,
} from '@/routes/automations';
import type {
    WorkflowAutomationAction,
    WorkflowAutomationFormPageProps,
    WorkflowAutomationTemplate,
} from '@/types';

type AutomationForm = {
    name: string;
    template: string;
    trigger: string;
    conditions: Record<string, unknown>;
    actions: WorkflowAutomationAction[];
    is_active: boolean;
};

export default function WorkflowAutomationCreateEditPage({
    mode,
    automation,
    templates,
}: WorkflowAutomationFormPageProps) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const queryTemplate = new URLSearchParams(window.location.search).get('template');
    const selectedInitialTemplate = useMemo(
        () => templates.find((template) => template.key === (automation?.template ?? queryTemplate)) ?? templates[0],
        [automation?.template, queryTemplate, templates],
    );

    const { data, setData, post, put, processing, errors } = useForm<AutomationForm>({
        name: automation?.name ?? selectedInitialTemplate?.name ?? '',
        template: automation?.template ?? selectedInitialTemplate?.key ?? '',
        trigger: automation?.trigger ?? selectedInitialTemplate?.trigger ?? '',
        conditions: automation?.conditions ?? selectedInitialTemplate?.conditions ?? {},
        actions: automation?.actions ?? selectedInitialTemplate?.actions ?? [],
        is_active: automation?.isActive ?? true,
    });

    const selectedTemplate = templates.find((template) => template.key === data.template) ?? selectedInitialTemplate;

    const chooseTemplate = (template: WorkflowAutomationTemplate): void => {
        setData({
            name: template.name,
            template: template.key,
            trigger: template.trigger,
            conditions: template.conditions,
            actions: template.actions,
            is_active: data.is_active,
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!teamSlug) {
            return;
        }

        if (mode === 'edit' && automation) {
            put(updateAutomation({ current_team: teamSlug, automation: automation.id }).url);

            return;
        }

        post(storeAutomation(teamSlug).url);
    };

    return (
        <>
            <Head title={mode === 'edit' ? 'Edit Automation' : 'New Automation'} />

            <div className="mb-[24px] flex items-start justify-between gap-[16px]">
                <p className="text-[13px] text-bion-text-muted">
                    Pick one safe internal workflow template, then tune the name and active state.
                </p>
                <Link
                    href={teamSlug ? automations(teamSlug).url : '#'}
                    className="inline-flex items-center gap-[8px] rounded-[8px] border border-bion-border px-[12px] py-[8px] text-[13px] font-semibold text-bion-text hover:border-bion-accent"
                >
                    <svg className="h-[15px] w-[15px] fill-none stroke-current [stroke-width:1.7]">
                        <use href="#i-arrow-left" />
                    </svg>
                    Back
                </Link>
            </div>

            <form onSubmit={submit} className="grid grid-cols-[minmax(0,1fr)_360px] gap-[24px] max-[980px]:grid-cols-1">
                <section className="rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="border-b border-bion-border px-[18px] py-[16px]">
                        <h2 className="text-[15px] font-semibold text-bion-text">Template</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-[12px] p-[18px] max-[760px]:grid-cols-1">
                        {templates.map((template) => (
                            <button
                                key={template.key}
                                type="button"
                                className={`rounded-[10px] border p-[14px] text-left [transition:border-color_0.12s_ease,background_0.12s_ease] ${
                                    data.template === template.key
                                        ? 'border-bion-accent bg-bion-accent-soft'
                                        : 'border-bion-border bg-bion-bg hover:border-bion-accent'
                                }`}
                                onClick={() => chooseTemplate(template)}
                            >
                                <div className="mb-[8px] text-[13.5px] font-semibold text-bion-text">
                                    {template.name}
                                </div>
                                <p className="text-[12.5px] leading-[1.55] text-bion-text-muted">
                                    {template.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                <aside className="h-fit rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="border-b border-bion-border px-[18px] py-[16px]">
                        <h2 className="text-[15px] font-semibold text-bion-text">
                            {mode === 'edit' ? 'Edit Rule' : 'Create Rule'}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-[16px] p-[18px]">
                        <label className="flex flex-col gap-[7px]">
                            <span className="text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                Name
                            </span>
                            <input
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[10px] text-[14px] text-bion-text outline-none focus:border-bion-accent"
                            />
                            {errors.name ? <span className="text-[12px] text-bion-danger">{errors.name}</span> : null}
                        </label>

                        <label className="flex items-center gap-[10px] rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[10px]">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) => setData('is_active', event.target.checked)}
                                className="h-[16px] w-[16px] accent-bion-accent"
                            />
                            <span className="text-[13px] font-medium text-bion-text">Automation is active</span>
                        </label>

                        <div className="rounded-[10px] border border-bion-border bg-bion-bg p-[14px]">
                            <div className="mb-[10px] text-[12px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                Preview
                            </div>
                            <p className="text-[13px] leading-[1.55] text-bion-text">
                                {selectedTemplate?.summary ?? 'Select a template to preview this automation.'}
                            </p>
                            <div className="mt-[12px] space-y-[8px] text-[12px] text-bion-text-muted">
                                <div>
                                    <span className="font-semibold text-bion-text">Trigger:</span>{' '}
                                    {selectedTemplate?.triggerLabel ?? data.trigger}
                                </div>
                                <div>
                                    <span className="font-semibold text-bion-text">Conditions:</span>{' '}
                                    {Object.keys(data.conditions).length > 0
                                        ? JSON.stringify(data.conditions)
                                        : 'No extra condition'}
                                </div>
                                <div>
                                    <span className="font-semibold text-bion-text">Action:</span>{' '}
                                    {data.actions.map((action) => action.type.replaceAll('_', ' ')).join(', ')}
                                </div>
                            </div>
                        </div>

                        {(errors.trigger || errors.actions || errors.template) ? (
                            <div className="rounded-[8px] border border-bion-danger bg-bion-danger-soft px-[12px] py-[10px] text-[12px] text-bion-danger">
                                {errors.trigger ?? errors.actions ?? errors.template}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-[8px] rounded-[8px] bg-bion-accent px-[14px] py-[10px] text-[13px] font-semibold text-bion-accent-text disabled:opacity-60"
                        >
                            <svg className="h-[15px] w-[15px] fill-none stroke-current [stroke-width:1.7]">
                                <use href="#i-check" />
                            </svg>
                            {processing ? 'Saving...' : mode === 'edit' ? 'Save automation' : 'Create automation'}
                        </button>
                    </div>
                </aside>
            </form>
        </>
    );
}

WorkflowAutomationCreateEditPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Automations',
            href: props.currentTeam ? automations(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName: 'flex-1 overflow-y-auto px-[32px] py-[28px] max-[760px]:px-[16px]',
});
