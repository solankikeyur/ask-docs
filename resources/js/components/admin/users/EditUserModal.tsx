import { useForm } from '@inertiajs/react';
import { X, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminUser } from '@/types/admin/user';

interface EditUserModalProps {
    user: AdminUser;
    onClose: () => void;
}

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`, {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm px-4">
            <form onSubmit={submit} className="w-full max-w-md rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-on-surface text-lg">Edit User</h2>
                        <p className="text-xs text-on-surface-variant">Update user details and access level.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Full Name</label>
                        <Input 
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="e.g. Elena Torres" 
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Email Address</label>
                        <Input 
                            type="email" 
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="elena@company.com" 
                            required
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Role</label>
                        <select 
                            value={data.role}
                            onChange={e => setData('role', e.target.value as any)}
                            className="w-full rounded-[var(--radius-md)] border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
                        >
                            <option value="viewer">Viewer</option>
                            <option value="admin">Admin</option>
                        </select>
                        <InputError message={errors.role} className="mt-1" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Status</label>
                        <select 
                            value={data.status ? '1' : '0'}
                            onChange={e => setData('status', e.target.value === '1' ? true : false)}
                            className="w-full rounded-[var(--radius-md)] border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
                        >
                            <option value="1">Enabled</option>
                            <option value="0">Disabled</option>
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-2 border-t border-outline-variant/10 pt-4">
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={processing}>Cancel</Button>
                    <Button size="sm" disabled={processing} className="gap-2">
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Update User
                    </Button>
                </div>
            </form>
        </div>
    );
}
