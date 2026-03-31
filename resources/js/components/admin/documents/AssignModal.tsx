import { useForm } from '@inertiajs/react';
import { X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Doc } from '@/types/admin';

interface AssignModalProps {
    doc: Doc;
    allUsers: { id: number; name: string }[];
    onClose: () => void;
}

export function AssignModal({ doc, allUsers, onClose }: AssignModalProps) {
    const { data, setData, post, processing } = useForm({
        userIds: doc.assignedUserIds || [],
    });

    const toggle = (id: number) => {
        const current = data.userIds;
        const next = current.includes(id) 
            ? current.filter(i => i !== id) 
            : [...current, id];
        setData('userIds', next);
    };

    const handleSave = () => {
        post(`/admin/documents/${doc.id}/assign`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient animate-in fade-in zoom-in duration-200">
                <div className="mb-5 flex items-start justify-between">
                    <div className="min-w-0">
                        <h2 className="font-semibold text-on-surface">Assign Document</h2>
                        <p className="mt-0.5 max-w-[260px] truncate text-xs text-on-surface-variant">
                            {doc.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[350px] space-y-2 overflow-y-auto px-1 py-1">
                    {allUsers.map((user) => {
                        const active = data.userIds.includes(user.id);

                        return (
                            <button
                                key={user.id}
                                onClick={() => toggle(user.id)}
                                disabled={processing}
                                className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] p-3 text-left transition-all ${
                                    active
                                        ? 'bg-primary-container ring-1 ring-primary/20'
                                        : 'bg-surface-container hover:bg-surface-container-high'
                                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-[10px] font-bold text-primary-foreground shadow-sm">
                                    {user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </div>
                                <span
                                    className={`flex-1 text-sm font-medium ${
                                        active ? 'text-primary' : 'text-on-surface'
                                    }`}
                                >
                                    {user.name}
                                </span>
                                {active && (
                                    <div className="rounded-full bg-primary p-0.5 text-white shadow-sm">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} className="px-6 gap-2" disabled={processing}>
                        {processing && <Loader2 size={14} className="animate-spin" />}
                        {processing ? 'Sending...' : 'Send Assignment'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
