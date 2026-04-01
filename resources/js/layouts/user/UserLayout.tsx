import { router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

export default function UserLayout({ children }: { children: ReactNode }) {
    const { props } = usePage<SharedData>();
    const user = props.auth?.user;

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant/15 px-4">
                <div className="text-sm font-semibold tracking-tight">AskDocs</div>
                <div className="flex items-center gap-3">
                    {user?.name && <span className="hidden text-xs text-muted-foreground sm:inline">{user.name}</span>}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.post('/logout')}
                    >
                        Logout
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 min-h-0 flex-col overflow-hidden">{children}</main>
        </div>
    );
}

