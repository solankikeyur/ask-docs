import { usePage } from '@inertiajs/react';
import { type ReactNode, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ThemeToggle } from '@/components/theme-toggle';

interface AdminLayoutProps {
    children: ReactNode;
    activePath?: string;
    fullWidth?: boolean;
}

export default function AdminLayout({ children, activePath, fullWidth = false }: AdminLayoutProps) {
    const { url } = usePage();
    const pathname = activePath ?? url;

    // Isolate AdminLayout perfectly from any layout shifts on the document root
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar activePath={pathname} />

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden min-h-0 w-full">
                {/* Top header */}
                <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant/15 px-6">
                    <div />
                    <ThemeToggle />
                </header>

                {/* Page content */}
                <main className={`flex-1 ${fullWidth ? 'flex flex-col min-h-0' : 'overflow-y-auto scrollbar-thin p-6 min-h-0 w-full'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
