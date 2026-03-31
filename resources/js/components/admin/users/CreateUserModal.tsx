import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';

interface CreateUserModalProps {
    onClose: () => void;
}

export default function CreateUserModal({ onClose }: CreateUserModalProps) {
    const [showPass, setShowPass] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'viewer' as 'admin' | 'viewer',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm px-4">
            <form onSubmit={submit} className="w-full max-w-md rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-on-surface text-lg">Create New User</h2>
                        <p className="text-xs text-on-surface-variant">User will receive a login email with their credentials.</p>
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
                        <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">Password</label>
                        <div className="relative">
                            <Input
                                type={showPass ? 'text' : 'password'}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Min. 8 characters"
                                className="pr-9"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1" />
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
                </div>

                <p className="mt-6 rounded-[var(--radius-md)] bg-primary-container px-3 py-2 text-xs text-on-primary-container leading-relaxed">
                    <strong>Next:</strong> After creating the user, use "Manage Access" to assign documents they can chat with.
                </p>

                <div className="mt-6 flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={processing}>Cancel</Button>
                    <Button size="sm" disabled={processing} className="gap-2">
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Create User
                    </Button>
                </div>
            </form>
        </div>
    );
}
