import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FileText, Upload, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

const suggestedDocs = [
    {
        name: 'Q3 Revenue Strategy.pdf',
        desc: 'Executive summary covering market expansion and digital transformation goals for the upcoming quarter.',
        badge: 'ready' as const,
    },
    {
        name: 'Market Research 2024',
        desc: 'Comprehensive competitor analysis and consumer behavior trends in the AI-SaaS ecosystem.',
        badge: 'ready' as const,
    },
    {
        name: 'Privacy Framework.docx',
        desc: 'Legal documentation regarding data handling, compliance standards, and security protocols.',
        badge: 'ready' as const,
    },
];

export default function ChatEmptyState() {
    return (
        <>
            <Head title="Chat — Select Document" />

            <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
                {/* Empty state icon */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container">
                    <Sparkles size={28} className="text-primary" />
                </div>

                <h1 className="mb-2 text-2xl font-bold text-on-surface">Select a document to begin</h1>
                <p className="mb-8 max-w-sm text-center text-sm text-on-surface-variant">
                    Your admin has assigned 12 documents to your account. Choose a file below or start a fresh session.
                </p>

                {/* Suggested docs */}
                <div className="w-full max-w-xl">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                            Choose from suggested documents
                        </p>
                        <Link href="/documents" className="flex items-center gap-1 text-xs text-primary hover:underline">
                            View All Documents <ArrowRight size={11} />
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {suggestedDocs.map((doc) => (
                            <button
                                key={doc.name}
                                className="flex w-full items-start gap-3 rounded-[var(--radius-lg)] bg-surface-container-low p-4 text-left transition-colors hover:bg-surface-container"
                            >
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-container">
                                    <FileText size={16} className="text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="mb-0.5 text-sm font-semibold text-on-surface">{doc.name}</p>
                                    <p className="text-xs leading-relaxed text-on-surface-variant line-clamp-2">{doc.desc}</p>
                                </div>
                                <Badge variant={doc.badge} className="shrink-0">Ready</Badge>
                            </button>
                        ))}
                    </div>

                    {/* Upload + tip */}
                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-outline-variant/25 p-4 text-sm text-on-surface-variant transition-colors hover:border-primary/30 hover:text-on-surface cursor-pointer">
                            <Upload size={15} />
                            <span>Drag &amp; drop any PDF here to start instantly</span>
                        </div>
                        <Button size="sm" className="shrink-0 gap-2">
                            <Upload size={13} />
                            Browse Files
                        </Button>
                    </div>

                    <p className="mt-3 rounded-[var(--radius-md)] bg-primary-container px-3 py-2 text-center text-xs text-on-primary-container">
                        <strong>Pro Tip:</strong> You can drag and drop any PDF here to start a custom session instantly.
                    </p>
                </div>
            </div>
        </>
    );
}
