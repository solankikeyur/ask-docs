import { Link } from '@inertiajs/react';
import { Plus, FileText } from 'lucide-react';

interface Doc {
    id: number;
    name: string;
    status: 'ready' | 'processing';
}

interface ChatHistory {
    id: number;
    title: string;
    docId: number;
    active: boolean;
}

interface ChatSidebarProps {
    chatHistory: ChatHistory[];
    assignedDocs: Doc[];
    activeDoc: Doc;
    onDocSelect: (doc: Doc) => void;
}

export function ChatSidebar({ chatHistory, assignedDocs, activeDoc, onDocSelect }: ChatSidebarProps) {
    return (
        <div className="hidden w-60 shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-low md:flex">
            <div className="flex items-center justify-between p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Chat History
                </p>
                <Link
                    href="/chat/new"
                    className="rounded-[var(--radius-md)] p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                >
                    <Plus size={14} />
                </Link>
            </div>

            <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
                {chatHistory.map((c) => (
                    <button
                        key={c.id}
                        className={`w-full rounded-[var(--radius-md)] px-3 py-2.5 text-left text-xs transition-colors ${
                            c.active
                                ? 'bg-primary-container text-primary'
                                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                    >
                        <p className="line-clamp-2 leading-relaxed">{c.title}</p>
                        <p className="mt-0.5 text-[10px] opacity-60">
                            {assignedDocs.find((d) => d.id === c.docId)?.name.split('_')[0]}
                        </p>
                    </button>
                ))}
            </div>

            {/* Assigned docs list in sidebar */}
            <div className="border-t border-outline-variant/15 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                    My Documents
                </p>
                {assignedDocs.map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => doc.status === 'ready' && onDocSelect(doc)}
                        disabled={doc.status !== 'ready'}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-[11px] transition-colors disabled:opacity-40 ${
                            activeDoc.id === doc.id ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                        }`}
                    >
                        <FileText size={10} className="shrink-0" />
                        <span className="truncate">{doc.name.split('_').slice(0, 2).join('_')}…</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
