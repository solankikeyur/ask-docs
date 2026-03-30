import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    FileText, MessageSquare, Send, Plus, AlertTriangle,
    Info, AlertCircle, Paperclip, BookOpen, ChevronDown,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

// ─── Types ────────────────────────────────────────────────────
type RiskIcon = 'warn' | 'alert' | 'info';
interface Message {
    role: 'user' | 'ai';
    content: string;
    risks?: { icon: RiskIcon; text: string }[];
    hasTables?: boolean;
}

// ─── Only assigned documents appear here ─────────────────────
const assignedDocs = [
    { id: 1, name: '2024_Financial_Q3_Report.pdf', status: 'ready' as const },
    { id: 2, name: 'Legal_Review_ProjectX.pdf',    status: 'ready' as const },
    { id: 3, name: 'Market_Analysis_Europe_v2.docx', status: 'processing' as const },
];

const chatHistory = [
    { id: 1, title: 'Q3 revenue breakdown for North American operations…', docId: 1, active: true },
    { id: 2, title: 'Key compliance obligations in Section 4…',            docId: 2, active: false },
];

const messages: Message[] = [
    {
        role: 'user',
        content:
            'Can you compare the revenue projections from the North American sector against the EMEA region for Q4? Include key risks.',
    },
    {
        role: 'ai',
        content:
            'Based on the **2024_Financial_Q3_Report.pdf**, here is the comparative analysis:',
        hasTables: true,
        risks: [
            { icon: 'warn',  text: "Regulatory Delays: EU privacy laws could impact EMEA's data integration timeline by 4-6 weeks." },
            { icon: 'alert', text: 'Supply Chain Volatility: Hardware components for North American server upgrades remain unstable.' },
            { icon: 'info',  text: 'Currency Fluctuations: Strengthening USD may impact translation gains from European operations.' },
        ],
    },
];

function RevenueTable() {
    return (
        <div className="my-3 overflow-hidden rounded-[var(--radius-md)] border border-outline-variant/15">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant">
                        <th className="px-3 py-2 text-left">Region</th>
                        <th className="px-3 py-2 text-right">Q4 Projection</th>
                        <th className="px-3 py-2 text-right">vs Q3</th>
                        <th className="px-3 py-2 text-right">Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        { region: 'North America', q4: '$142.8M', change: '+8.4%', conf: 'ready' as const },
                        { region: 'EMEA', q4: '$98.3M', change: '+3.1%', conf: 'processing' as const },
                    ].map((row) => (
                        <tr key={row.region} className="border-t border-outline-variant/10 hover:bg-surface-container-low">
                            <td className="px-3 py-2 font-medium text-on-surface">{row.region}</td>
                            <td className="px-3 py-2 text-right text-on-surface">{row.q4}</td>
                            <td className="px-3 py-2 text-right text-primary">{row.change}</td>
                            <td className="px-3 py-2 text-right">
                                <Badge variant={row.conf}>{row.conf === 'ready' ? 'High' : 'Medium'}</Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Citation({ doc, page }: { doc: string; page: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded bg-surface-variant px-2 py-0.5 text-[11px] text-on-surface">
            <FileText size={10} className="text-on-surface-variant" />
            {doc} · {page}
        </span>
    );
}

const riskIcons = { warn: AlertTriangle, alert: AlertCircle, info: Info };
const riskColors: Record<RiskIcon, string> = {
    warn:  'bg-error-container text-on-error-container',
    alert: 'text-on-tertiary-container bg-tertiary-container',
    info:  'text-primary bg-primary-container',
};

// ─── Doc selector dropdown ────────────────────────────────────
function DocSelector({ active, docs, onSelect }: { active: typeof assignedDocs[0]; docs: typeof assignedDocs; onSelect: (d: typeof assignedDocs[0]) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-[11px] text-on-surface hover:bg-surface-container-highest transition-colors"
            >
                <FileText size={10} className="text-primary" />
                <span className="max-w-[120px] truncate">{active.name}</span>
                <ChevronDown size={10} className="text-on-surface-variant" />
            </button>
            {open && (
                <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-[var(--radius-lg)] bg-surface-container-lowest shadow-elevated">
                    {docs.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => { onSelect(doc); setOpen(false); }}
                            disabled={doc.status !== 'ready'}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-surface-container-low disabled:opacity-40"
                        >
                            <FileText size={12} className="shrink-0 text-primary-fixed-dim" />
                            <span className="flex-1 truncate text-on-surface">{doc.name}</span>
                            <Badge variant={doc.status} className="h-4 text-[10px]">{doc.status}</Badge>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [activeDoc, setActiveDoc] = useState(assignedDocs[0]);

    return (
        <AppLayout>
            <Head title="Chat" />

            <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
                {/* Chat History Sidebar */}
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
                                onClick={() => doc.status === 'ready' && setActiveDoc(doc)}
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

                {/* Main chat area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Active doc bar */}
                    <div className="flex items-center gap-3 border-b border-outline-variant/15 bg-surface-container-low px-4 py-2">
                        <BookOpen size={13} className="shrink-0 text-on-surface-variant" />
                        <span className="text-xs text-on-surface-variant">Chatting with:</span>
                        <DocSelector active={activeDoc} docs={assignedDocs} onSelect={setActiveDoc} />
                        <span className="ml-auto text-[10px] text-on-surface-variant">
                            Only your assigned documents appear here
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-5 overflow-y-auto p-5">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        msg.role === 'ai'
                                            ? 'bg-primary-gradient text-primary-foreground'
                                            : 'bg-secondary-container text-on-secondary-container'
                                    }`}
                                >
                                    {msg.role === 'ai' ? <MessageSquare size={13} /> : 'ME'}
                                </div>

                                <div
                                    className={`max-w-2xl rounded-[var(--radius-lg)] p-4 text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-surface-container text-on-surface'
                                    }`}
                                >
                                    {msg.role === 'ai' ? (
                                        <>
                                            <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                            {msg.hasTables && <RevenueTable />}
                                            {msg.risks && (
                                                <>
                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Key Risks:</p>
                                                    {msg.risks.map((risk, ri) => {
                                                        const Icon = riskIcons[risk.icon];
                                                        return (
                                                            <div key={ri} className={`mb-2 flex items-start gap-2.5 rounded-[var(--radius-md)] p-2.5 text-xs ${riskColors[risk.icon]}`}>
                                                                <Icon size={13} className="mt-0.5 shrink-0" />
                                                                <span>{risk.text}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            )}
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                <Citation doc="2024_Financial_Q3_Report.pdf" page="p.12" />
                                                <Citation doc="2024_Financial_Q3_Report.pdf" page="p.18-19" />
                                            </div>
                                        </>
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input bar */}
                    <div className="border-t border-outline-variant/15 bg-surface-container-low p-4">
                        <div className="flex items-end gap-2 rounded-[var(--radius-lg)] border-ghost bg-surface-container-lowest p-3">
                            <button className="mb-0.5 text-on-surface-variant hover:text-on-surface">
                                <Paperclip size={16} />
                            </button>
                            <textarea
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 resize-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                                placeholder={`Ask anything about ${activeDoc.name.split('_')[0]}…`}
                            />
                            <button
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground disabled:opacity-40"
                                disabled={!input.trim()}
                            >
                                <Send size={14} />
                            </button>
                        </div>
                        <p className="mt-2 text-center text-[10px] text-on-surface-variant">
                            Answers are grounded in your assigned documents. AI will always cite the source page.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
