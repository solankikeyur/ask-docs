import { Head, Link } from '@inertiajs/react';
import {
    FileText, MessageSquare, Clock, BookOpen, ArrowRight, Sparkles, AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

// In the real app these come from Inertia page props passed from the controller
const assignedDocs = [
    { id: 1, name: '2024_Financial_Q3_Report.pdf', size: '4.2 MB', type: 'PDF', status: 'ready' as const, questions: 142, lastChat: '2h ago' },
    { id: 2, name: 'Legal_Review_ProjectX.pdf',    size: '2.1 MB', type: 'PDF', status: 'ready' as const, questions: 34,  lastChat: '3 days ago' },
    { id: 3, name: 'Market_Analysis_Europe_v2.docx', size: '1.8 MB', type: 'DOCX', status: 'processing' as const, questions: 0, lastChat: 'Never' },
];

const recentChats = [
    { id: 1, docName: '2024_Financial_Q3_Report.pdf', question: 'What were the Q3 revenue projections for North America?', time: '2h ago' },
    { id: 2, docName: 'Legal_Review_ProjectX.pdf',    question: 'Summarise the key compliance obligations in section 4.', time: '3 days ago' },
];

export default function Dashboard() {
    return (
        <>
            <Head title="My Workspace" />

            <div className="mx-auto max-w-5xl space-y-8 p-6">

                {/* Welcome */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">My Workspace</h1>
                        <p className="mt-0.5 text-sm text-on-surface-variant">
                            {assignedDocs.length} document{assignedDocs.length !== 1 ? 's' : ''} have been shared with you.
                        </p>
                    </div>
                    <Link
                        href="/chat"
                        className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elevated transition-opacity hover:opacity-90"
                    >
                        <Sparkles size={14} /> Start Chatting
                    </Link>
                </div>

                {/* My Assigned Documents */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <BookOpen size={15} className="text-primary" />
                        <h2 className="font-semibold text-on-surface">My Assigned Documents</h2>
                    </div>

                    {assignedDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-outline-variant/25 py-16 text-center">
                            <AlertCircle size={32} className="mb-3 text-on-surface-variant/40" />
                            <p className="font-medium text-on-surface">No documents assigned yet</p>
                            <p className="mt-1 max-w-xs text-sm text-on-surface-variant">
                                Your admin hasn't assigned any documents to your account. Contact your administrator.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {assignedDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="group flex flex-col rounded-[var(--radius-lg)] bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
                                >
                                    {/* Icon + badge */}
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-container">
                                            <FileText size={18} className="text-primary" />
                                        </div>
                                        <Badge variant={doc.status}>{doc.status}</Badge>
                                    </div>

                                    {/* Name */}
                                    <p className="mb-0.5 line-clamp-2 text-sm font-semibold leading-snug text-on-surface">
                                        {doc.name}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">{doc.type} · {doc.size}</p>

                                    {/* Stats */}
                                    <div className="mt-3 flex items-center gap-3 text-xs text-on-surface-variant">
                                        <span className="flex items-center gap-1">
                                            <MessageSquare size={10} className="text-primary" />
                                            {doc.questions} questions asked
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {doc.lastChat}
                                        </span>
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-4 flex items-center justify-between">
                                        {doc.status === 'ready' ? (
                                            <Link
                                                href={`/chat?doc=${doc.id}`}
                                                className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                            >
                                                <MessageSquare size={11} /> Chat with this Doc
                                            </Link>
                                        ) : (
                                            <span className="text-xs italic text-on-surface-variant">
                                                {doc.status === 'processing' ? 'Indexing in progress…' : 'Failed to index'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Recent Chats */}
                {recentChats.length > 0 && (
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={15} className="text-primary" />
                                <h2 className="font-semibold text-on-surface">Recent Chats</h2>
                            </div>
                            <Link href="/chat" className="flex items-center gap-1 text-xs text-primary hover:underline">
                                View all <ArrowRight size={11} />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {recentChats.map((chat) => (
                                <Link
                                    key={chat.id}
                                    href={`/chat?session=${chat.id}`}
                                    className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
                                >
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-container">
                                        <FileText size={14} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-on-surface-variant">{chat.docName}</p>
                                        <p className="mt-0.5 truncate text-sm font-medium text-on-surface">"{chat.question}"</p>
                                    </div>
                                    <span className="shrink-0 text-xs text-on-surface-variant">{chat.time}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Quick tip */}
                <div className="rounded-[var(--radius-lg)] bg-primary-container p-4">
                    <p className="text-sm text-on-primary-container">
                        <strong>Tip:</strong> Each chat is grounded in your assigned documents only. The AI will cite the exact page when it references something.
                    </p>
                </div>
            </div>
        </>
    );
}
