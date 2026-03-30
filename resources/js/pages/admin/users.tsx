import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search, UserPlus, Mail, MoreHorizontal, Shield, Clock,
    TrendingUp, FileText, X, Check, Eye, EyeOff, Trash2, MessageSquare,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Analyst' | 'Viewer';
    status: 'ready' | 'processing' | 'failed';
    statusLabel: string;
    assignedDocs: string[];
    lastActive: string;
}

const ALL_DOCS = [
    '2024_Financial_Q3_Report.pdf',
    'Market_Analysis_Europe_v2.docx',
    'Legal_Review_ProjectX.pdf',
    'Employee_Handbook_v5.docx',
    'Product_Roadmap_Q4.key',
];

const INITIAL_USERS: User[] = [
    { id: 1, name: 'Sarah Chen',     email: 'sarah.chen@company.com',   role: 'Admin',   status: 'ready',      statusLabel: 'Active',   assignedDocs: ['2024_Financial_Q3_Report.pdf', 'Legal_Review_ProjectX.pdf'], lastActive: '2 min ago' },
    { id: 2, name: 'James Okonkwo',  email: 'j.okonkwo@company.com',    role: 'Analyst', status: 'ready',      statusLabel: 'Active',   assignedDocs: ['2024_Financial_Q3_Report.pdf', 'Market_Analysis_Europe_v2.docx'], lastActive: '1 hr ago' },
    { id: 3, name: 'Priya Nair',     email: 'p.nair@company.com',       role: 'Analyst', status: 'processing', statusLabel: 'Away',     assignedDocs: ['Market_Analysis_Europe_v2.docx'], lastActive: '3 hrs ago' },
    { id: 4, name: 'Marcus Webb',    email: 'm.webb@company.com',       role: 'Viewer',  status: 'failed',     statusLabel: 'Inactive', assignedDocs: [], lastActive: '14 days ago' },
];

const roleColors: Record<string, string> = {
    Admin:   'bg-primary-container text-primary',
    Analyst: 'bg-tertiary-container text-tertiary',
    Viewer:  'bg-secondary-container text-secondary',
};

// ─── Create User Modal ────────────────────────────────────────
function CreateUserModal({ onClose }: { onClose: () => void }) {
    const [showPass, setShowPass] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-on-surface">Create New User</h2>
                        <p className="text-xs text-on-surface-variant">User will receive a login email with their credentials.</p>
                    </div>
                    <button onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Full Name</label>
                        <Input placeholder="e.g. Elena Torres" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Email Address</label>
                        <Input type="email" placeholder="elena@company.com" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Temporary Password</label>
                        <div className="relative">
                            <Input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" className="pr-9" />
                            <button
                                onClick={() => setShowPass((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                            >
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Role</label>
                        <select className="w-full rounded-[var(--radius-md)] border-ghost bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/15">
                            <option>Viewer</option>
                            <option>Analyst</option>
                            <option>Admin</option>
                        </select>
                    </div>
                </div>

                <p className="mt-4 rounded-[var(--radius-md)] bg-primary-container px-3 py-2 text-xs text-on-primary-container">
                    <strong>Next:</strong> After creating the user, use "Manage Access" to assign documents they can chat with.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm">Create User & Send Invite</Button>
                </div>
            </div>
        </div>
    );
}

// ─── Manage Access Modal ──────────────────────────────────────
function ManageAccessModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (docs: string[]) => void }) {
    const [selected, setSelected] = useState<string[]>(user.assignedDocs);
    const toggle = (doc: string) =>
        setSelected((prev) => prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient">
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="font-semibold text-on-surface">Manage Document Access</h2>
                        <div className="mt-1 flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-gradient text-[9px] font-bold text-primary-foreground">
                                {user.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="text-xs text-on-surface-variant">{user.name}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low"><X size={16} /></button>
                </div>

                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                    Select documents this user can chat with
                </p>

                <div className="space-y-2">
                    {ALL_DOCS.map((doc) => {
                        const active = selected.includes(doc);
                        return (
                            <button
                                key={doc}
                                onClick={() => toggle(doc)}
                                className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] p-3 text-left transition-colors ${
                                    active ? 'bg-primary-container' : 'bg-surface-container hover:bg-surface-container-low'
                                }`}
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${active ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                                    <FileText size={14} className={active ? 'text-primary-foreground' : 'text-on-surface-variant'} />
                                </div>
                                <span className={`flex-1 truncate text-sm font-medium ${active ? 'text-primary' : 'text-on-surface'}`}>{doc}</span>
                                {active && <Check size={14} className="text-primary shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm" onClick={() => { onSave(selected); onClose(); }}>
                        Save Access ({selected.length} docs)
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Admin Users Page ─────────────────────────────────────────
export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [showCreate, setShowCreate] = useState(false);
    const [manageUser, setManageUser] = useState<User | null>(null);

    const saveAccess = (userId: number, docs: string[]) =>
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, assignedDocs: docs } : u));

    return (
        <AdminLayout activePath="/admin/users">
            <Head title="Admin — Users" />
            {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
            {manageUser && (
                <ManageAccessModal
                    user={manageUser}
                    onClose={() => setManageUser(null)}
                    onSave={(docs) => saveAccess(manageUser.id, docs)}
                />
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">Users</h1>
                        <p className="mt-0.5 text-sm text-on-surface-variant">
                            Create users and manage which documents they can chat with.
                        </p>
                    </div>
                    <Button size="sm" className="gap-2 w-fit" onClick={() => setShowCreate(true)}>
                        <UserPlus size={14} /> Create User
                    </Button>
                </div>

                {/* Insight cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-4">
                        <div className="mb-1 flex items-center gap-2 text-xs text-on-surface-variant"><Shield size={12} /> Seats Used</div>
                        <p className="text-2xl font-bold text-on-surface">4 / 12</p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                            <div className="h-full w-1/3 rounded-full bg-primary-gradient" />
                        </div>
                    </div>
                    <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-4">
                        <div className="mb-1 flex items-center gap-2 text-xs text-on-surface-variant"><TrendingUp size={12} /> Activity Pulse</div>
                        <p className="text-2xl font-bold text-on-surface">85%</p>
                        <p className="mt-1 text-xs text-on-surface-variant">of users performed a chat in the last 24h.</p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] bg-surface-container-low p-4">
                        <div className="mb-1 flex items-center gap-2 text-xs text-on-surface-variant"><Clock size={12} /> Unassigned Users</div>
                        <p className="text-2xl font-bold text-error">1</p>
                        <p className="mt-1 text-xs text-on-surface-variant">Marcus Webb has 0 documents assigned.</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <Input className="pl-9" placeholder="Search users…" />
                </div>

                {/* User list */}
                <div className="overflow-hidden rounded-[var(--radius-lg)] bg-surface-container-low">
                    <div className="border-b border-outline-variant/10 px-4 py-2 text-xs uppercase tracking-widest text-on-surface-variant">
                        {users.length} users
                    </div>

                    {users.map((user) => (
                        <div key={user.id} className="border-b border-outline-variant/10 px-4 py-4 transition-colors hover:bg-surface-container">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-sm font-bold text-primary-foreground">
                                    {user.name.split(' ').map((n) => n[0]).join('')}
                                </div>

                                {/* Name & email */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-on-surface">{user.name}</p>
                                    <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                                        <Mail size={10} /> {user.email}
                                    </div>
                                </div>

                                {/* Role */}
                                <span className={`hidden rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider sm:inline ${roleColors[user.role]}`}>
                                    {user.role}
                                </span>

                                {/* Status */}
                                <Badge variant={user.status}>{user.statusLabel}</Badge>

                                {/* Last active */}
                                <p className="hidden text-xs text-on-surface-variant lg:block">{user.lastActive}</p>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setManageUser(user)}
                                        className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary-container px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                    >
                                        <FileText size={12} /> Manage Access
                                    </button>
                                    <button className="rounded p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary">
                                        <MessageSquare size={14} />
                                    </button>
                                    <button className="rounded p-1.5 text-on-surface-variant hover:bg-error-container hover:text-error">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Assigned docs */}
                            {user.assignedDocs.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-1.5 pl-14">
                                    {user.assignedDocs.map((doc) => (
                                        <span key={doc} className="flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-0.5 text-[11px] text-on-surface-variant">
                                            <FileText size={9} className="text-primary" />
                                            {doc}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 pl-14 text-xs italic text-error/70">
                                    No documents assigned — this user cannot chat yet.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
