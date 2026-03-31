import { useState } from 'react';
import { BookOpen, FileText, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Doc {
    id: number;
    name: string;
    status: 'ready' | 'processing';
}

interface DocSelectorProps {
    active: Doc;
    docs: Doc[];
    onSelect: (d: Doc) => void;
}

function DocSelector({ active, docs, onSelect }: DocSelectorProps) {
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
                            onClick={() => {
                                onSelect(doc);
                                setOpen(false);
                            }}
                            disabled={doc.status !== 'ready'}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-surface-container-low disabled:opacity-40"
                        >
                            <FileText size={12} className="shrink-0 text-primary-fixed-dim" />
                            <span className="flex-1 truncate text-on-surface">{doc.name}</span>
                            <Badge variant={doc.status} className="h-4 text-[10px]">
                                {doc.status}
                            </Badge>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface ChatHeaderProps {
    activeDoc: Doc;
    docs: Doc[];
    onDocSelect: (doc: Doc) => void;
}

export function ChatHeader({ activeDoc, docs, onDocSelect }: ChatHeaderProps) {
    return (
        <div className="flex items-center gap-3 border-b border-outline-variant/15 bg-surface-container-low px-4 py-2">
            <BookOpen size={13} className="shrink-0 text-on-surface-variant" />
            <span className="text-xs text-on-surface-variant">Chatting with:</span>
            <DocSelector active={activeDoc} docs={docs} onSelect={onDocSelect} />
            <span className="ml-auto text-[10px] text-on-surface-variant">
                Only your assigned documents appear here
            </span>
        </div>
    );
}
