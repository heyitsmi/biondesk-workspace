import BiondeskAppShell from '@/components/biondesk/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    mainClassName,
}: AppLayoutProps) {
    return (
        <BiondeskAppShell breadcrumbs={breadcrumbs} mainClassName={mainClassName}>
            {children}
        </BiondeskAppShell>
    );
}
