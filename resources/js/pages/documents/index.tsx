import { Head, router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { DocumentSearch } from '@/components/documents/DocumentSearch';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { UploadModal } from '@/components/documents/UploadModal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';
import { debounce } from '@/lib/utils';
import type { Doc, PaginatedDocs } from '@/types/admin';

export default function DocumentIndex({ documents, allUsers }: { documents: PaginatedDocs, allUsers: { id: number, name: string }[] }) {
    const [showUpload, setShowUpload] = useState(false);
    const [deleteDoc, setDeleteDoc] = useState<Doc | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    /**
     * Debounced Search Implementation
     */
    const debouncedSearch = useMemo(
        () => debounce((q: string) => {
            router.get(
                '/documents',
                { search: q },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                }
            );
        }, 400),
        []
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    /**
     * Action Handlers
     */
    const confirmDelete = () => {
        if (!deleteDoc) {
            return;
        }

        router.delete(`/documents/${deleteDoc.id}`, {
            onSuccess: () => setDeleteDoc(null),
        });
    };

    return (
        <AppLayout activePath="/documents">
            <Head title="Documents" />

            {/* Modals */}
            {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}


            <ConfirmationDialog
                isOpen={!!deleteDoc}
                onClose={() => setDeleteDoc(null)}
                onConfirm={confirmDelete}
                title="Delete Document"
                description={`Are you sure you want to delete "${deleteDoc?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
            />

            {/* Page Header & Controls */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Documents</h1>
                        <p className="mt-1 text-sm text-on-surface-variant font-medium">
                            Manage your personal documents.
                        </p>
                    </div>
                    <Button 
                        size="sm" 
                        className="gap-2.5 w-full sm:w-fit shadow-md shadow-primary/20 hover:shadow-lg transition-all" 
                        onClick={() => setShowUpload(true)}
                    >
                        <Upload size={16} /> Upload New Document
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <DocumentSearch value={searchQuery} onChange={handleSearch} />
                </div>

                {/* Main Content Table */}
                <DocumentTable
                    documents={documents}
                    onDelete={setDeleteDoc}
                />
            </div>
        </AppLayout>
    );
}
