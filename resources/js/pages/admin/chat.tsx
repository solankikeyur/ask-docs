import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import {
    FileText, MessageSquare, Send, Plus, AlertTriangle,
    Info, AlertCircle, Paperclip, BookOpen, ChevronDown, Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

type RiskIcon = 'warn' | 'alert' | 'info';
interface Message { role: 'user' | 'ai'; content: string; risks?: { icon: RiskIcon; text: string }[]; hasTables?: boolean; }

// Admin can access ALL documents
const allDocs = [
    { id: 1, name: '2024_Financial_Q3_Report.pdf',    status: 'ready' as const },
    { id: 2, name: 'Market_Analysis_Europe_v2.docx',  status: 'ready' as const },
    { id: 3, name: 'Customer_Feedback_Raw_Data.csv',  status: 'processing' as const },
    { id: 4, name: 'Legal_Review_ProjectX.pdf',       status: 'ready' as const },
    { id: 5, name: 'Employee_Handbook_v5.docx',       status: 'ready' as const },
];

const chatHistory = [
    { id: 1, title: 'Q3 revenue breakdown vs EMEA…',       docId: 1, active: true },
    { id: 2, title: 'European market share summary…',       docId: 2, active: false },
    { id: 3, title: 'Compliance obligations section 4…',    docId: 4, active: false },
];

const messages: Message[] = [
    { role: 'user', content: 'What were the Q4 revenue projections for North America vs EMEA? Include risks from the report.' },
    {
        role: 'ai',
        content: 'Based on **2024_Financial_Q3_Report.pdf**, here is the comparative analysis for Q4:',
        hasTables: true,
        risks: [
            { icon: 'warn',  text: "Regulatory Delays: EU regulations could impact EMEA's timeline by 4-6 weeks." },
            { icon: 'alert', text: 'Supply Chain Volatility: North American hardware lead times remain unstable.' },
            { icon: 'info',  text: 'Currency Fluctuations: Strengthening USD impacts European translation gains.' },
        ],
    },
];

function RevenueTable() {
    return (
        <div className="my-3 overflow-hidden rounded-[var(--radius-md)] border border-outline-variant/15">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-surface-container text-on-surface-variant">
                        <th className="px-3 py-2 text-left">Region</th>
                        <th className="px-3 py-2 text-right">Q4 Proj.</th>
                        <th className="px-3 py-2 text-right">vs Q3</th>
                        <th className="px-3 py-2 text-right">Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        { r: 'North America', q4: '$142.8M', ch: '+8.4%', conf: 'ready' as const },
                        { r: 'EMEA',          q4: '$98.3M',  ch: '+3.1%', conf: 'processing' as const },
                    ].map((row) => (
                        <tr key={row.r} className="border-t border-outline-variant/10 hover:bg-surface-container-low">
                            <td className="px-3 py-2 font-medium text-on-surface">{row.r}</td>
                            <td className="px-3 py-2 text-right text-on-surface">{row.q4}</td>
                            <td className="px-3 py-2 text-right text-primary">{row.ch}</td>
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
            <FileText size={10} className="text-on-surface-variant" /> {doc} · {page}
        </span>
    );
}

const riskIcons = { warn: AlertTriangle, alert: AlertCircle, info: Info };
const riskColors: Record<RiskIcon, string> = {
    warn:  'bg-error-container text-on-error-container',
    alert: 'text-on-tertiary-container bg-tertiary-container',
    info:  'text-primary bg-primary-container',
};

export default function AdminChat() {
    const [input, setInput] = useState('');
    const [activeDoc, setActiveDoc] = useState(allDocs[0]);
    const [docSearch, setDocSearch] = useState('');
    const filteredDocs = allDocs.filter((d) => d.name.toLowerCase().includes(docSearch.toLowerCase()));

    return (
        <AdminLayout activePath="/admin/chat">
            <Head title="Admin — Chat" />

            {/* Full-height two-column layout */}
            <div className="-m-6 flex h-[calc(100vh-3.5rem)] overflow-hidden">

                {/* Chat history col */}
                <div className="hidden w-56 shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-lowest lg:flex">
                    <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">History</p>
                        <button className="rounded p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                            <Plus size={13} />
                        </button>
                    </div>
                    <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
                        {chatHistory.map((c) => (
                            <button key={c.id} className={`w-full rounded-[var(--radius-md)] px-3 py-2.5 text-left text-xs transition-colors ${c.active ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
                                <p className="line-clamp-2 leading-relaxed">{c.title}</p>
                            </button>
                        ))}
                    </div>

                    {/* All docs panel */}
                    <div className="border-t border-outline-variant/15 p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">All Documents</p>
                        <div className="relative mb-2">
                            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                            <Input className="h-7 pl-7 text-[11px]" placeholder="Search…" value={docSearch} onChange={(e) => setDocSearch(e.target.value)} />
                        </div>
                        {filteredDocs.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => doc.status === 'ready' && setActiveDoc(doc)}
                                disabled={doc.status !== 'ready'}
                                className={`flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-[11px] disabled:opacity-40 ${activeDoc.id === doc.id ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                <FileText size={10} className="shrink-0" />
                                <span className="flex-1 truncate text-left">{doc.name.split('.')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat col */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Active doc bar */}
                    <div className="flex items-center gap-3 border-b border-outline-variant/15 bg-surface-container-low px-5 py-2.5">
                        <BookOpen size={13} className="shrink-0 text-on-surface-variant" />
                        <span className="text-xs text-on-surface-variant">Chatting with:</span>
                        <span className="flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-xs font-medium text-primary">
                            <FileText size={10} /> {activeDoc.name}
                        </span>
                        <span className="ml-auto rounded-full bg-surface-container px-2.5 py-1 text-[10px] font-medium text-on-surface-variant">
                            Admin — Full Access
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-5 overflow-y-auto p-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.role === 'ai' ? 'bg-primary-gradient text-primary-foreground' : 'bg-tertiary-container text-on-tertiary-container'}`}>
                                    {msg.role === 'ai' ? <MessageSquare size={13} /> : 'AD'}
                                </div>
                                <div className={`max-w-2xl rounded-[var(--radius-lg)] p-4 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-on-surface'}`}>
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
                                                <Citation doc="2024_Financial_Q3_Report.pdf" page="p.18" />
                                            </div>
                                        </>
                                    ) : <p>{msg.content}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="border-t border-outline-variant/15 bg-surface-container-low px-5 py-4">
                        <div className="flex items-end gap-2 rounded-[var(--radius-lg)] border-ghost bg-surface-container-lowest p-3">
                            <button className="mb-0.5 text-on-surface-variant hover:text-on-surface"><Paperclip size={16} /></button>
                            <textarea
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 resize-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                                placeholder={`Ask anything about ${activeDoc.name.split('_')[0]}…`}
                            />
                            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground disabled:opacity-40" disabled={!input.trim()}>
                                <Send size={14} />
                            </button>
                        </div>
                        <p className="mt-2 text-center text-[10px] text-on-surface-variant">
                            Admin has full access to all documents. Answers cite source pages.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
