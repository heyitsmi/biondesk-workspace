import { useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { store as storeContact } from '@/routes/contacts';

const BTN =
    'inline-flex items-center justify-center gap-[8px] rounded-[8px] px-[18px] py-[10px] text-[14px] font-semibold [transition:opacity_0.12s_ease,transform_0.1s_ease] active:scale-[0.97]';
const BTN_PRIMARY = cn(
    BTN,
    'bg-bion-accent text-bion-accent-text hover:opacity-[0.88]',
);
const BTN_GHOST = cn(
    BTN,
    'border border-bion-border bg-transparent text-bion-text hover:border-bion-text-muted hover:bg-bion-surface-raised',
);
const FIELD_LABEL = 'text-[13px] font-medium text-bion-text-muted';
const FIELD_INPUT =
    'w-full rounded-[8px] border border-bion-border bg-bion-bg px-[14px] py-[10px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease] focus:border-bion-accent';

type QuickAddContactDialogProps = {
    currentTeamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type QuickAddContactFormValues = {
    quick_add: boolean;
    type: 'client';
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string;
    location: string;
};

const defaults: QuickAddContactFormValues = {
    quick_add: true,
    type: 'client',
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    location: '',
};

export function QuickAddContactDialog({
    currentTeamSlug,
    open,
    onOpenChange,
}: QuickAddContactDialogProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<QuickAddContactFormValues>(defaults);

    const handleOpenChange = (nextOpen: boolean): void => {
        if (!processing && !nextOpen) {
            reset();
            clearErrors();
        }

        onOpenChange(nextOpen);
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        post(storeContact(currentTeamSlug).url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="border-bion-border bg-bion-surface text-bion-text sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Quick Add Client</DialogTitle>
                    <DialogDescription className="text-bion-text-muted">
                        Create a client without leaving this opportunity form.
                        The new client will be selected automatically after
                        save.
                    </DialogDescription>
                </DialogHeader>

                <form className="grid gap-[16px]" onSubmit={submit}>
                    <div className="grid grid-cols-2 gap-[16px] max-[640px]:grid-cols-1">
                        <Field label="First Name *" error={errors.firstName}>
                            <input
                                type="text"
                                className={FIELD_INPUT}
                                placeholder="Jane"
                                value={data.firstName}
                                onChange={(event) =>
                                    setData('firstName', event.target.value)
                                }
                                required
                            />
                        </Field>

                        <Field label="Last Name" error={errors.lastName}>
                            <input
                                type="text"
                                className={FIELD_INPUT}
                                placeholder="Doe"
                                value={data.lastName}
                                onChange={(event) =>
                                    setData('lastName', event.target.value)
                                }
                            />
                        </Field>

                        <Field label="Company Name" error={errors.company}>
                            <input
                                type="text"
                                className={FIELD_INPUT}
                                placeholder="Acme Corp"
                                value={data.company}
                                onChange={(event) =>
                                    setData('company', event.target.value)
                                }
                            />
                        </Field>

                        <Field label="Email Address" error={errors.email}>
                            <input
                                type="email"
                                className={FIELD_INPUT}
                                placeholder="jane@acme.test"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                            />
                        </Field>

                        <Field label="Phone Number" error={errors.phone}>
                            <input
                                type="text"
                                className={FIELD_INPUT}
                                placeholder="+62 812 3456 7890"
                                value={data.phone}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                            />
                        </Field>

                        <Field label="Location Client" error={errors.location}>
                            <input
                                type="text"
                                className={FIELD_INPUT}
                                placeholder="Jakarta, Indonesia"
                                value={data.location}
                                onChange={(event) =>
                                    setData('location', event.target.value)
                                }
                            />
                        </Field>
                    </div>

                    <DialogFooter className="mt-[8px] gap-[12px]">
                        <button
                            type="button"
                            className={BTN_GHOST}
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={BTN_PRIMARY}
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save Client'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type FieldProps = {
    label: string;
    error?: string;
    children: ReactNode;
};

function Field({ label, error, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-[8px]">
            <label className={FIELD_LABEL}>{label}</label>
            {children}
            {error ? (
                <span className="text-[12px] text-bion-danger">{error}</span>
            ) : null}
        </div>
    );
}
