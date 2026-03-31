import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant | 'full';
};

export function AppContent({ variant = 'sidebar', children, className, ...props }: Props) {
    if (variant === 'sidebar') {
        return <SidebarInset className={className} {...props}>{children}</SidebarInset>;
    }

    if (variant === 'full') {
        return (
            <main
                className={cn("flex min-h-svh flex-1 flex-col overflow-hidden bg-background", className)}
                {...props}
            >
                {children}
            </main>
        );
    }

    return (
        <main
            className={cn("mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl", className)}
            {...props}
        >
            {children}
        </main>
    );
}
