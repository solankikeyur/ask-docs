import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppVariant, BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
    sidebar,
    header,
    variant,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    header?: React.ReactNode;
    variant?: AppVariant | 'full';
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} sidebar={sidebar} header={header} variant={variant}>
            {children}
        </AppLayoutTemplate>
    );
}
