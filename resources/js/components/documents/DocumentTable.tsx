import { FileText, Users, Trash2, Download } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Doc, PaginatedDocs } from '@/types/admin';

interface DocumentTableProps {
    documents: PaginatedDocs;
    onDelete: (doc: Doc) => void;
}

export function DocumentTable({ documents, onDelete }: DocumentTableProps) {
    return (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-outline-variant/10 bg-surface-container-low transition-all">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-outline-variant/10 bg-surface-container/30 text-[10px] sm:text-[11px] uppercase tracking-widest text-on-surface-variant/70">
                            <th className="px-4 py-3 sm:px-5 sm:py-4 text-left font-semibold">Document</th>
                            <th className="hidden px-4 py-3 sm:px-5 sm:py-4 text-left font-semibold sm:table-cell">Type / Size</th>
                            <th className="px-4 py-3 sm:px-5 sm:py-4 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 sm:px-5 sm:py-4 text-left font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center animate-in fade-in transition-all">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/40">
                                            <FileText size={24} />
                                        </div>
                                        <p className="text-on-surface-variant text-sm font-medium">No documents found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            documents.data.map((doc, idx) => (
                                <tr
                                    key={doc.id}
                                    className="group border-b border-outline-variant/5 transition-all hover:bg-surface-container"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <td className="px-4 py-3 sm:px-5 sm:py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container/30 text-primary transition-transform group-hover:scale-105">
                                                <FileText size={18} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="truncate font-semibold text-on-surface leading-tight"
                                                    title={doc.name}
                                                >
                                                    {doc.name}
                                                </p>
                                                <p className="mt-1 text-[10px] text-on-surface-variant/60 sm:hidden">
                                                    {doc.type} · {doc.size}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 sm:px-5 sm:py-4 sm:table-cell">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                                                {doc.type}
                                            </span>
                                            <span className="text-[10px] text-on-surface-variant/70 italic font-medium">
                                                {doc.size}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 sm:px-5 sm:py-4">
                                        <Badge
                                            variant={doc.status}
                                            className="px-2.5 py-0.5 rounded-full capitalize text-[10px] font-bold tracking-tight shadow-sm"
                                        >
                                            {doc.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 sm:px-5 sm:py-4">
                                        <div className="flex items-center gap-1.5 transition-all">
                                            <a
                                                href={doc.download_url}
                                                className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                                                title="View Document"
                                                data-inertia-ignore
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Download size={15} />
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onDelete(doc)}
                                                className="hover:bg-error/10 hover:text-error transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant/10 bg-surface-container/20 px-5 py-4 gap-4">
                <div>
                    <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest leading-none">
                        Page Statistics
                    </span>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                        Showing <span className="text-on-surface font-bold underline underline-offset-4 decoration-primary/30">{documents.data.length}</span> of <span className="text-on-surface font-bold underline underline-offset-4 decoration-primary/30">{documents.meta?.total || 0}</span> results
                    </p>
                </div>
                <Pagination links={documents.links} />
            </div>
        </div>
    );
}
