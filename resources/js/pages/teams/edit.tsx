import { Form, Head, router } from '@inertiajs/react';
import { ChevronDown, Mail, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import CancelInvitationModal from '@/components/cancel-invitation-modal';
import DeleteTeamModal from '@/components/delete-team-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import InviteMemberModal from '@/components/invite-member-modal';
import RemoveMemberModal from '@/components/remove-member-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import { edit, index, update } from '@/routes/teams';
import { update as updateMember } from '@/routes/teams/members';
import type {
    RoleOption,
    Team,
    TeamInvitation,
    TeamMember,
    TeamPermissions,
} from '@/types';

type Props = {
    team: Team;
    members: TeamMember[];
    invitations: TeamInvitation[];
    permissions: TeamPermissions;
    availableRoles: RoleOption[];
};

export default function TeamEdit({
    team,
    members,
    invitations,
    permissions,
    availableRoles,
}: Props) {
    const getInitials = useInitials();

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(
        null,
    );
    const [cancelInvitationDialogOpen, setCancelInvitationDialogOpen] =
        useState(false);
    const [invitationToCancel, setInvitationToCancel] =
        useState<TeamInvitation | null>(null);

    const pageTitle = useMemo(
        () =>
            permissions.canUpdateTeam
                ? `Edit ${team.name}`
                : `View ${team.name}`,
        [permissions.canUpdateTeam, team.name],
    );

    const updateMemberRole = (member: TeamMember, newRole: string) => {
        router.visit(updateMember([team.slug, member.id]), {
            data: { role: newRole },
            preserveScroll: true,
        });
    };

    const confirmRemoveMember = (member: TeamMember) => {
        setMemberToRemove(member);
        setRemoveMemberDialogOpen(true);
    };

    const confirmCancelInvitation = (invitation: TeamInvitation) => {
        setInvitationToCancel(invitation);
        setCancelInvitationDialogOpen(true);
    };

    return (
        <>
            <Head title={pageTitle} />

            <h1 className="sr-only">{pageTitle}</h1>

            <div className="flex flex-col space-y-10">
                <div>
                    <div className="mb-[20px]">
                        <h2 className="mb-[6px] text-[18px] font-semibold text-bion-text">Workspace info</h2>
                        <p className="text-[13.5px] text-bion-text-muted">
                            Manage your team&apos;s workspace details and branding.
                        </p>
                    </div>

                    {permissions.canUpdateTeam ? (
                        <Form {...update.form(team.slug)}>
                            {({ errors, processing }) => (
                                <div className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface shadow-bion-raised">
                                    <div className="flex flex-col gap-[24px] p-[24px]">
                                        <div className="flex flex-col gap-[8px]">
                                            <label
                                                htmlFor="name"
                                                className="flex items-center justify-between text-[13px] font-semibold text-bion-text"
                                            >
                                                Workspace Name
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                data-test="team-name-input"
                                                defaultValue={team.name}
                                                required
                                                className="w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent"
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-[12px] border-t border-bion-border bg-bion-surface-raised px-[24px] py-[16px]">
                                        <button
                                            type="submit"
                                            data-test="team-save-button"
                                            disabled={processing}
                                            className="inline-flex items-center gap-[7px] rounded-[8px] bg-bion-accent px-[16px] py-[9px] text-[13.5px] font-semibold text-bion-accent-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:opacity-[0.88] active:scale-[0.97]"
                                        >
                                            Save changes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Form>
                    ) : (
                        <p className="text-[15px] font-medium text-bion-text">{team.name}</p>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Team members"
                            description={
                                permissions.canCreateInvitation
                                    ? 'Manage who belongs to this team'
                                    : ''
                            }
                        />

                        {permissions.canCreateInvitation ? (
                            <Button
                                data-test="invite-member-button"
                                onClick={() => setInviteDialogOpen(true)}
                            >
                                <UserPlus /> Invite member
                            </Button>
                        ) : null}
                    </div>

                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                data-test="member-row"
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        {member.avatar ? (
                                            <AvatarImage
                                                src={member.avatar}
                                                alt={member.name}
                                            />
                                        ) : null}
                                        <AvatarFallback>
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                            {member.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {member.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {member.role !== 'owner' &&
                                    permissions.canUpdateMember ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    data-test="member-role-trigger"
                                                >
                                                    {member.role_label}
                                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {availableRoles.map((role) => (
                                                    <DropdownMenuItem
                                                        key={role.value}
                                                        data-test="member-role-option"
                                                        onSelect={() =>
                                                            updateMemberRole(
                                                                member,
                                                                role.value,
                                                            )
                                                        }
                                                    >
                                                        {role.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Badge variant="secondary">
                                            {member.role_label}
                                        </Badge>
                                    )}

                                    {member.role !== 'owner' &&
                                    permissions.canRemoveMember ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="member-remove-button"
                                                        onClick={() =>
                                                            confirmRemoveMember(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Remove member</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {invitations.length > 0 ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Pending invitations"
                            description="Invitations that haven't been accepted yet"
                        />

                        <div className="space-y-3">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.code}
                                    data-test="invitation-row"
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {invitation.email}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {invitation.role_label}
                                            </div>
                                        </div>
                                    </div>

                                    {permissions.canCancelInvitation ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="invitation-cancel-button"
                                                        onClick={() =>
                                                            confirmCancelInvitation(
                                                                invitation,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Cancel invitation</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {permissions.canDeleteTeam && !team.isPersonal ? (
                    <div>
                        <h3 className="mb-[12px] text-[15px] font-semibold text-bion-danger">Danger Zone</h3>
                        <div className="overflow-hidden rounded-[12px] border border-bion-danger-soft bg-bion-surface shadow-bion-raised">
                            <div className="flex items-center justify-between gap-[16px] p-[24px]">
                                <div className="flex flex-col gap-[4px]">
                                    <span className="text-[13.5px] font-medium text-bion-danger">
                                        Delete Workspace
                                    </span>
                                    <span className="text-[12.5px] text-bion-text-muted">
                                        Permanently delete this workspace and all its data. This action
                                        cannot be undone.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    data-test="delete-team-button"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    className="inline-flex shrink-0 items-center gap-[7px] rounded-[8px] bg-bion-danger-soft px-[16px] py-[9px] text-[13.5px] font-semibold text-bion-danger [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:bg-bion-danger hover:text-white active:scale-[0.97]"
                                >
                                    Delete workspace
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {permissions.canCreateInvitation ? (
                <InviteMemberModal
                    team={team}
                    availableRoles={availableRoles}
                    open={inviteDialogOpen}
                    onOpenChange={setInviteDialogOpen}
                />
            ) : null}

            <RemoveMemberModal
                team={team}
                member={memberToRemove}
                open={removeMemberDialogOpen}
                onOpenChange={setRemoveMemberDialogOpen}
            />

            <CancelInvitationModal
                team={team}
                invitation={invitationToCancel}
                open={cancelInvitationDialogOpen}
                onOpenChange={setCancelInvitationDialogOpen}
            />

            {permissions.canDeleteTeam && !team.isPersonal ? (
                <DeleteTeamModal
                    team={team}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
            ) : null}
        </>
    );
}

TeamEdit.layout = (props: { team: { name: string; slug: string } }) => ({
    breadcrumbs: [
        {
            title: 'Teams',
            href: index(),
        },
        {
            title: props.team.name,
            href: edit(props.team.slug),
        },
    ],
});
