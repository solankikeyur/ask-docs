import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    FileText,
    MessageSquare,
    Users,
    LogOut,
    BookOpen,
    ChevronRight,
    Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutGrid },
    { label: 'Documents', href: '/admin/documents', icon: FileText },
    { label: 'Chat', href: '/admin/chat', icon: MessageSquare },
    { label: 'Chatbots', href: '/admin/chatbots', icon: Bot },
    { label: 'Users', href: '/admin/users', icon: Users },
];

interface AdminSidebarProps {
    activePath: string;
}

export function AdminSidebar({ activePath }: AdminSidebarProps) {
    const { auth } = usePage().props as any;

    return (
        <aside className="flex h-full w-56 shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-low">
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary-gradient text-primary-foreground">
                    <BookOpen size={15} />
                </div>
                <div>
                    <p className="text-sm font-bold leading-tight tracking-tight text-on-surface">AskDocs</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 px-3 py-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = href === '/admin'
                        ? activePath === href
                        : activePath === href || activePath.startsWith(href + '/');

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all duration-150',
                                active
                                    ? 'bg-primary-container text-primary'
                                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                            )}
                        >
                            <Icon size={16} />
                            {label}
                            {active && <ChevronRight size={12} className="ml-auto text-primary" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User info */}
            <div className="border-t border-outline-variant/15 px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-gradient text-xs font-bold text-primary-foreground">
                        {auth?.user?.name?.charAt(0) ?? 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-on-surface">{auth?.user?.name ?? 'Admin'}</p>
                        <p className="text-[10px] text-primary">Admin</p>
                    </div>
                    <Link href="/logout" method="post" as="button">
                        <LogOut size={14} className="text-on-surface-variant hover:text-error" />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
