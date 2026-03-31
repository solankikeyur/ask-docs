import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';
import { UploadModal } from '@/components/admin/documents/UploadModal';
import { AssignModal } from '@/components/admin/documents/AssignModal';
import { DocumentTable } from '@/components/admin/documents/DocumentTable';
import { DocumentSearch } from '@/components/admin/documents/DocumentSearch';
import { debounce } from '@/lib/utils';
import { Doc, PaginatedDocs } from '@/types/admin';

export default function AdminDocuments({ documents, allUsers }: { documents: PaginatedDocs, allUsers: { id: number, name: string }[] }) {
    const [showUpload, setShowUpload] = useState(false);
    const [assignDoc, setAssignDoc] = useState<Doc | null>(null);
    const [deleteDoc, setDeleteDoc] = useState<Doc | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    /**
     * Debounced Search Implementation
     */
    const debouncedSearch = useCallback(
        debounce((q: string) => {
            router.get(
                '/admin/documents',
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
        if (!deleteDoc) return;
        router.delete(`/admin/documents/${deleteDoc.id}`, {
            onSuccess: () => setDeleteDoc(null),
        });
    };

    const handleSaveAssignment = (docId: number, userIds: number[]) => {
        router.post(`/admin/documents/${docId}/assign`, { userIds }, {
            preserveScroll: true,
            onSuccess: () => setAssignDoc(null),
        });
    };

    return (
        <AdminLayout activePath="/admin/documents">
            <Head title="Admin — Documents" />

            {/* Modals */}
            {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

            {assignDoc && (
                <AssignModal
                    doc={assignDoc}
                    allUsers={allUsers}
                    onClose={() => setAssignDoc(null)}
                />
            )}

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
                            Manage and assign documents to your team.
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
                    onAssign={setAssignDoc}
                    onDelete={setDeleteDoc}
                />
            </div>
        </AdminLayout>
    );
}
