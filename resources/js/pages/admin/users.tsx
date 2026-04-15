import { Head, router } from '@inertiajs/react';
import { Search, UserPlus } from 'lucide-react';
import { useCallback, useState } from 'react';

// Components
import CreateUserModal from '@/components/admin/users/CreateUserModal';
import EditUserModal from '@/components/admin/users/EditUserModal';
import ManageAccessModal from '@/components/admin/users/ManageAccessModal';
import UserRow from '@/components/admin/users/UserRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin/AdminLayout';
import type { AdminUser } from '@/types/admin/user';

interface Props {
    users: AdminUser[];
    allDocuments: { id: number; name: string }[];
}

export default function AdminUsers({ users, allDocuments }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [manageUser, setManageUser] = useState<AdminUser | null>(null);
    const [editUser, setEditUser] = useState<AdminUser | null>(null);

    const handleUpdateAccess = useCallback((userId: number, docIds: number[]) => {
        router.post(`/admin/users/${userId}/access`, {
            document_ids: docIds
        }, {
            onSuccess: () => setManageUser(null),
            preserveScroll: true
        });
    }, []);

    const handleDeleteUser = useCallback((userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/admin/users/${userId}`, {
                preserveScroll: true
            });
        }
    }, []);

    const handleManageAccess = useCallback((user: AdminUser) => {
        setManageUser(user);
    }, []);



    return (
        <AdminLayout activePath="/admin/users">
            <Head title="Admin — Users" />
            
            {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
            
            {editUser && (
                <EditUserModal 
                    user={editUser} 
                    onClose={() => setEditUser(null)} 
                />
            )}

            {manageUser && (
                <ManageAccessModal
                    user={manageUser}
                    allDocuments={allDocuments}
                    onClose={() => setManageUser(null)}
                    onSave={(docIds) => handleUpdateAccess(manageUser.id, docIds)}
                />
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">Users</h1>
                        <p className="mt-0.5 text-sm text-on-surface-variant">
                            Create users and manage which documents they can chat with.
                        </p>
                    </div>
                    <Button size="sm" className="gap-2 w-full sm:w-fit" onClick={() => setShowCreate(true)}>
                        <UserPlus size={14} /> Create User
                    </Button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <Input className="pl-9" placeholder="Search users…" />
                </div>

                {/* User list */}
                <div className="overflow-hidden rounded-[var(--radius-lg)] bg-surface-container-low">
                    <div className="border-b border-outline-variant/10 px-4 py-2 text-xs uppercase tracking-widest text-on-surface-variant">
                        {users.length} users
                    </div>

                    <div className="divide-y divide-outline-variant/10">
                        {users.map((user) => (
                            <UserRow 
                                key={user.id} 
                                user={user} 
                                onManageAccess={handleManageAccess} 
                                onEdit={setEditUser}
                                onDelete={handleDeleteUser}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
