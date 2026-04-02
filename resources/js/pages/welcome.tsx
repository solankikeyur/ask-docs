import { Head, Link, usePage } from '@inertiajs/react';
import {
    FileUp,
    Link2,
    MessageSquareText,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';
import {
    dashboard as adminDashboard,
    documents as adminDocuments,
    users as adminUsers,
} from '@/routes/admin';
import { chat as userChat } from '@/routes/user';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    const user =
        (auth as { user?: Record<string, unknown> | null } | undefined)?.user ??
        null;

    const role = typeof user?.role === 'string' ? user.role : null;
    const isAuthenticated = !!user;
    const isAdmin = role === 'admin';
    const isViewer = role === 'viewer';

    return (
        <>
            <Head title="AskDocs">
                <meta
                    name="description"
                    content="Admins upload and assign documents. Users chat with their assigned documents."
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground antialiased">
                <header className="border-b border-border/60">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 font-semibold"
                        >
                            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
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
                                </>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild size="sm">
                                            <Link href={register()}>
                                                Create Admin Account
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
                        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                            <div>
                                <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground">
                                    <ShieldCheck
                                        size={14}
                                        className="text-primary"
                                    />
                                    Role-based document access
                                </p>

                                <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
                                    Upload documents. Assign access. Chat with
                                    confidence.
                                </h1>
                                <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
                                    AskDocs is built around your current
                                    workflow: an{' '}
                                    <span className="font-medium text-foreground">
                                        admin
                                    </span>{' '}
                                    uploads documents, assigns them to users,
                                    and each user can log in and chat with only
                                    the documents they’re allowed to see.
                                </p>

                                <div className="mt-7 flex flex-wrap items-center gap-3">
                                    {!isAuthenticated && (
                                        <Button asChild size="lg">
                                            <Link href={login()}>Log in</Link>
                                        </Button>
                                    )}
                                    {!isAuthenticated && canRegister && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                        >
                                            <Link href={register()}>
                                                Create Admin Account
                                            </Link>
                                        </Button>
                                    )}
                                    {isAuthenticated && isAdmin && (
                                        <>
                                            <Button asChild size="lg">
                                                <Link href={adminDocuments()}>
                                                    Manage Documents
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="lg"
                                            >
                                                <Link href={adminUsers()}>
                                                    Manage Users
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                    {isAuthenticated && isViewer && (
                                        <Button asChild size="lg">
                                            <Link href={userChat()}>
                                                Open My Chats
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                {!isAuthenticated && (
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        Users are typically created by an admin.
                                        If registration is disabled, ask your
                                        admin for access.
                                    </p>
                                )}
                            </div>

                            <Card className="border-border/60">
                                <CardHeader>
                                    <CardTitle>Quick start</CardTitle>
                                    <CardDescription>
                                        Two simple paths, depending on your
                                        role.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-3 rounded-xl border border-border/60 bg-card p-4">
                                        <div className="flex items-center gap-2.5">
                                            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                                                <FileUp size={16} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Admin workflow
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Upload → assign → monitor
                                                </p>
                                            </div>
                                        </div>
                                        <ul className="ml-1 grid gap-2 text-sm text-muted-foreground">
                                            <li className="flex gap-2">
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                Upload documents to the system.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                Create users and control
                                                access.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                Assign specific documents to
                                                specific users.
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="grid gap-3 rounded-xl border border-border/60 bg-card p-4">
                                        <div className="flex items-center gap-2.5">
                                            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                                                <MessageSquareText size={16} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    User workflow
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Select a doc → ask questions
                                                </p>
                                            </div>
                                        </div>
                                        <ul className="ml-1 grid gap-2 text-sm text-muted-foreground">
                                            <li className="flex gap-2">
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                Log in with the account your
                                                admin created.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                Choose from your assigned
                                                documents.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                Chat and keep conversation
                                                history.
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter
                                    className={cn(
                                        'gap-2',
                                        isAuthenticated
                                            ? 'justify-start'
                                            : 'justify-between',
                                    )}
                                >
                                    {isAuthenticated && isAdmin && (
                                        <Button
                                            asChild
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <Link href={adminDashboard()}>
                                                <Link2 size={14} />
                                                Go to dashboard
                                            </Link>
                                        </Button>
                                    )}
                                    {isAuthenticated && isViewer && (
                                        <Button
                                            asChild
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <Link href={userChat()}>
                                                <Link2 size={14} />
                                                Go to chats
                                            </Link>
                                        </Button>
                                    )}
                                    {!isAuthenticated && (
                                        <>
                                            <Button
                                                asChild
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <Link href={login()}>
                                                    <Users size={14} />
                                                    Log in
                                                </Link>
                                            </Button>
                                            {canRegister && (
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link href={register()}>
                                                        Create admin
                                                    </Link>
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>
                    </section>

                    <section className="border-t border-border/60 bg-card/40">
                        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-3 md:gap-8">
                            {[
                                {
                                    title: 'Upload & index',
                                    description:
                                        'Admins upload documents to make them available for Q&A.',
                                    icon: FileUp,
                                },
                                {
                                    title: 'Assign access',
                                    description:
                                        'Grant each user access only to the documents they need.',
                                    icon: Link2,
                                },
                                {
                                    title: 'Chat per document',
                                    description:
                                        'Users ask questions and keep chat history tied to a document.',
                                    icon: MessageSquareText,
                                },
                            ].map(({ title, description, icon: Icon }) => (
                                <Card
                                    key={title}
                                    className="border-border/60"
                                >
                                    <CardHeader>
                                        <div className="mb-1 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                                            <Icon size={16} />
                                        </div>
                                        <CardTitle className="text-base">
                                            {title}
                                        </CardTitle>
                                        <CardDescription>
                                            {description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border/60 py-10">
                    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <p>© {new Date().getFullYear()} AskDocs</p>
                        <p>
                            Admin upload/assign • User chat • Role-based access
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
