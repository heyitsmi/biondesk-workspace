import OpsShell from '@/components/biondesk/ops-shell';
import type { BreadcrumbItem } from '@/types';

export default function OpsLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return <OpsShell breadcrumbs={breadcrumbs}>{children}</OpsShell>;
}
