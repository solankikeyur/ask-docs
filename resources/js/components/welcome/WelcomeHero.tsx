import { Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';
import { documents as adminDocuments, users as adminUsers } from '@/routes/admin';
import { chat as userChat } from '@/routes/user';

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
                Role-based document access
            </p>

            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Upload documents. <br />
                <span className="text-primary">Assign access.</span> <br />
                Chat with confidence.
            </h1>
            
            <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg leading-relaxed">
                AskDocs is built around your current workflow: an{' '}
                <span className="font-medium text-foreground underline decoration-primary/30">
                    admin
                </span>{' '}
                uploads documents, assigns them to users,
                and each user can log in and chat with only
                the documents they’re allowed to see.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                {!isAuthenticated && (
                    <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                        <Link href={login()}>Get Started</Link>
                    </Button>
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
                <p className="mt-4 text-sm text-muted-foreground italic">
                    Users are typically created by an admin.
                    If registration is disabled, ask your
                    admin for access.
                </p>
            )}
        </div>
    );
}
