import { FileText, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Doc {
    id: number;
    name: string;
    status: 'ready' | 'processing';
}

interface DocSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documents: Doc[];
    onSelect: (doc: Doc) => void;
}

export function DocSelectionModal({ open, onOpenChange, documents, onSelect }: DocSelectionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select a Document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
                        Your Assigned Documents
                    </p>
                    <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-2">
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => onSelect(doc)}
                                    disabled={doc.status !== 'ready'}
                                    className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] bg-surface-container-low p-3 text-left transition-colors hover:bg-surface-container disabled:opacity-40"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-container">
                                        <FileText size={14} className="text-primary" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate text-sm font-medium text-on-surface">{doc.name}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-on-surface-variant" />
                                </button>
                            ))
                        ) : (
                            <p className="text-center py-10 text-sm text-on-surface-variant">
                                No documents assigned yet.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
