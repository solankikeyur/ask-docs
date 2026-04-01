import { BookOpen } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="size-4" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight text-on-surface">
                    AskDocs
                </span>
                <span className="truncate text-[10px] text-on-surface-variant">
                    Admin Control Unit
                </span>
            </div>
        </>
    );
}
