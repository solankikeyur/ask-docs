import { Link } from '@inertiajs/react';
import { MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { login } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { chat as userChat } from '@/routes/user';

interface WelcomeHeaderProps {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isViewer: boolean;
}

export function WelcomeHeader({ isAuthenticated, isAdmin, isViewer }: WelcomeHeaderProps) {
    return (
        <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 font-semibold"
                >
                    <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <MessageSquareText size={16} />
                    </span>
                    <span className="text-sm font-bold tracking-tight">
                        AskDocs
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <Button asChild size="sm">
                                    <Link href={adminDashboard()}>
                                        Admin Console
                                    </Link>
                                </Button>
                            )}
                            {isViewer && (
                                <Button asChild size="sm">
                                    <Link href={userChat()}>
                                        My Chats
                                    </Link>
                                </Button>
                            )}
                            {!isAdmin && !isViewer && (
                                <>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Link href={adminDashboard()}>
                                            Admin Console
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={userChat()}>
                                            My Chats
                                        </Link>
                                    </Button>
                                </>
                            )}
                            <div className="mx-1 h-4 w-[1px] bg-border/60" />
                            <ThemeToggle />
                        </>
                    ) : (
                        <>
                            <ThemeToggle />
                            <Button asChild variant="ghost" size="sm">
                                <Link href={login()}>Log in</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
