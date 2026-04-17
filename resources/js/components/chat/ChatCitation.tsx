import { FileText } from 'lucide-react';

interface ChatCitationProps {
    doc: string;
    pages: (string | number)[];
}

export function ChatCitation({ doc, pages }: ChatCitationProps) {
    if (!pages) return null;

    const pageDisplay = Array.isArray(pages) ? pages.join(', ') : pages;

    return (
        <span className="inline-flex items-center gap-1 rounded bg-surface-variant px-2 py-0.5 text-[11px] text-on-surface">
            <FileText size={10} className="text-on-surface-variant" />
            {doc} · Pages: {pageDisplay}
        </span>
    );
}
