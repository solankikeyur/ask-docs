import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { usePage } from '@inertiajs/react';

interface AdminLayoutProps {
    children: ReactNode;
    activePath?: string;
}

export default function AdminLayout({ children, activePath }: AdminLayoutProps) {
    const { url } = usePage();
    const pathname = activePath ?? url;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar activePath={pathname} />

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top header */}
                <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant/15 px-6">
                    <div />
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs text-on-surface-variant">System Nominal</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {children}
                </main>
            </div>
        </div>
    );
}
