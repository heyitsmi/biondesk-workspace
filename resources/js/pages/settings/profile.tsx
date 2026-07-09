import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

const FIELD_LABEL = 'flex items-center justify-between text-[13px] font-semibold text-bion-text';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Profile settings" />

            <div className="mb-[20px]">
                <h2 className="mb-[6px] text-[18px] font-semibold text-bion-text">Profile details</h2>
                <p className="text-[13.5px] text-bion-text-muted">
                    Manage your personal information and preferences.
                </p>
            </div>

            <Form
                {...ProfileController.update.form()}
                options={{
                    preserveScroll: true,
                }}
            >
                {({ processing, errors }) => (
                    <div className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface shadow-bion-raised">
                        <div className="flex flex-col gap-[24px] p-[24px]">
                            <div className="flex flex-col gap-[8px]">
                                <label className={FIELD_LABEL}>Profile Picture</label>
                                <div className="flex items-center gap-[16px]">
                                    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-bion-accent text-[20px] font-bold text-bion-accent-text">
                                        {auth.user.name
                                            .split(' ')
                                            .map((word) => word.charAt(0))
                                            .join('')
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-[8px]">
                                <label className={FIELD_LABEL} htmlFor="name">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    className={FIELD_INPUT}
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="flex flex-col gap-[8px]">
                                <label className={FIELD_LABEL} htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className={FIELD_INPUT}
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />
                                <InputError message={errors.email} />

                                {mustVerifyEmail && auth.user.email_verified_at === null ? (
                                    <p className="mt-[4px] text-[12.5px] text-bion-text-muted">
                                        Your email address is unverified.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="font-medium text-bion-accent underline underline-offset-2"
                                        >
                                            Click here to re-send the verification email.
                                        </Link>
                                        {status === 'verification-link-sent' ? (
                                            <span className="mt-[4px] block font-medium text-bion-success">
                                                A new verification link has been sent to your email address.
                                            </span>
                                        ) : null}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-[12px] border-t border-bion-border bg-bion-surface-raised px-[24px] py-[16px]">
                            <button
                                type="submit"
                                className={BTN_PRIMARY}
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                Save changes
                            </button>
                        </div>
                    </div>
                )}
            </Form>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
