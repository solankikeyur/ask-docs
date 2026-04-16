import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    FileText,
    MessageSquare,
    Settings,
    BookOpen,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { usePage } from '@inertiajs/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Documents',
        href: '/documents',
        icon: FileText,
    },
    {
        title: 'Chatbots',
        href: '/chatbots',
        icon: MessageSquare,
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageSquare,
    },
];

const adminOnlyItems: NavItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs',
        icon: BookOpen,
    },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
    },
];

export function AppSidebar({ variant }: { variant?: string }) {
    const { auth } = usePage().props as any;
    const isAdmin = auth.user.role === 'admin';
    const items = isAdmin ? [...mainNavItems, ...adminOnlyItems] : mainNavItems;

    return (
        <Sidebar collapsible="icon" variant={variant === 'full' ? 'sidebar' : 'inset'}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <div className="px-2 py-2">
                    <ThemeToggle />
                </div>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
