import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText, Upload, Search, Trash2, Eye, UserPlus,
    X, HardDrive, Filter, Check, Users,
} from 'lucide-react';

type DocStatus = 'ready' | 'processing' | 'failed';

interface Doc {
    id: number;
    name: string;
    size: string;
    type: string;
    status: DocStatus;
    assignedTo: string[];   // user names
    updated: string;
}

const ALL_USERS = ['Sarah Chen', 'James Okonkwo', 'Priya Nair', 'Marcus Webb', 'Elena Torres'];

const INITIAL_DOCS: Doc[] = [
    { id: 1, name: '2024_Financial_Q3_Report.pdf',    size: '4.2 MB',  type: 'PDF',     status: 'ready',      assignedTo: ['Sarah Chen', 'James Okonkwo'], updated: '2h ago' },
    { id: 2, name: 'Market_Analysis_Europe_v2.docx',  size: '1.8 MB',  type: 'DOCX',    status: 'ready',      assignedTo: ['Priya Nair'],                  updated: 'yesterday' },
    { id: 3, name: 'Customer_Feedback_Raw_Data.csv',  size: '12.5 MB', type: 'CSV',     status: 'processing', assignedTo: [],                              updated: '5 min ago' },
    { id: 4, name: 'Product_Roadmap_Q4.key',          size: '8.9 MB',  type: 'Keynote', status: 'failed',     assignedTo: [],                              updated: '1 week ago' },
    { id: 5, name: 'Legal_Review_ProjectX.pdf',       size: '2.1 MB',  type: 'PDF',     status: 'ready',      assignedTo: ['Sarah Chen'],                  updated: '3 days ago' },
    { id: 6, name: 'Employee_Handbook_v5.docx',       size: '0.9 MB',  type: 'DOCX',    status: 'ready',      assignedTo: [],                              updated: '1 month ago' },
];

// ─── Assign Modal ─────────────────────────────────────────────
function AssignModal({ doc, onClose, onSave }: { doc: Doc; onClose: () => void; onSave: (ids: string[]) => void }) {
    const [selected, setSelected] = useState<string[]>(doc.assignedTo);

    const toggle = (name: string) =>
        setSelected((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient">
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="font-semibold text-on-surface">Assign Document</h2>
                        <p className="mt-0.5 max-w-[260px] truncate text-xs text-on-surface-variant">{doc.name}</p>
                    </div>
                    <button onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low">
                        <X size={16} />
                    </button>
                </div>

                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                    Select users who can access this document
                </p>

                <div className="space-y-2">
                    {ALL_USERS.map((name) => {
                        const active = selected.includes(name);
                        return (
                            <button
                                key={name}
                                onClick={() => toggle(name)}
                                className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] p-3 text-left transition-colors ${
                                    active ? 'bg-primary-container' : 'bg-surface-container hover:bg-surface-container-low'
                                }`}
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-xs font-bold text-primary-foreground">
                                    {name.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <span className={`flex-1 text-sm font-medium ${active ? 'text-primary' : 'text-on-surface'}`}>{name}</span>
                                {active && <Check size={14} className="text-primary" />}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm" onClick={() => { onSave(selected); onClose(); }}>
                        Save Assignment ({selected.length} users)
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Upload Modal ─────────────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
    const [dragging, setDragging] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-on-surface">Upload Document</h2>
                        <p className="text-xs text-on-surface-variant">Uploaded docs can be assigned to users after indexing.</p>
                    </div>
                    <button onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low">
                        <X size={16} />
                    </button>
                </div>
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={() => setDragging(false)}
                    className={`flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed p-10 text-center transition-all ${
                        dragging ? 'border-primary bg-primary-container/20' : 'border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low'
                    }`}
                >
                    <Upload size={28} className={dragging ? 'text-primary' : 'text-on-surface-variant'} />
                    <p className="text-sm font-medium text-on-surface">Drag & Drop PDF, DOCX, TXT, CSV files here</p>
                    <p className="text-xs text-on-surface-variant">or browse from your computer</p>
                    <Button variant="secondary" size="sm">Browse Files</Button>
                </div>
                <p className="mt-3 rounded-[var(--radius-md)] bg-primary-container px-3 py-2 text-xs text-on-primary-container">
                    <strong>After upload:</strong> Go to the Users page to assign this document to specific users.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm">Upload & Index</Button>
                </div>
            </div>
        </div>
    );
}

// ─── Admin Documents Page ─────────────────────────────────────
export default function AdminDocuments() {
    const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
    const [showUpload, setShowUpload] = useState(false);
    const [assignDoc, setAssignDoc] = useState<Doc | null>(null);
    const [query, setQuery] = useState('');

    const filtered = docs.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));

    const saveAssignment = (docId: number, users: string[]) => {
        setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, assignedTo: users } : d));
    };

    return (
        <AdminLayout activePath="/admin/documents">
            <Head title="Admin — Documents" />
            {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
            {assignDoc && (
                <AssignModal
                    doc={assignDoc}
                    onClose={() => setAssignDoc(null)}
                    onSave={(users) => saveAssignment(assignDoc.id, users)}
                />
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">Documents</h1>
                        <p className="mt-0.5 text-sm text-on-surface-variant">
                            Upload documents, then assign them to specific users.
                        </p>
                    </div>
                    <Button size="sm" className="gap-2 w-fit" onClick={() => setShowUpload(true)}>
                        <Upload size={14} /> Upload Document
                    </Button>
                </div>

                {/* Storage */}
                <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-on-surface-variant"><HardDrive size={12} /> Storage Usage</span>
                        <span className="font-medium text-on-surface">12.8 GB of 20 GB enterprise quota used</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                        <div className="h-full w-[64%] rounded-full bg-primary-gradient" />
                    </div>
                </div>

                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                        <Input className="pl-9" placeholder="Search documents…" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5"><Filter size={13} /> Filter</Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-[var(--radius-lg)] bg-surface-container-low">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-outline-variant/10 text-[11px] uppercase tracking-widest text-on-surface-variant">
                                <th className="px-4 py-3 text-left">Document</th>
                                <th className="px-4 py-3 text-left">Type / Size</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Assigned To</th>
                                <th className="px-4 py-3 text-left">Updated</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((doc) => (
                                <tr key={doc.id} className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <FileText size={14} className="shrink-0 text-primary-fixed-dim" />
                                            <span className="max-w-[200px] truncate font-medium text-on-surface">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="inline-block w-fit rounded bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">{doc.type}</span>
                                            <span className="text-xs text-on-surface-variant">{doc.size}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={doc.status}>{doc.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        {doc.assignedTo.length === 0 ? (
                                            <span className="text-xs italic text-on-surface-variant/50">Not assigned</span>
                                        ) : (
                                            <div className="flex -space-x-1.5">
                                                {doc.assignedTo.slice(0, 3).map((name) => (
                                                    <div
                                                        key={name}
                                                        title={name}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-container-low bg-primary-gradient text-[9px] font-bold text-primary-foreground"
                                                    >
                                                        {name.split(' ').map((n) => n[0]).join('')}
                                                    </div>
                                                ))}
                                                {doc.assignedTo.length > 3 && (
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-container-low bg-surface-container text-[9px] text-on-surface-variant">
                                                        +{doc.assignedTo.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-on-surface-variant">{doc.updated}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setAssignDoc(doc)}
                                                title="Assign to users"
                                                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary-container"
                                            >
                                                <Users size={12} /> Assign
                                            </button>
                                            <button title="Preview" className="rounded p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                                                <Eye size={13} />
                                            </button>
                                            <button title="Delete" className="rounded p-1 text-on-surface-variant hover:bg-error-container hover:text-error">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between px-4 py-3 text-xs text-on-surface-variant">
                        <span>Showing {filtered.length} of 128 results</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, '…', 32].map((p, i) => (
                                <button key={i} className={`min-w-[28px] rounded px-2 py-1 ${p === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-surface-container text-on-surface-variant'}`}>{p}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
