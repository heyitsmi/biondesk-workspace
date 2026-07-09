import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

const FIELD_LABEL = 'flex items-center justify-between text-[13px] font-semibold text-bion-text';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

const BTN =
    'inline-flex items-center gap-[7px] rounded-[8px] px-[16px] py-[9px] text-[13.5px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(BTN, 'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]');

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Security settings" />

            <div className="mb-[20px]">
                <h2 className="mb-[6px] text-[18px] font-semibold text-bion-text">Security &amp; Password</h2>
                <p className="text-[13.5px] text-bion-text-muted">
                    Manage your password and security settings to keep your account safe.
                </p>
            </div>

            <Form
                {...SecurityController.update.form()}
                options={{
                    preserveScroll: true,
                }}
                resetOnError={['password', 'password_confirmation', 'current_password']}
                resetOnSuccess
                onError={(errors) => {
                    if (errors.password) {
                        passwordInput.current?.focus();
                    }

                    if (errors.current_password) {
                        currentPasswordInput.current?.focus();
                    }
                }}
            >
                {({ errors, processing }) => (
                    <div className="overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface shadow-bion-raised">
                        <div className="flex flex-col gap-[24px] p-[24px]">
                            <div className="flex flex-col gap-[8px]">
                                <label className={FIELD_LABEL} htmlFor="current_password">
                                    Current Password
                                </label>
                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className={FIELD_INPUT}
                                    autoComplete="current-password"
                                    placeholder="Enter current password"
                                />
                                <InputError message={errors.current_password} />
                            </div>

                            <div className="flex gap-[20px] max-[760px]:flex-col max-[760px]:gap-[16px]">
                                <div className="flex flex-1 flex-col gap-[8px]">
                                    <label className={FIELD_LABEL} htmlFor="password">
                                        New Password
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className={FIELD_INPUT}
                                        autoComplete="new-password"
                                        placeholder="New password"
                                        passwordrules={props.passwordRules}
                                    />
                                    <p className="mt-[4px] text-[12.5px] text-bion-text-muted">
                                        Minimum 8 characters, include at least one number and special
                                        character.
                                    </p>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex flex-1 flex-col gap-[8px]">
                                    <label className={FIELD_LABEL} htmlFor="password_confirmation">
                                        Confirm New Password
                                    </label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className={FIELD_INPUT}
                                        autoComplete="new-password"
                                        placeholder="Confirm new password"
                                        passwordrules={props.passwordRules}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-[12px] border-t border-bion-border bg-bion-surface-raised px-[24px] py-[16px]">
                            <button
                                type="submit"
                                className={BTN_PRIMARY}
                                disabled={processing}
                                data-test="update-password-button"
                            >
                                Update password
                            </button>
                        </div>
                    </div>
                )}
            </Form>

            <h3 className="my-[24px] text-[15px] font-semibold text-bion-text">
                Two-Factor Authentication (2FA)
            </h3>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
