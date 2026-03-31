import { X, Check, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AdminUser } from '@/types/admin/user';

interface ManageAccessModalProps {
    user: AdminUser;
    allDocuments: { id: number; name: string }[];
    onClose: () => void;
    onSave: (docIds: number[]) => void;
}

export default function ManageAccessModal({ user, allDocuments, onClose, onSave }: ManageAccessModalProps) {
    // Note: user.assignedDocIds should be provided by the controller
    const [selected, setSelected] = useState<number[]>(user.assignedDocIds || []);

    const toggle = (docId: number) =>
        setSelected((prev) => prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient">
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="font-semibold text-on-surface text-lg">Manage Document Access</h2>
                        <div className="mt-1 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-gradient text-[10px] font-bold text-primary-foreground">
                                {user.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="text-sm text-on-surface-variant font-medium">{user.name}</span>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low">
                        <X size={20} />
                    </button>
                </div>

                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface-variant opacity-70">
                    Select shared documents
                </p>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin">
                    {allDocuments.length > 0 ? (
                        allDocuments.map((doc) => {
                            const active = selected.includes(doc.id);

                            return (
                                <button
                                    key={doc.id}
                                    type="button"
                                    onClick={() => toggle(doc.id)}
                                    className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] p-3 text-left transition-all border ${
                                        active ? 'bg-primary-container border-primary/20' : 'bg-surface-container border-transparent hover:bg-surface-container-low'
                                    }`}
                                >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${active ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                                        <FileText size={16} className={active ? 'text-primary-foreground' : 'text-on-surface-variant'} />
                                    </div>
                                    <span className={`flex-1 truncate text-sm font-medium ${active ? 'text-primary' : 'text-on-surface'}`}>{doc.name}</span>
                                    {active && <Check size={16} className="text-primary shrink-0" />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-6 border-2 border-dashed border-outline-variant rounded-[var(--radius-md)]">
                            <p className="text-sm text-on-surface-variant">No documents available to assign.</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-outline-variant/10 pt-4">
                    <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm" onClick={() => {
 onSave(selected); 
}}>
                        Save Access ({selected.length})
                    </Button>
                </div>
            </div>
        </div>
    );
}
