import { BookOpen } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-[var(--radius-md)] bg-primary-gradient text-primary-foreground">
                <BookOpen className="size-4" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate font-bold leading-tight tracking-tight text-on-surface">
                    AskDocs
                </span>
                <span className="truncate text-[10px] text-on-surface-variant">
                    AI Document Q&amp;A
                </span>
            </div>
        </>
    );
}
