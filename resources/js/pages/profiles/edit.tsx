import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as profileEdit, index as profiles } from '@/routes/profiles';
import type { ProfileCategory, ProfileEditPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center justify-center gap-[8px] rounded-[8px] px-[18px] py-[10px] text-[14px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted hover:bg-bion-surface-raised');
const BTN_DANGER = cn(BTN, 'border-none bg-transparent text-bion-danger hover:bg-bion-danger-soft');
const BTN_SM =
    'inline-flex items-center gap-[8px] rounded-[8px] border border-bion-border bg-transparent px-[12px] py-[6px] text-[12.5px] font-semibold text-bion-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:border-bion-text-muted hover:bg-bion-surface-raised active:scale-[0.97]';

const FIELD_LABEL = 'text-[13px] font-medium text-bion-text-muted';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

const TOOLBAR_BTN =
    'flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text';

export default function ProfileEditPage({ profile }: ProfileEditPageProps) {
    const { currentTeam } = usePage().props;
    const [title, setTitle] = useState(profile.title);
    const [category, setCategory] = useState<'' | ProfileCategory>(profile.category);
    const [shortDescription, setShortDescription] = useState(profile.shortDescription);
    const [body, setBody] = useState(profile.body);

    const backToProfiles = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(profiles(currentTeam.slug));
    };

    return (
        <>
            <Head title={`Edit ${profile.title}`} />

            <div className="flex flex-1 justify-center overflow-y-auto">
                <div className="w-full max-w-[800px] pb-[80px]">
                    <div className="mb-[24px] flex items-end justify-between gap-[16px] max-[760px]:flex-col max-[760px]:items-start">
                        <div>
                            <h1 className="mb-[6px] text-[24px] font-semibold text-bion-text">Edit Profile</h1>
                            <p className="text-[14px] text-bion-text-muted">
                                Update this reusable profile or asset block.
                            </p>
                        </div>
                        <button type="button" className={BTN_SM} onClick={backToProfiles}>
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-copy" />
                            </svg>
                            Duplicate Profile
                        </button>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            backToProfiles();
                        }}
                    >
                        <div className="mb-[24px] overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                            <div className="flex items-center gap-[10px] border-b border-bion-border px-[20px] py-[16px]">
                                <svg className="h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round] text-bion-text-muted">
                                    <use href="#i-layers" />
                                </svg>
                                <div className="text-[15px] font-semibold text-bion-text">Profile Settings</div>
                            </div>
                            <div className="p-[20px]">
                                <div className="mb-[20px] grid grid-cols-2 gap-[20px] max-[760px]:grid-cols-1">
                                    <div className="col-span-full flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>
                                            Profile Title <span className="text-bion-danger">*</span>
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
                                            Category <span className="text-bion-danger">*</span>
                                        </label>
                                        <select
                                            className={FIELD_INPUT}
                                            value={category}
                                            onChange={(event) => setCategory(event.target.value as '' | ProfileCategory)}
                                            required
                                        >
                                            <option value="company">Company Info</option>
                                            <option value="team">Team Bio</option>
                                            <option value="case">Case Study</option>
                                            <option value="asset">Brand Asset</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Short Description (Internal)</label>
                                        <input
                                            type="text"
                                            className={FIELD_INPUT}
                                            value={shortDescription}
                                            onChange={(event) => setShortDescription(event.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-[24px] overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                            <div className="flex items-center gap-[10px] border-b border-bion-border px-[20px] py-[16px]">
                                <svg className="h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round] text-bion-text-muted">
                                    <use href="#i-file" />
                                </svg>
                                <div className="text-[15px] font-semibold text-bion-text">Content</div>
                            </div>
                            <div className="p-[20px]">
                                <div className="mb-[24px] flex flex-col gap-[8px]">
                                    <label className={FIELD_LABEL}>Featured Image (Optional)</label>
                                    <div className="relative flex cursor-pointer flex-col items-center justify-center gap-[12px] overflow-hidden rounded-[8px] border-2 border-dashed border-bion-border bg-bion-bg p-[32px] text-center [transition:all_0.15s_ease] hover:border-bion-accent hover:bg-bion-surface-raised">
                                        {profile.hasImage ? (
                                            <div className="absolute inset-0 z-[1] bg-bion-surface-raised" />
                                        ) : null}
                                        <svg className="z-[2] h-[32px] w-[32px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round] text-bion-text-muted">
                                            <use href="#i-upload" />
                                        </svg>
                                        <div className="z-[2] text-[14px] font-medium text-bion-text">
                                            {profile.hasImage ? 'Change Image' : 'Click to upload or drag and drop'}
                                        </div>
                                        <div className="z-[2] text-[12px] text-bion-text-muted">
                                            {profile.hasImage
                                                ? 'Click or drag new image to replace'
                                                : 'SVG, PNG, JPG or GIF (max. 5MB)'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-[8px]">
                                    <label className={FIELD_LABEL}>Profile Body</label>
                                    <div className="overflow-hidden rounded-[8px] border border-bion-border bg-bion-bg">
                                        <div className="flex gap-[4px] border-b border-bion-border bg-bion-surface px-[12px] py-[8px]">
                                            <button type="button" className={cn(TOOLBAR_BTN, 'bg-bion-surface-raised text-bion-text')} title="Bold">
                                                <svg className={ICON_SM_CLS}>
                                                    <use href="#i-bold" />
                                                </svg>
                                            </button>
                                            <button type="button" className={TOOLBAR_BTN} title="Italic">
                                                <svg className={ICON_SM_CLS}>
                                                    <use href="#i-italic" />
                                                </svg>
                                            </button>
                                            <div className="mx-[4px] w-px bg-bion-border" />
                                            <button type="button" className={TOOLBAR_BTN} title="List">
                                                <svg className={ICON_SM_CLS}>
                                                    <use href="#i-list" />
                                                </svg>
                                            </button>
                                            <button type="button" className={TOOLBAR_BTN} title="Link">
                                                <svg className={ICON_SM_CLS}>
                                                    <use href="#i-link" />
                                                </svg>
                                            </button>
                                        </div>
                                        <textarea
                                            className="min-h-[200px] w-full resize-y p-[16px] text-[14px] leading-[1.6] text-bion-text outline-none placeholder:text-bion-text-muted"
                                            placeholder="Start typing your profile content here..."
                                            value={body}
                                            onChange={(event) => setBody(event.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-[32px] flex items-center justify-between gap-[12px] border-t border-bion-border pt-[24px]">
                            <button type="button" className={BTN_DANGER} onClick={backToProfiles}>
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-trash" />
                                </svg>
                                Delete Profile
                            </button>
                            <div className="flex gap-[12px]">
                                <button type="button" className={BTN_GHOST} onClick={backToProfiles}>
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

ProfileEditPage.layout = (props: { currentTeam?: { slug: string } | null; profile?: { id: number; title: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
        {
            title: 'Profile Library',
            href: props.currentTeam ? profiles(props.currentTeam.slug) : '/',
        },
        {
            title: props.profile?.title ?? 'Edit Profile',
            href:
                props.currentTeam && props.profile
                    ? profileEdit({ current_team: props.currentTeam.slug, profile: props.profile.id })
                    : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] py-[24px] max-[760px]:px-[16px]',
});
