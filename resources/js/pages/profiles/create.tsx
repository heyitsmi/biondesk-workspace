import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as profileCreate, index as profiles } from '@/routes/profiles';
import type { ProfileCategory, ProfileCreatePageProps } from '@/types';

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
    'flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[4px] text-bion-text-muted hover:bg-bion-surface-raised hover:text-bion-text';

export default function ProfileCreatePage({ defaults }: ProfileCreatePageProps) {
    const { currentTeam } = usePage().props;
    const [title, setTitle] = useState(defaults.title);
    const [category, setCategory] = useState<'' | ProfileCategory>(defaults.category);
    const [shortDescription, setShortDescription] = useState(defaults.shortDescription);
    const [body, setBody] = useState(defaults.body);

    const backToProfiles = (): void => {
        if (!currentTeam) {
            return;
        }

        router.visit(profiles(currentTeam.slug));
    };

    return (
        <>
            <Head title="Create New Profile" />

            <div className="flex flex-1 justify-center overflow-y-auto">
                <div className="w-full max-w-[800px] pb-[80px]">
                    <div className="mb-[24px]">
                        <h1 className="mb-[6px] text-[24px] font-semibold text-bion-text">Create New Profile</h1>
                        <p className="text-[14px] text-bion-text-muted">
                            Add a reusable profile or asset block for your documents.
                        </p>
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
                                            placeholder="e.g. Acme Corp Company Profile"
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
                                            <option value="" disabled>
                                                Select category...
                                            </option>
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
                                            placeholder="Brief note about this profile"
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
                                    <div className="flex cursor-pointer flex-col items-center justify-center gap-[12px] rounded-[8px] border-2 border-dashed border-bion-border bg-bion-bg p-[32px] text-center [transition:all_0.15s_ease] hover:border-bion-accent hover:bg-bion-surface-raised">
                                        <svg className="h-[32px] w-[32px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round] text-bion-text-muted">
                                            <use href="#i-upload" />
                                        </svg>
                                        <div className="text-[14px] font-medium text-bion-text">
                                            Click to upload or drag and drop
                                        </div>
                                        <div className="text-[12px] text-bion-text-muted">
                                            SVG, PNG, JPG or GIF (max. 5MB)
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

                        <div className="mt-[32px] flex justify-end gap-[12px] border-t border-bion-border pt-[24px]">
                            <button type="button" className={BTN_GHOST} onClick={backToProfiles}>
                                Cancel
                            </button>
                            <button type="submit" className={BTN_PRIMARY}>
                                Save Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

ProfileCreatePage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
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
            title: 'Create New Profile',
            href: props.currentTeam ? profileCreate(props.currentTeam.slug) : '/',
        },
    ],
    mainClassName:
        'flex min-h-0 flex-1 flex-col overflow-hidden px-[32px] py-[24px] max-[760px]:px-[16px]',
});
