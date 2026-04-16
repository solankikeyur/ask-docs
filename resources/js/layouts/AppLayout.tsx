import { usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
    children: ReactNode;
    activePath?: string;
    fullWidth?: boolean;
}

export default function AppLayout({ children, activePath, fullWidth = false }: AppLayoutProps) {
    const { url } = usePage();
    const pathname = activePath ?? url;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Isolate AdminLayout perfectly from any layout shifts on the document root
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Close mobile menu on navigate
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-background">
            <div className="hidden md:flex h-full">
                <Sidebar activePath={pathname} />
            </div>

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden min-h-0 w-full">
                {/* Top header */}
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-outline-variant/15 px-4 md:px-6 bg-surface/50 backdrop-blur-sm z-10 w-full">
                    <div className="flex items-center">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden mr-2 -ml-2 text-on-surface hover:bg-surface-container">
                                    <Menu size={20} />
                                    <span className="sr-only">Toggle Sidebar</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64 border-r-0 bg-transparent shadow-none">
                                <SheetTitle className="sr-only">Navigation</SheetTitle>
                                <Sidebar activePath={pathname} />
                            </SheetContent>
                        </Sheet>
                    </div>
                    <ThemeToggle />
                </header>

                <main className={`flex-1 ${fullWidth ? 'flex flex-col min-h-0 min-w-0 w-full overflow-hidden' : 'overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8 min-h-0 w-full'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
