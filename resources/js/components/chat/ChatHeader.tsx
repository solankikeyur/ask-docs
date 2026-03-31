import { BookOpen, FileText, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { Doc } from '@/types/chat';

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
                className="flex items-center gap-1.5 rounded-full bg-sidebar-accent/50 px-2.5 py-1 text-[11px] text-on-surface hover:bg-sidebar-accent transition-colors"
            >
                <FileText size={10} className="text-secondary" />
                <span className="max-w-[120px] truncate">{active.name}</span>
                <ChevronDown size={10} className="text-on-surface-variant" />
            </button>
            {open && (
                <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md border border-border">
                    {docs.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => {
                                onSelect(doc);
                                setOpen(false);
                            }}
                            disabled={doc.status !== 'ready'}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
                        >
                            <FileText size={12} className="shrink-0 text-secondary" />
                            <span className="flex-1 truncate">{doc.name}</span>
                            <Badge variant={doc.status} className="h-4 text-[9px] px-1 capitalize">
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
        <div className="flex items-center gap-3 py-1">
            <BookOpen size={14} className="shrink-0 text-muted-foreground" />
            <span className="text-xs font-medium">Chatting with:</span>
            <DocSelector active={activeDoc} docs={docs} onSelect={onDocSelect} />
            <span className="hidden ml-auto text-[10px] text-muted-foreground md:inline">
                Only assigned documents available
            </span>
        </div>
    );
}
