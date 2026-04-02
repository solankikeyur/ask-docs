import { Link } from '@inertiajs/react';
import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';

const navLinks = [
    { label: 'Features',  href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing',   href: '#pricing' },
    { label: 'Docs',      href: '#docs' },
];

interface NavbarProps {
    isAuthenticated: boolean;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 pt-4">
                <nav className="glass border-ghost flex h-14 items-center justify-between rounded-[var(--radius-lg)] px-5 shadow-ambient">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 font-semibold text-on-surface">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary-gradient text-primary-foreground">
                            <BookOpen size={16} />
                        </span>
                        <span className="text-sm font-bold tracking-tight">AskDocs</span>
                    </Link>

                    {/* Desktop nav */}
                    <ul className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className="rounded-[var(--radius-md)] px-3.5 py-2 text-sm text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-low hover:text-on-surface"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <div className="hidden items-center gap-2 md:flex">
                        {isAuthenticated ? (
                            <Button asChild size="sm">
                                <Link href={adminDashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={login()}>Log in</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="rounded-[var(--radius-md)] p-2 text-on-surface-variant hover:bg-surface-container-low md:hidden"
                        onClick={() => setOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </nav>

                {/* Mobile panel */}
                <div
                    className={cn(
                        'glass border-ghost mt-2 overflow-hidden rounded-[var(--radius-lg)] shadow-ambient transition-all duration-300 md:hidden',
                        open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0',
                    )}
                >
                    <div className="flex flex-col gap-1 p-3">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="mt-2 flex flex-col gap-2 border-t border-outline-variant/20 pt-2">
                            {isAuthenticated ? (
                                <Button asChild size="sm">
                                    <Link href={adminDashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
