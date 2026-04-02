import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { SharedData } from '@/types';

export default function UserLayout({ children }: { children: ReactNode }) {
    const { props } = usePage<SharedData>();
    const user = props.auth?.user;
    const getInitials = useInitials();

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant/15 px-4">
                <Link href="/" className="flex items-center gap-2">
                    <AppLogo />
                </Link>
                <div className="flex items-center gap-3">
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 focus:outline-none">
                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/20">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-neutral-200 text-xs text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>
            <main className="flex flex-1 min-h-0 flex-col overflow-hidden">{children}</main>
        </div>
    );
}

