import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as contactCreate, index as contacts, store as storeContact } from '@/routes/contacts';
import type { ContactCreatePageProps, ContactFormValues } from '@/types';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted hover:bg-bion-surface-raised');
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[12px] py-[9px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease,background_0.15s_ease] focus:border-bion-accent focus:bg-bion-surface-raised';
const FIELD_LABEL = 'text-[13px] font-medium text-bion-text-muted';

export default function ContactCreatePage({ defaults }: ContactCreatePageProps) {
    const { currentTeam } = usePage().props;
    const { data, setData, post, processing, errors } = useForm<ContactFormValues>(defaults);

    const fullNamePreview = useMemo(() => {
        return [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
    }, [data.firstName, data.lastName]);

    const cancel = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(contacts(currentTeam.slug));
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!currentTeam) {
            return;
        }

        post(storeContact(currentTeam.slug).url);
    };

    return (
        <>
            <Head title="New Contact" />

            <div className="flex flex-1 justify-center overflow-y-auto">
                <form className="w-full max-w-[680px] pb-[80px]" onSubmit={submit}>
                    <div className="mb-[24px]">
                        <h1 className="mb-[6px] text-[24px] font-semibold">Add New Contact</h1>
                        <p className="text-[14px] text-bion-text-muted">
                            Create a new client, lead, or vendor record.
                        </p>
                    </div>

                    <div className="mb-[24px] rounded-[12px] border border-bion-border bg-bion-surface p-[24px]">
                        <div className="mb-[16px] flex items-center gap-[8px] text-[15px] font-semibold">
                            <svg className="h-[18px] w-[18px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round] text-bion-text-muted">
                                <use href="#i-user" />
                            </svg>
                            Basic Information
                        </div>

                        <div className="mb-[24px] flex items-center gap-[16px]">
                            <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full border border-dashed border-bion-border bg-bion-bg text-[20px] font-semibold text-bion-text-muted">
                                {fullNamePreview
                                    ? fullNamePreview
                                          .split(' ')
                                          .map((part) => part.charAt(0))
                                          .join('')
                                          .slice(0, 2)
                                          .toUpperCase()
                                    : 'CN'}
                            </div>
                            <div className="flex flex-col gap-[6px]">
                                <button type="button" className={cn(BTN_GHOST, 'px-[12px] py-[6px] text-[12px]')}>
                                    Upload Photo
                                </button>
                                <div className="text-[12px] text-bion-text-muted">
                                    JPG, GIF or PNG. Max size of 2MB.
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-[16px] max-[760px]:grid-cols-1">
                            <Field label="Contact Type">
                                <select
                                    className={FIELD_INPUT}
                                    value={data.type}
                                    onChange={(event) => setData('type', event.target.value as ContactFormValues['type'])}
                                >
                                    <option value="client">Client</option>
                                    <option value="lead">Lead</option>
                                    <option value="vendor">Vendor</option>
                                </select>
                            </Field>
                            <Field label="Company Name">
                                <input
                                    type="text"
                                    className={FIELD_INPUT}
                                    placeholder="e.g. Acme Corp"
                                    value={data.company}
                                    onChange={(event) => setData('company', event.target.value)}
                                />
                            </Field>
                            <Field label="First Name *">
                                <input
                                    type="text"
                                    className={FIELD_INPUT}
                                    placeholder="John"
                                    value={data.firstName}
                                    onChange={(event) => setData('firstName', event.target.value)}
                                />
                                {errors.firstName ? (
                                    <span className="text-[12px] text-bion-danger">{errors.firstName}</span>
                                ) : null}
                            </Field>
                            <Field label="Last Name">
                                <input
                                    type="text"
                                    className={FIELD_INPUT}
                                    placeholder="Smith"
                                    value={data.lastName}
                                    onChange={(event) => setData('lastName', event.target.value)}
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="mb-[24px] rounded-[12px] border border-bion-border bg-bion-surface p-[24px]">
                        <div className="mb-[16px] flex items-center gap-[8px] text-[15px] font-semibold">
                            <svg className="h-[18px] w-[18px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round] text-bion-text-muted">
                                <use href="#i-mail" />
                            </svg>
                            Contact Details
                        </div>

                        <div className="grid grid-cols-2 gap-[16px] max-[760px]:grid-cols-1">
                            <Field label="Email Address">
                                <input
                                    type="email"
                                    className={FIELD_INPUT}
                                    placeholder="john@example.com"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                />
                            </Field>
                            <Field label="Phone Number">
                                <input
                                    type="text"
                                    className={FIELD_INPUT}
                                    placeholder="+1 (555) 123-4567"
                                    value={data.phone}
                                    onChange={(event) => setData('phone', event.target.value)}
                                />
                            </Field>
                            <Field label="Role / Title">
                                <input
                                    type="text"
                                    className={FIELD_INPUT}
                                    placeholder="Marketing Director"
                                    value={data.role}
                                    onChange={(event) => setData('role', event.target.value)}
                                />
                            </Field>
                            <Field label="Location">
                                <input
                                    type="text"
                                    className={FIELD_INPUT}
                                    placeholder="New York, United States"
                                    value={data.location}
                                    onChange={(event) => setData('location', event.target.value)}
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="mb-[24px] rounded-[12px] border border-bion-border bg-bion-surface p-[24px]">
                        <div className="mb-[16px] flex items-center gap-[8px] text-[15px] font-semibold">
                            <svg className="h-[18px] w-[18px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round] text-bion-text-muted">
                                <use href="#i-align-left" />
                            </svg>
                            Additional Information
                        </div>

                        <div className="grid grid-cols-1 gap-[16px]">
                            <Field label="Website">
                                <input
                                    type="text"
                                    className={FIELD_INPUT}
                                    placeholder="https://example.com"
                                    value={data.website}
                                    onChange={(event) => setData('website', event.target.value)}
                                />
                            </Field>
                            <Field label="Notes">
                                <textarea
                                    className={cn(FIELD_INPUT, 'min-h-[120px] resize-y')}
                                    placeholder="Internal notes, billing preferences, or relationship context."
                                    value={data.notes}
                                    onChange={(event) => setData('notes', event.target.value)}
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-[12px]">
                        <button type="button" className={BTN_GHOST} onClick={cancel}>
                            Cancel
                        </button>
                        <button type="submit" className={BTN_PRIMARY} disabled={processing}>
                            {processing ? 'Creating...' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

type FieldProps = {
    label: string;
    children: ReactNode;
};

function Field({ label, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-[6px]">
            <label className={FIELD_LABEL}>{label}</label>
            {children}
        </div>
    );
}

ContactCreatePage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Contacts',
            href: props.currentTeam ? contacts(props.currentTeam.slug) : '/',
        },
        {
            title: 'New Contact',
            href: props.currentTeam ? contactCreate(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
