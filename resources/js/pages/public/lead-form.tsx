import { Head } from '@inertiajs/react';
import { useState  } from 'react';
import type {FormEvent} from 'react';
import { cn } from '@/lib/utils';
import type { PublicLeadFormPageProps } from '@/types';

const FIELD_LABEL = 'mb-[8px] block text-[12.5px] font-semibold text-bion-text';
const FIELD_INPUT =
    'w-full rounded-[10px] border border-bion-border bg-bion-bg px-[14px] py-[12px] text-[14px] text-bion-text outline-none [transition:border-color_0.15s_ease,box-shadow_0.15s_ease] focus:border-bion-accent focus:shadow-[0_0_0_3px_var(--bion-accent-soft)]';

const SERVICE_OPTIONS = [
    { value: 'branding', label: 'Brand Identity' },
    { value: 'web', label: 'Web Design' },
    { value: 'app', label: 'App Development' },
    { value: 'marketing', label: 'Marketing Strategy' },
];

export default function PublicLeadFormPage({
    team,
    hero,
}: PublicLeadFormPageProps) {
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const toggleService = (value: string): void => {
        setSelectedServices((current) =>
            current.includes(value)
                ? current.filter((service) => service !== value)
                : [...current, value],
        );
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setSubmitted(true);
    };

    const initials = team.name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <>
            <Head title={`${team.name} lead form`} />

            <div className="flex min-h-screen flex-col items-center justify-center bg-bion-bg px-[20px] py-[40px] font-display text-[14px] leading-normal text-bion-text antialiased">
                <div className="w-full max-w-[560px]">
                    <div className="overflow-hidden rounded-[16px] border border-bion-border bg-bion-surface shadow-bion-raised">
                        <div className="border-b border-bion-border bg-bion-surface-raised px-[40px] pt-[40px] pb-[30px] text-center max-[600px]:px-[24px] max-[600px]:pt-[32px] max-[600px]:pb-[24px]">
                            <div className="mx-auto mb-[20px] flex h-[64px] w-[64px] items-center justify-center rounded-[16px] bg-bion-accent text-[24px] font-bold text-bion-accent-text">
                                {initials}
                            </div>
                            <h1 className="mb-[8px] text-[24px] font-bold">
                                Work with {team.name}
                            </h1>
                            <p className="text-[14.5px] text-bion-text-muted">
                                {hero.description}
                            </p>
                        </div>

                        <div className="px-[40px] pt-[32px] pb-[40px] max-[600px]:px-[24px] max-[600px]:pt-[24px] max-[600px]:pb-[32px]">
                            {submitted ? (
                                <div className="flex flex-col items-center gap-[12px] py-[24px] text-center">
                                    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-bion-success-soft text-bion-success">
                                        <svg
                                            className="h-[26px] w-[26px] fill-none stroke-current [stroke-width:2] [stroke-linecap:round] [stroke-linejoin:round]"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M5 12l5 5L20 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-[17px] font-semibold">
                                        Thanks, your inquiry is in!
                                    </h2>
                                    <p className="max-w-[360px] text-[13.5px] text-bion-text-muted">
                                        {team.name} will get back to you within 24
                                        hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-[24px] flex gap-[16px] max-[600px]:flex-col max-[600px]:gap-[24px]">
                                        <div className="flex-1">
                                            <label className={FIELD_LABEL}>
                                                First Name{' '}
                                                <span className="text-bion-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                className={FIELD_INPUT}
                                                placeholder="Jane"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className={FIELD_LABEL}>
                                                Last Name{' '}
                                                <span className="text-bion-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                className={FIELD_INPUT}
                                                placeholder="Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-[24px]">
                                        <label className={FIELD_LABEL}>
                                            Email Address{' '}
                                            <span className="text-bion-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            className={FIELD_INPUT}
                                            placeholder="jane@company.com"
                                            required
                                        />
                                    </div>

                                    <div className="mb-[24px]">
                                        <label className={FIELD_LABEL}>
                                            Company / Organization
                                        </label>
                                        <input
                                            type="text"
                                            className={FIELD_INPUT}
                                            placeholder="Acme Corp"
                                        />
                                    </div>

                                    <div className="mt-[32px] border-t border-dashed border-bion-border pt-[24px]">
                                        <label className={FIELD_LABEL}>
                                            What do you need help with?{' '}
                                            <span className="text-bion-danger">
                                                *
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-[12px] max-[600px]:grid-cols-1">
                                            {SERVICE_OPTIONS.map((service) => {
                                                const isSelected =
                                                    selectedServices.includes(
                                                        service.value,
                                                    );

                                                return (
                                                    <label
                                                        key={service.value}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-[10px] rounded-[10px] border border-bion-border bg-bion-bg px-[14px] py-[12px] [transition:border-color_0.15s_ease] hover:border-bion-text-muted',
                                                            isSelected &&
                                                                'border-bion-accent! bg-bion-accent-soft!',
                                                        )}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-[16px] w-[16px] cursor-pointer accent-bion-accent"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                toggleService(
                                                                    service.value,
                                                                )
                                                            }
                                                        />
                                                        <span className="text-[13.5px] font-medium">
                                                            {service.label}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mt-[24px] mb-[24px]">
                                        <label className={FIELD_LABEL}>
                                            Estimated Budget
                                        </label>
                                        <select
                                            className={FIELD_INPUT}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Select a range...
                                            </option>
                                            <option value="under5k">
                                                Under $5,000
                                            </option>
                                            <option value="5k_10k">
                                                $5,000 - $10,000
                                            </option>
                                            <option value="10k_25k">
                                                $10,000 - $25,000
                                            </option>
                                            <option value="over25k">
                                                $25,000+
                                            </option>
                                        </select>
                                    </div>

                                    <div className="mb-[24px]">
                                        <label className={FIELD_LABEL}>
                                            Project Details{' '}
                                            <span className="text-bion-danger">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            className={cn(
                                                FIELD_INPUT,
                                                'min-h-[100px] resize-y',
                                            )}
                                            placeholder="Tell us about your goals, timeline, and any specific requirements..."
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-[10px] inline-flex w-full items-center justify-center gap-[7px] rounded-[8px] bg-bion-accent px-[20px] py-[11px] text-[14px] font-semibold text-bion-accent-text [transition:opacity_0.12s_ease,transform_0.1s_ease] hover:opacity-[0.88] active:scale-[0.97]"
                                    >
                                        Send Inquiry
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="mt-[24px] text-center text-[12px] text-bion-text-muted">
                        Powered by{' '}
                        <a
                            href="/"
                            className="font-medium text-bion-text underline decoration-bion-border underline-offset-[3px]"
                        >
                            Biondesk
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
