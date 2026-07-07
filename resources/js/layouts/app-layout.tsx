import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    mainClassName,
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    mainClassName?: string;
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} mainClassName={mainClassName}>
            {children}
        </AppLayoutTemplate>
    );
}
