import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    sidebar,
    header,
    variant,
}: AppLayoutProps) {
    return (
        <AppShell variant={variant === 'full' ? 'sidebar' : variant}>
            <AppSidebar variant={variant} />
            {sidebar}
            <AppContent variant={variant} className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} header={header} />
                {children}
            </AppContent>
        </AppShell>
    );
}
