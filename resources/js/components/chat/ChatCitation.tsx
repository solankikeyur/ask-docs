import { FileText } from 'lucide-react';

interface ChatCitationProps {
    doc: string;
    page: string;
}

export function ChatCitation({ doc, page }: ChatCitationProps) {
    return (
        <span className="inline-flex items-center gap-1 rounded bg-surface-variant px-2 py-0.5 text-[11px] text-on-surface">
            <FileText size={10} className="text-on-surface-variant" />
            {doc} · {page}
        </span>
    );
}
