import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText, Upload, Search, Trash2, Eye,
    X, HardDrive, Filter, Check, Users,
} from 'lucide-react';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';
import { Pagination } from '@/components/admin/Pagination';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout>;
    const debounced = function (...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timeoutId);

    return debounced;
}

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

interface PaginatedDocs {
    data: Doc[];
    links: { url: string | null; label: string; active: boolean }[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

const ALL_USERS = ['Sarah Chen', 'James Okonkwo', 'Priya Nair', 'Marcus Webb', 'Elena Torres'];

// ─── Assign Modal (Unchanged from before but kept for completeness) ──────────
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

// ─── Upload Modal (Simplified from before) ──────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
    const [dragging, setDragging] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        document: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/documents', {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient">
                <form onSubmit={submit}>
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-on-surface">Upload Document</h2>
                            <p className="text-xs text-on-surface-variant">Uploaded docs can be assigned to users after indexing.</p>
                        </div>
                        <button type="button" onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low">
                            <X size={16} />
                        </button>
                    </div>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            if (e.dataTransfer.files[0]) setData('document', e.dataTransfer.files[0]);
                        }}
                        className={`flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed p-10 text-center transition-all ${
                            dragging ? 'border-primary bg-primary-container/20' : 'border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low'
                        }`}
                    >
                        <Upload size={28} className={dragging ? 'text-primary' : 'text-on-surface-variant'} />
                        {data.document ? (
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-primary">{data.document.name}</p>
                                <p className="text-xs text-on-surface-variant">{(data.document.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-on-surface">Drag & Drop files here or browse</p>
                        )}
                        <input type="file" id="file-upload" className="hidden" onChange={(e) => setData('document', e.target.files?.[0] || null)} />
                        <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                            {data.document ? 'Change File' : 'Browse Files'}
                        </Button>
                    </div>
                    {errors.document && <p className="mt-2 text-xs text-error font-medium">{errors.document}</p>}
                    <div className="mt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                        <Button size="sm" disabled={processing || !data.document}>{processing ? 'Uploading…' : 'Upload & Index'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Admin Documents Page ─────────────────────────────────────
export default function AdminDocuments({ documents }: { documents: PaginatedDocs }) {
    const [showUpload, setShowUpload] = useState(false);
    const [assignDoc, setAssignDoc] = useState<Doc | null>(null);
    const [deleteDoc, setDeleteDoc] = useState<Doc | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle debounced search
    const debouncedSearch = useState(() => debounce((q: string) => {
        router.get('/admin/documents', { search: q }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    }, 400))[0];

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const confirmDelete = () => {
        if (!deleteDoc) return;
        router.delete(`/admin/documents/${deleteDoc.id}`, {
            onSuccess: () => setDeleteDoc(null),
        });
    };

    const saveAssignment = (docId: number, users: string[]) => {
        console.log('Assignment saved locally (simulated):', docId, users);
        setAssignDoc(null);
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

            <ConfirmationDialog
                isOpen={!!deleteDoc}
                onClose={() => setDeleteDoc(null)}
                onConfirm={confirmDelete}
                title="Delete Document"
                description={`Are you sure you want to delete "${deleteDoc?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
            />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">Documents</h1>
                        <p className="mt-0.5 text-sm text-on-surface-variant">
                            Manage and assign documents to your team.
                        </p>
                    </div>
                    <Button size="sm" className="gap-2 w-fit" onClick={() => setShowUpload(true)}>
                        <Upload size={14} /> Upload Document
                    </Button>
                </div>

                <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-on-surface-variant"><HardDrive size={12} /> Storage Usage</span>
                        <span className="font-medium text-on-surface">12.8 GB used of 20 GB quota</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                        <div className="h-full w-[64%] rounded-full bg-primary-gradient" />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                        <Input
                            className="pl-9"
                            placeholder="Search documents…"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5"><Filter size={13} /> Filter</Button>
                </div>

                <div className="overflow-hidden rounded-[var(--radius-lg)] bg-surface-container-low">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-outline-variant/10 text-[11px] uppercase tracking-widest text-on-surface-variant">
                                <th className="px-4 py-3 text-left">Document</th>
                                <th className="hidden px-4 py-3 text-left sm:table-cell">Type / Size</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="hidden px-4 py-3 text-left md:table-cell">Assigned To</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                                        No documents found.
                                    </td>
                                </tr>
                            ) : (
                                documents.data.map((doc) => (
                                    <tr key={doc.id} className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary-container text-primary">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-on-surface" title={doc.name}>{doc.name}</p>
                                                    <p className="text-[10px] text-on-surface-variant sm:hidden">{doc.type} · {doc.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden px-4 py-3 sm:table-cell">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-semibold text-on-surface uppercase">{doc.type}</span>
                                                <span className="text-[11px] text-on-surface-variant">{doc.size}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={doc.status}>{doc.status}</Badge>
                                        </td>
                                        <td className="hidden px-4 py-3 md:table-cell">
                                            <span className="text-xs text-on-surface-variant/70 italic">Click Assign to manage</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => setAssignDoc(doc)}
                                                    title="Assign"
                                                >
                                                    <Users size={14} className="text-primary" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => setDeleteDoc(doc)}
                                                    className="hover:text-error"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="flex items-center justify-between border-t border-outline-variant/10 px-4 py-3">
                        <p className="text-xs text-on-surface-variant">
                            Showing {documents.data.length} of {documents.meta?.total || 0} results
                        </p>
                        <Pagination links={documents.links} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
