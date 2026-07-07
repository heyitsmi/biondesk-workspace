import BiondeskAppShell from '@/components/biondesk/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <BiondeskAppShell breadcrumbs={breadcrumbs}>
            {children}
        </BiondeskAppShell>
    );
}
