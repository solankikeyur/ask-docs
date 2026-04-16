import { Link } from '@inertiajs/react';
import { FileUp, Link2, MessageSquareText, Users } from 'lucide-react';
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
import { dashboard as adminDashboard } from '@/routes';
import { index as userChat } from '@/routes/chat';

interface QuickStartCardProps {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isViewer: boolean;
}

export function QuickStartCard({ isAuthenticated, isAdmin, isViewer }: QuickStartCardProps) {
    return (
        <Card className="border-border/60 shadow-lg shadow-primary/5">
            <CardHeader>
                <CardTitle>Quick start</CardTitle>
                <CardDescription>
                    Two simple paths, depending on your role.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <WorkflowSection
                    icon={FileUp}
                    title="Workspace manager"
                    subtitle="Index → Chat → Refine"
                    steps={[
                        'Ingest documents into your custom warehouse.',
                        'Orchestrate user access and permissions.',
                        'Monitor interactions and data utilization.',
                    ]}
                />

                <WorkflowSection
                    icon={MessageSquareText}
                    title="Collaborator"
                    subtitle="Inquire → Discover → Solve"
                    steps={[
                        'Access the secure workspace portal.',
                        'Engage with your authorized document sets.',
                        'Extract verified insights with AI assistance.',
                    ]}
                />
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
                        className="gap-2 rounded-full"
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
                        className="gap-2 rounded-full"
                    >
                        <Link href={userChat()}>
                            <Link2 size={14} />
                            Go to chats
                        </Link>
                    </Button>
                )}
                {!isAuthenticated && (
                    <div className="flex w-full items-center gap-2">
                        <Button
                            asChild
                            size="sm"
                            className="flex-1 gap-2 rounded-full"
                        >
                            <Link href={login()}>
                                <Users size={14} />
                                Log in
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 rounded-full"
                        >
                            <Link href={register()}>
                                Create Account
                            </Link>
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

interface WorkflowSectionProps {
    icon: any;
    title: string;
    subtitle: string;
    steps: string[];
}

function WorkflowSection({ icon: Icon, title, subtitle, steps }: WorkflowSectionProps) {
    return (
        <div className="grid gap-3 rounded-xl border border-border/40 bg-card/50 p-4 transition-colors hover:bg-card">
            <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={16} />
                </span>
                <div>
                    <p className="text-sm font-semibold">
                        {title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
            </div>
            <ul className="ml-1 grid gap-2 text-sm text-muted-foreground">
                {steps.map((step, index) => (
                    <li key={index} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                        {step}
                    </li>
                ))}
            </ul>
        </div>
    );
}
