import { Head } from '@inertiajs/react';
import { FileText, MessageSquare, Users } from 'lucide-react';
import type { ElementType } from 'react';
import AppLayout from '@/layouts/AppLayout';

type DashboardStats = {
    documentsUploaded: number;
    chatbotsCreated: number;
    usersCreated?: number;
    activeChatsToday: number;
};

// ---- Stat Card ----
function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent = false,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: ElementType;
    accent?: boolean;
}) {
    return (
        <div className={`rounded-[var(--radius-lg)] p-5 ${accent ? 'bg-primary text-primary-foreground' : 'bg-surface-container-low'}`}>
            <div className="mb-3 flex items-center justify-between">
                <span className={`text-xs font-medium uppercase tracking-widest ${accent ? 'text-primary-foreground/70' : 'text-on-surface-variant'}`}>
                    {label}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] ${accent ? 'bg-primary-foreground/15' : 'bg-primary-container'}`}>
                    <Icon size={14} className={accent ? 'text-primary-foreground' : 'text-primary'} />
                </div>
            </div>
            <p className={`text-3xl font-bold ${accent ? 'text-primary-foreground' : 'text-on-surface'}`}>{value}</p>
            {sub && <p className={`mt-1.5 text-xs ${accent ? 'text-primary-foreground/70' : 'text-primary'}`}>{sub}</p>}
        </div>
    );
}

export default function Dashboard({ stats }: { stats: DashboardStats }) {
    const format = (value?: number) => (value ?? 0).toLocaleString();

    return (
        <AppLayout activePath="/dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">System Overview</h1>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="My Documents" value={format(stats.documentsUploaded)} icon={FileText} />
                    <StatCard label="My Chatbots" value={format(stats.chatbotsCreated)} icon={FileText} />
                    {typeof stats.usersCreated !== 'undefined' && (
                        <StatCard label="Workspace Users" value={format(stats.usersCreated)} icon={Users} />
                    )}
                    <StatCard label="Active Chats Today" value={format(stats.activeChatsToday)} icon={MessageSquare} accent />
                </div>

                {/* Workflow Steps */}
                <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-4 sm:p-5">
                    <h2 className="mb-4 font-semibold text-on-surface">How It Works</h2>
                    <div className="flex flex-col md:flex-row gap-3">
                        {[
                            { step: '01', title: 'Upload Documents', desc: 'Securely upload PDFs for indexing. Only you can access your personal documents.', icon: FileText },
                            { step: '02', title: 'Ask Questions', desc: 'Engage with our AI to extract insights and summaries from your document library.', icon: MessageSquare },
                            { step: '03', title: 'Expand Insights', desc: 'Use integrated chatbots to automate workflows and deep-dive into your data.', icon: Users },
                        ].map(({ step, title, desc, icon: Icon }) => (
                            <div key={step} className="relative rounded-[var(--radius-md)] bg-surface-container p-4 flex-1">
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="text-2xl font-black text-outline-variant/40 leading-none">{step}</span>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary-container">
                                        <Icon size={15} className="text-primary" />
                                    </div>
                                </div>
                                <p className="mb-1 text-sm font-semibold text-on-surface">{title}</p>
                                <p className="mb-3 text-xs leading-relaxed text-on-surface-variant">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
