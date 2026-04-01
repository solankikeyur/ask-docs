import { Head } from '@inertiajs/react';
import {
    FileText,
    Users,
    MessageSquare,
    Link2,
    TrendingUp,
    Clock,
    Zap,
    ArrowRight,
    AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin/AdminLayout';

// ─── Stat Card ───────────────────────────────────────────────
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
    icon: React.ElementType;
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

// ─── Activity Row ─────────────────────────────────────────────
function ActivityRow({
    text,
    time,
    type,
}: {
    text: string;
    time: string;
    type: 'upload' | 'assign' | 'chat' | 'user' | 'error';
}) {
    const colors: Record<string, string> = {
        upload: 'bg-primary',
        assign: 'bg-tertiary',
        chat:   'bg-secondary',
        user:   'bg-primary-fixed-dim',
        error:  'bg-error',
    };

    return (
        <div className="flex items-start gap-3 py-2.5">
            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors[type]}`} />
            <div className="flex-1">
                <p className="text-sm text-on-surface">{text}</p>
                <p className="text-xs text-on-surface-variant">{time}</p>
            </div>
        </div>
    );
}

export default function AdminDashboard() {


    return (
        <AdminLayout activePath="/admin">
            <Head title="Admin — Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">System Overview</h1>
                        <p className="mt-0.5 text-sm text-on-surface-variant">
                            Monitor document uploads, user assignments, and chat activity.
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        <span className="text-xs font-medium text-primary">System Nominal</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Documents Uploaded" value="128" sub="+4 this week" icon={FileText} />
                    <StatCard label="Users Created" value="24" sub="+2 today" icon={Users} />
                    <StatCard label="Assignments Made" value="312" sub="across all users" icon={Link2} />
                    <StatCard label="Active Chats Today" value="47" sub="↑ from 31 yesterday" icon={MessageSquare} accent />
                </div>

                {/* Workflow Steps */}
                <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-5">
                    <h2 className="mb-4 font-semibold text-on-surface">How It Works</h2>
                    <div className="grid gap-3 md:grid-cols-3">
                        {[
                            { step: '01', title: 'Upload Documents', desc: 'Add PDFs, DOCX, and CSVs to the knowledge base. The AI indexes them automatically.', icon: FileText, href: '/admin/documents' },
                            { step: '02', title: 'Create Users & Assign', desc: 'Create user accounts, then assign specific documents each user can access.', icon: Users, href: '/admin/users' },
                            { step: '03', title: 'Users Chat with Docs', desc: 'Users log in and can only chat with the documents you have assigned to them.', icon: MessageSquare, href: '/admin/chat' },
                        ].map(({ step, title, desc, icon: Icon, href }) => (
                            <div key={step} className="relative rounded-[var(--radius-md)] bg-surface-container p-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="text-2xl font-black text-outline-variant/40 leading-none">{step}</span>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary-container">
                                        <Icon size={15} className="text-primary" />
                                    </div>
                                </div>
                                <p className="mb-1 text-sm font-semibold text-on-surface">{title}</p>
                                <p className="mb-3 text-xs leading-relaxed text-on-surface-variant">{desc}</p>
                                <a href={href} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                    Go there <ArrowRight size={11} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom grid */}
                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    {/* Processing throughput */}
                    <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-on-surface">Chat Activity (Last 7 Days)</h2>
                                <p className="text-xs text-on-surface-variant">Total questions asked across all users</p>
                            </div>
                            <Badge variant="ready">Live</Badge>
                        </div>
                        {/* Simulated bar chart */}
                        <div className="flex h-24 items-end gap-1.5">
                            {[42, 65, 38, 80, 55, 70, 47].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[9px] text-on-surface-variant">{h}</span>
                                    <div
                                        className="w-full rounded-t-[2px] bg-primary-container transition-all hover:bg-primary"
                                        style={{ height: `${(h / 80) * 100}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-on-surface-variant px-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                                <span key={d}>{d}</span>
                            ))}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {[
                                { label: 'Avg. Response', value: '1.2s', icon: Clock },
                                { label: 'Answer Rate', value: '96%', icon: TrendingUp },
                                { label: 'AI Model', value: 'V2', icon: Zap },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="rounded-[var(--radius-md)] bg-surface-container p-3 text-center">
                                    <Icon size={14} className="mx-auto mb-1 text-primary" />
                                    <p className="text-sm font-semibold text-on-surface">{value}</p>
                                    <p className="text-[10px] text-on-surface-variant">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent activity */}
                    <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-5">
                        <h2 className="mb-3 font-semibold text-on-surface">Recent Activity</h2>
                        <div className="divide-y divide-outline-variant/10">
                            {[
                                { text: 'Q3_Report.pdf uploaded and indexed', time: '2 min ago', type: 'upload' as const },
                                { text: 'Sarah Chen assigned 3 documents', time: '18 min ago', type: 'assign' as const },
                                { text: 'New user "James Okonkwo" created', time: '1 hr ago', type: 'user' as const },
                                { text: 'Admin chatted with Market_Analysis.pdf', time: '2 hrs ago', type: 'chat' as const },
                                { text: 'User "Priya Nair" asked 12 questions', time: '3 hrs ago', type: 'chat' as const },
                                { text: 'Product_Roadmap.key failed to index', time: '4 hrs ago', type: 'error' as const },
                            ].map((item) => (
                                <ActivityRow key={item.text} {...item} />
                            ))}
                        </div>

                        {/* Unassigned docs warning */}
                        <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] bg-error-container p-3">
                            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-on-error-container" />
                            <div>
                                <p className="text-xs font-semibold text-on-error-container">14 docs not yet assigned</p>
                                <p className="text-[11px] text-on-error-container/80">Some uploaded documents have no users assigned to them.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
