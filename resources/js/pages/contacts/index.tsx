import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as contactCreate, index as contacts, show as contactShow } from '@/routes/contacts';
import type {
    BiondeskTone,
    ContactListItem,
    ContactsIndexPageProps,
} from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
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

export default function ContactsPage({
    contacts: items,
    defaultFilters,
}: ContactsIndexPageProps) {
    const { currentTeam } = usePage().props;
    const [search, setSearch] = useState(defaultFilters.search);
    const [type, setType] = useState(defaultFilters.type);

    const filteredContacts = useMemo(() => {
        const query = search.trim().toLowerCase();

        return items.filter((contact) => {
            const matchesType = type === '' || contact.type === type;
            const matchesQuery =
                query === '' ||
                contact.fullName.toLowerCase().includes(query) ||
                contact.email.toLowerCase().includes(query) ||
                contact.company.toLowerCase().includes(query);

            return matchesType && matchesQuery;
        });
    }, [items, search, type]);

    return (
        <>
            <Head title="Contacts" />

            <div className="flex min-h-0 flex-1 flex-col">
                <p className="mb-[14px] shrink-0 text-[13px] text-bion-text-muted">
                    Manage your clients, leads, and vendors in one place.
                </p>

                <div className="mb-[16px] flex shrink-0 flex-wrap items-center justify-between gap-[12px] max-[760px]:items-stretch">
                    <div className="flex flex-wrap items-center gap-[12px] max-[760px]:w-full">
                        <label className="flex w-[260px] max-w-full items-center gap-[8px] rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[7px] text-bion-text-muted max-[760px]:w-full">
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-search" />
                            </svg>
                            <input
                                type="text"
                                className="flex-1 border-none bg-transparent text-[13px] text-bion-text outline-none"
                                placeholder="Search contacts..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>

                        <select
                            className="min-w-[160px] rounded-[8px] border border-bion-border bg-bion-surface px-[12px] py-[7px] text-[13px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent max-[760px]:w-full"
                            value={type}
                            onChange={(event) =>
                                setType(event.target.value as ContactsIndexPageProps['defaultFilters']['type'])
                            }
                        >
                            <option value="">All Types</option>
                            <option value="client">Client</option>
                            <option value="lead">Lead</option>
                            <option value="vendor">Vendor</option>
                        </select>
                    </div>

                    <Link
                        href={currentTeam ? contactCreate(currentTeam.slug) : '/'}
                        className={cn(BTN_PRIMARY, 'max-[760px]:justify-center')}
                    >
                        <svg className={ICON_SM_CLS}>
                            <use href="#i-plus" />
                        </svg>
                        Add Contact
                    </Link>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-[5] bg-bion-surface">
                                <tr>
                                    <th className="border-b border-bion-border px-[20px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                        Contact
                                    </th>
                                    <th className="border-b border-bion-border px-[20px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                        Company
                                    </th>
                                    <th className="border-b border-bion-border px-[20px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em] max-[760px]:hidden">
                                        Phone
                                    </th>
                                    <th className="border-b border-bion-border px-[20px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                        Type
                                    </th>
                                    <th className="border-b border-bion-border px-[20px] py-[14px] text-left text-[11.5px] font-semibold text-bion-text-muted uppercase [letter-spacing:0.04em]">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="[&_tr:last-child_td]:border-b-0">
                                {filteredContacts.map((contact) => (
                                    <ContactTableRow
                                        key={contact.id}
                                        contact={contact}
                                        currentTeamSlug={currentTeam?.slug ?? ''}
                                    />
                                ))}
                            </tbody>
                        </table>

                        {filteredContacts.length === 0 ? (
                            <div className="flex min-h-[220px] items-center justify-center px-[20px] py-[40px] text-center text-[13px] text-bion-text-muted">
                                No contacts match your current search and filter.
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}

type ContactTableRowProps = {
    contact: ContactListItem;
    currentTeamSlug: string;
};

function ContactTableRow({ contact, currentTeamSlug }: ContactTableRowProps) {
    return (
        <tr className="cursor-pointer [transition:background_0.12s_ease] hover:bg-bion-surface-raised">
            <td className="border-b border-bion-border px-[20px] py-[14px] text-[13.5px]">
                <Link
                    href={contactShow({
                        current_team: currentTeamSlug,
                        contact: contact.id,
                    })}
                    className="flex items-center gap-[12px]"
                >
                    <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border border-bion-border bg-bion-surface-raised text-[12px] font-semibold text-bion-text">
                        {contact.initials}
                    </div>
                    <div>
                        <span className="mb-[2px] block font-semibold text-bion-text">
                            {contact.fullName}
                        </span>
                        <span className="text-[12.5px] text-bion-text-muted">
                            {contact.email}
                        </span>
                    </div>
                </Link>
            </td>
            <td className="border-b border-bion-border px-[20px] py-[14px] text-[13.5px] font-medium">
                {contact.company}
            </td>
            <td className="border-b border-bion-border px-[20px] py-[14px] text-[13px] font-mono text-bion-text-muted max-[760px]:hidden">
                {contact.phone}
            </td>
            <td className="border-b border-bion-border px-[20px] py-[14px] text-[13.5px]">
                <span className={toneClassMap[contact.typeTone]}>
                    <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[contact.typeTone])} />
                    {contact.typeLabel}
                </span>
            </td>
            <td className="border-b border-bion-border px-[20px] py-[14px] text-[13.5px]">
                <span className={toneClassMap[contact.statusTone]}>
                    <span className={cn('h-[6px] w-[6px] rounded-full', toneDotMap[contact.statusTone])} />
                    {contact.statusLabel}
                </span>
            </td>
        </tr>
    );
}

ContactsPage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Contacts',
            href: props.currentTeam ? contacts(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] pt-[20px] pb-[24px] max-[760px]:px-[16px] max-[760px]:pb-[40px]',
});
