import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { destroy as destroyProfile, duplicate as duplicateProfile, edit as profileEdit, index as profiles, update as updateProfile } from '@/routes/profiles';
import type { ProfileCategory, ProfileEditPageProps } from '@/types';

const ICON_SM_CLS =
    'h-[15px] w-[15px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]';

const BTN =
    'inline-flex items-center justify-center gap-[8px] rounded-[8px] px-[18px] py-[10px] text-[14px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88] disabled:cursor-not-allowed disabled:opacity-[0.6]');
const BTN_GHOST = cn(BTN, 'border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted hover:bg-bion-surface-raised');
const BTN_DANGER = cn(BTN, 'border-none bg-transparent text-bion-danger hover:bg-bion-danger-soft');
const BTN_SM =
    'inline-flex items-center gap-[8px] rounded-[8px] border border-bion-border bg-transparent px-[12px] py-[6px] text-[12.5px] font-semibold text-bion-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:border-bion-text-muted hover:bg-bion-surface-raised active:scale-[0.97]';

const FIELD_LABEL = 'text-[13px] font-medium text-bion-text-muted';
const FIELD_ERROR = 'text-[12.5px] text-bion-danger';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

type ProfileEditFormValues = {
    title: string;
    category: '' | ProfileCategory;
    short_description: string;
    body: string;
    image: File | null;
};

export default function ProfileEditPage({ profile }: ProfileEditPageProps) {
    const { currentTeam } = usePage().props;
    const [imagePreview, setImagePreview] = useState<string | null>(profile.imageUrl);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors } = useForm<ProfileEditFormValues>({
        title: profile.title,
        category: profile.category,
        short_description: profile.shortDescription,
        body: profile.body,
        image: null,
    });

    const pickImage = (): void => {
        imageInputRef.current?.click();
    };

    const onImageSelected = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0] ?? null;
        setData('image', file);
        setImagePreview(file ? URL.createObjectURL(file) : profile.imageUrl);
    };

    const submit = (event: React.FormEvent): void => {
        event.preventDefault();

        if (!currentTeam) {
            return;
        }

        put(updateProfile({ current_team: currentTeam.slug, profile: profile.id }).url);
    };

    const runDuplicate = (): void => {
        if (!currentTeam) {
            return;
        }

        router.post(duplicateProfile({ current_team: currentTeam.slug, profile: profile.id }).url);
    };

    const runDelete = (): void => {
        if (!currentTeam) {
            return;
        }

        router.delete(destroyProfile({ current_team: currentTeam.slug, profile: profile.id }).url);
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
                        <button type="button" className={BTN_SM} onClick={runDuplicate}>
                            <svg className={ICON_SM_CLS}>
                                <use href="#i-copy" />
                            </svg>
                            Duplicate Profile
                        </button>
                    </div>

                    <form onSubmit={submit}>
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
                                            value={data.title}
                                            onChange={(event) => setData('title', event.target.value)}
                                            required
                                        />
                                        {errors.title ? <span className={FIELD_ERROR}>{errors.title}</span> : null}
                                    </div>
                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>
                                            Category <span className="text-bion-danger">*</span>
                                        </label>
                                        <select
                                            className={FIELD_INPUT}
                                            value={data.category}
                                            onChange={(event) => setData('category', event.target.value as '' | ProfileCategory)}
                                            required
                                        >
                                            <option value="company">Company Info</option>
                                            <option value="team">Team Bio</option>
                                            <option value="case">Case Study</option>
                                            <option value="asset">Brand Asset</option>
                                        </select>
                                        {errors.category ? <span className={FIELD_ERROR}>{errors.category}</span> : null}
                                    </div>
                                    <div className="flex flex-col gap-[8px]">
                                        <label className={FIELD_LABEL}>Short Description (Internal)</label>
                                        <input
                                            type="text"
                                            className={FIELD_INPUT}
                                            value={data.short_description}
                                            onChange={(event) => setData('short_description', event.target.value)}
                                        />
                                        {errors.short_description ? (
                                            <span className={FIELD_ERROR}>{errors.short_description}</span>
                                        ) : null}
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
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={onImageSelected}
                                    />
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={pickImage}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                pickImage();
                                            }
                                        }}
                                        className="relative flex cursor-pointer flex-col items-center justify-center gap-[12px] overflow-hidden rounded-[8px] border-2 border-dashed border-bion-border bg-bion-bg p-[32px] text-center [transition:all_0.15s_ease] hover:border-bion-accent hover:bg-bion-surface-raised"
                                    >
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt=""
                                                className="absolute inset-0 z-[1] h-full w-full object-cover opacity-40"
                                            />
                                        ) : null}
                                        <svg className="z-[2] h-[32px] w-[32px] shrink-0 fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round] text-bion-text-muted">
                                            <use href="#i-upload" />
                                        </svg>
                                        <div className="z-[2] text-[14px] font-medium text-bion-text">
                                            {imagePreview ? 'Change image' : 'Click to upload or drag and drop'}
                                        </div>
                                        <div className="z-[2] text-[12px] text-bion-text-muted">
                                            {imagePreview ? 'Click or drag new image to replace' : 'SVG, PNG, JPG or GIF (max. 5MB)'}
                                        </div>
                                    </div>
                                    {errors.image ? <span className={FIELD_ERROR}>{errors.image}</span> : null}
                                </div>

                                <div className="flex flex-col gap-[8px]">
                                    <label className={FIELD_LABEL}>Profile Body</label>
                                    <textarea
                                        className="min-h-[200px] w-full resize-y rounded-[8px] border border-bion-border bg-bion-bg p-[16px] text-[14px] leading-[1.6] text-bion-text outline-none placeholder:text-bion-text-muted focus:border-bion-accent"
                                        placeholder="Start typing your profile content here..."
                                        value={data.body}
                                        onChange={(event) => setData('body', event.target.value)}
                                    />
                                    {errors.body ? <span className={FIELD_ERROR}>{errors.body}</span> : null}
                                </div>
                            </div>
                        </div>

                        <div className="mt-[32px] flex items-center justify-between gap-[12px] border-t border-bion-border pt-[24px]">
                            <button type="button" className={BTN_DANGER} onClick={runDelete}>
                                <svg className={ICON_SM_CLS}>
                                    <use href="#i-trash" />
                                </svg>
                                Delete Profile
                            </button>
                            <div className="flex gap-[12px]">
                                <Link href={currentTeam ? profiles(currentTeam.slug) : '/'} className={BTN_GHOST}>
                                    Cancel
                                </Link>
                                <button type="submit" className={BTN_PRIMARY} disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
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
