import { Head, Link, usePage } from '@inertiajs/react';
import { useState  } from 'react';
import type {ReactNode} from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as contactEdit, index as contacts, show as contactShow } from '@/routes/contacts';
import { show as invoiceShow } from '@/routes/invoices';
import { show as projectShow } from '@/routes/projects';
import type { BiondeskTone, ContactDetail, ContactShowPageProps } from '@/types';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97] max-[760px]:flex-1 max-[760px]:justify-center';
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted hover:bg-bion-surface-raised');
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
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

type TabKey = 'overview' | 'projects' | 'invoices' | 'notes';

export default function ContactShowPage({ contact }: ContactShowPageProps) {
    const { currentTeam } = usePage().props;
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    return (
        <>
            <Head title={contact.fullName} />

            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-wrap items-start justify-between gap-[24px] border-b border-bion-border bg-bion-surface p-[32px] max-[760px]:flex-col max-[760px]:px-[20px] max-[760px]:py-[24px]">
                    <div className="flex items-center gap-[20px]">
                        <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full border-2 border-bion-bg bg-bion-accent-soft text-[28px] font-bold text-bion-accent shadow-bion-raised">
                            {contact.initials}
                        </div>
                        <div>
                            <h1 className="mb-[6px] text-[24px] font-semibold text-bion-text">
                                {contact.fullName}
                            </h1>
                            <div className="mb-[10px] flex items-center gap-[8px] text-[15px] text-bion-text-muted">
                                <svg className="h-[15px] w-[15px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                    <use href="#i-briefcase" />
                                </svg>
                                {contact.company}
                            </div>
                            <div className="flex flex-wrap gap-[8px]">
                                <span className={toneClassMap[contact.typeTone]}>
                                    <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[contact.typeTone])} />
                                    {contact.typeLabel}
                                </span>
                                <span className={toneClassMap[contact.statusTone]}>
                                    <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[contact.statusTone])} />
                                    {contact.statusLabel}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-[10px] max-[760px]:w-full">
                        <Link
                            href={contactEdit({
                                current_team: currentTeam?.slug ?? '',
                                contact: contact.id,
                            })}
                            className={BTN_GHOST}
                        >
                            <svg className="h-[15px] w-[15px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                <use href="#i-edit" />
                            </svg>
                            Edit Contact
                        </Link>
                        <a href={`mailto:${contact.email}`} className={BTN_PRIMARY}>
                            <svg className="h-[15px] w-[15px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                <use href="#i-mail" />
                            </svg>
                            Send Email
                        </a>
                    </div>
                </div>

                <div className="flex gap-[32px] overflow-x-auto border-b border-bion-border bg-bion-surface px-[32px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[760px]:px-[20px]">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                        Overview
                    </TabButton>
                    <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>
                        Projects ({contact.relatedProjects.length})
                    </TabButton>
                    <TabButton active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')}>
                        Invoices ({contact.relatedInvoices.length})
                    </TabButton>
                    <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
                        Notes &amp; Files
                    </TabButton>
                </div>

                <div className="grid gap-[24px] p-[32px] [grid-template-columns:2fr_1fr] max-[1024px]:grid-cols-1 max-[760px]:p-[20px]">
                    {activeTab === 'overview' ? (
                        <>
                            <div className="flex flex-col gap-[24px]">
                                <Panel title="Contact Information">
                                    <InfoItem label="Email Address" value={contact.email} link={`mailto:${contact.email}`} icon="i-mail" />
                                    <InfoItem label="Phone Number" value={contact.phone} icon="i-phone" mono />
                                    <InfoItem label="Website" value={contact.website} link={contact.website} icon="i-link" />
                                    <InfoItem label="Billing Address" value={contact.billingAddress} icon="i-file" multiline />
                                </Panel>

                                <Panel title="Recent Activity">
                                    <div className="relative flex flex-col gap-[16px] before:absolute before:bottom-[8px] before:left-[16px] before:top-[8px] before:w-px before:bg-bion-border before:content-['']">
                                        {contact.activity.map((item) => (
                                            <div key={item.id} className="relative z-[2] flex gap-[16px]">
                                                <div
                                                    className={cn(
                                                        'flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border border-bion-border bg-bion-surface text-bion-text-muted',
                                                        item.tone === 'success' && 'text-bion-success',
                                                        item.tone === 'accent' && 'text-bion-accent',
                                                        item.tone === 'danger' && 'text-bion-danger',
                                                    )}
                                                >
                                                    <svg className="h-[15px] w-[15px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                                        <use href="#i-receipt" />
                                                    </svg>
                                                </div>
                                                <div className="pt-[6px]">
                                                    <div className="mb-[2px] text-[13.5px] font-medium">
                                                        {item.title}
                                                    </div>
                                                    <div className="mb-[3px] text-[12.5px] leading-[1.5] text-bion-text-muted">
                                                        {item.description}
                                                    </div>
                                                    <div className="font-mono text-[12px] text-bion-text-muted">
                                                        {item.when}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                            </div>

                            <div className="flex flex-col gap-[24px]">
                                <Panel title="Profile Summary">
                                    <KeyValue label="Role" value={contact.role} />
                                    <KeyValue label="Location" value={contact.location} />
                                    <KeyValue label="Contact Code" value={contact.code} mono />
                                </Panel>

                                <Panel title="Notes">
                                    <p className="whitespace-pre-line text-[13.5px] leading-[1.7] text-bion-text-muted">
                                        {contact.notes}
                                    </p>
                                </Panel>
                            </div>
                        </>
                    ) : null}

                    {activeTab === 'projects' ? (
                        <div className="col-span-full grid gap-[16px] md:grid-cols-2">
                            {contact.relatedProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={projectShow({
                                        current_team: currentTeam?.slug ?? '',
                                        project: project.id,
                                    })}
                                    className="rounded-[12px] border border-bion-border bg-bion-surface p-[20px] [transition:border-color_0.12s_ease,transform_0.12s_ease] hover:border-bion-accent hover:-translate-y-[1px]"
                                >
                                    <div className="mb-[8px] flex items-center justify-between gap-[12px]">
                                        <h3 className="text-[18px] font-semibold">{project.title}</h3>
                                        <span className={toneClassMap[project.tone]}>{project.stageLabel}</span>
                                    </div>
                                    <div className="text-[13px] text-bion-text-muted">
                                        Due {project.dueAt}
                                    </div>
                                </Link>
                            ))}

                            {contact.relatedProjects.length === 0 ? (
                                <EmptyState message="No related projects attached to this contact yet." />
                            ) : null}
                        </div>
                    ) : null}

                    {activeTab === 'invoices' ? (
                        <div className="col-span-full grid gap-[16px]">
                            {contact.relatedInvoices.map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    href={invoiceShow({
                                        current_team: currentTeam?.slug ?? '',
                                        invoice: invoice.id,
                                    })}
                                    className="flex flex-wrap items-center justify-between gap-[12px] rounded-[12px] border border-bion-border bg-bion-surface p-[18px] [transition:border-color_0.12s_ease,transform_0.12s_ease] hover:border-bion-accent hover:-translate-y-[1px]"
                                >
                                    <div>
                                        <div className="mb-[4px] font-mono text-[14px] font-semibold">
                                            {invoice.number}
                                        </div>
                                        <div className="text-[13px] text-bion-text-muted">
                                            Due {invoice.dueAt}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-[12px]">
                                        <span className={toneClassMap[invoice.tone]}>
                                            {invoice.statusLabel}
                                        </span>
                                        <span className="font-mono text-[15px] font-semibold">
                                            {invoice.amount}
                                        </span>
                                    </div>
                                </Link>
                            ))}

                            {contact.relatedInvoices.length === 0 ? (
                                <EmptyState message="No invoices are linked to this contact yet." />
                            ) : null}
                        </div>
                    ) : null}

                    {activeTab === 'notes' ? (
                        <div className="col-span-full grid gap-[16px] md:grid-cols-2">
                            {contact.notesAndFiles.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-[12px] border border-bion-border bg-bion-surface p-[18px]"
                                >
                                    <div className="mb-[8px] flex items-center gap-[8px]">
                                        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-bion-surface-raised text-bion-text-muted">
                                            <svg className="h-[15px] w-[15px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                                                <use href={item.kind === 'file' ? '#i-paperclip' : '#i-align-left'} />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-[12.5px] text-bion-text-muted">
                                                {item.meta}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={toneClassMap[item.kind === 'file' ? 'muted' : 'accent']}>
                                        {item.kind === 'file' ? 'File' : 'Note'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}

type TabButtonProps = {
    active: boolean;
    children: ReactNode;
    onClick: () => void;
};

function TabButton({ active, children, onClick }: TabButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                'relative cursor-pointer whitespace-nowrap py-[16px] text-[14px] font-medium text-bion-text-muted [transition:color_0.12s_ease] hover:text-bion-text',
                active &&
                    "font-semibold text-bion-text after:absolute after:-bottom-px after:left-0 after:right-0 after:h-[2px] after:rounded-t-[2px] after:bg-bion-accent after:content-['']",
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

type PanelProps = {
    title: string;
    children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
    return (
        <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[20px]">
            <div className="mb-[16px] flex items-center justify-between text-[15px] font-semibold text-bion-text">
                {title}
            </div>
            {children}
        </div>
    );
}

type InfoItemProps = {
    icon: string;
    label: string;
    value: string;
    link?: string;
    mono?: boolean;
    multiline?: boolean;
};

function InfoItem({ icon, label, value, link, mono = false, multiline = false }: InfoItemProps) {
    const content = link ? (
        <a
            className="text-bion-info hover:underline"
            href={link}
            target={link.startsWith('http') ? '_blank' : undefined}
            rel={link.startsWith('http') ? 'noreferrer' : undefined}
        >
            {value}
        </a>
    ) : (
        value
    );

    return (
        <div className="flex gap-[12px]">
            <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] bg-bion-surface-raised text-bion-text-muted">
                <svg className="h-[18px] w-[18px] fill-none stroke-current shrink-0 [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                    <use href={`#${icon}`} />
                </svg>
            </div>
            <div>
                <h4 className="mb-[2px] text-[12.5px] font-medium text-bion-text-muted uppercase [letter-spacing:0.04em]">
                    {label}
                </h4>
                <p
                    className={cn(
                        'leading-normal text-[14px] text-bion-text',
                        mono && 'font-mono',
                        multiline && 'whitespace-pre-line',
                    )}
                >
                    {content}
                </p>
            </div>
        </div>
    );
}

type KeyValueProps = {
    label: string;
    value: string;
    mono?: boolean;
};

function KeyValue({ label, value, mono = false }: KeyValueProps) {
    return (
        <div className="flex items-center justify-between gap-[16px] border-b border-dashed border-bion-border py-[10px] last:border-b-0 last:pb-0 first:pt-0">
            <span className="text-[12.5px] uppercase [letter-spacing:0.04em] text-bion-text-muted">
                {label}
            </span>
            <span className={cn('text-right text-[13.5px] text-bion-text', mono && 'font-mono')}>
                {value}
            </span>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-[12px] border border-dashed border-bion-border bg-bion-surface px-[20px] py-[30px] text-[13px] text-bion-text-muted">
            {message}
        </div>
    );
}

ContactShowPage.layout = (props: { currentTeam?: { slug: string } | null; contact?: ContactDetail | null }) => ({
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
            title: props.contact?.fullName ?? 'Contact',
            href:
                props.currentTeam && props.contact
                    ? contactShow({ current_team: props.currentTeam.slug, contact: props.contact.id })
                    : '/',
        },
    ],
    mainClassName: 'flex-1 overflow-hidden p-0',
});
