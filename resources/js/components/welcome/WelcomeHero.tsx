import { Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';
import { users as adminUsers } from '@/routes/admin';
import { index as adminDocuments } from '@/routes/documents';
import { index as userChat } from '@/routes/chat';

interface WelcomeHeroProps {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isViewer: boolean;
}

export function WelcomeHero({ isAuthenticated, isAdmin, isViewer }: WelcomeHeroProps) {
    return (
        <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
                <ShieldCheck
                    size={14}
                    className="text-primary"
                />
                Enterprise-grade security & privacy
            </p>

            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-[1.1]">
                Revolutionize your <br />
                <span className="text-primary">document workflow.</span> <br />
                Intelligence, simplified.
            </h1>
            
            <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg leading-relaxed">
                Connect your organization's knowledge to high-precision AI. 
                AskDocs provides a secure environment where teams chat with internal documents 
                under a centralized permission structure.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                {!isAuthenticated && (
                    <div className="flex items-center gap-3">
                        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                            <Link href={login()}>Log in</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full px-8 shadow-sm">
                            <Link href={register()}>Create Account</Link>
                        </Button>
                    </div>
                )}
                {isAuthenticated && isAdmin && (
                    <>
                        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                            <Link href={adminDocuments()}>
                                Manage Documents
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-full px-8 shadow-sm"
                        >
                            <Link href={adminUsers()}>
                                Manage Users
                            </Link>
                        </Button>
                    </>
                )}
                {isAuthenticated && isViewer && (
                    <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                        <Link href={userChat()}>
                            Open My Chats
                        </Link>
                    </Button>
                )}
            </div>

            {!isAuthenticated && (
                <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground font-medium italic">
                    <span className="h-px w-8 bg-border/60" />
                    Join a workspace or create your own today.
                </p>
            )}
        </div>
    );
}
