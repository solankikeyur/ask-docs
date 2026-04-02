import { Head } from '@inertiajs/react';
import { FileText, MessageSquare, Users } from 'lucide-react';
import type { ElementType } from 'react';
import AdminLayout from '@/layouts/admin/AdminLayout';

type DashboardStats = {
    documentsUploaded: number;
    usersCreated: number;
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

export default function AdminDashboard({ stats }: { stats: DashboardStats }) {
    const format = (value: number) => value.toLocaleString();

    return (
        <AdminLayout activePath="/admin">
            <Head title="Admin — Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">System Overview</h1>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Documents Uploaded" value={format(stats.documentsUploaded)} icon={FileText} />
                    <StatCard label="Users Created" value={format(stats.usersCreated)} icon={Users} />
                    <StatCard label="Active Chats Today" value={format(stats.activeChatsToday)} icon={MessageSquare} accent />
                </div>

                {/* Workflow Steps */}
                <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-5">
                    <h2 className="mb-4 font-semibold text-on-surface">How It Works</h2>
                    <div className="grid gap-3 md:grid-cols-3">
                        {[
                            { step: '01', title: 'Upload Documents', desc: 'Add PDFs, DOCX, and CSVs to the knowledge base. The AI indexes them automatically.', icon: FileText },
                            { step: '02', title: 'Create Users & Assign', desc: 'Create user accounts, then assign specific documents each user can access.', icon: Users },
                            { step: '03', title: 'Users Chat with Docs', desc: 'Users log in and can only chat with the documents you have assigned to them.', icon: MessageSquare },
                        ].map(({ step, title, desc, icon: Icon }) => (
                            <div key={step} className="relative rounded-[var(--radius-md)] bg-surface-container p-4">
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
        </AdminLayout>
    );
}
