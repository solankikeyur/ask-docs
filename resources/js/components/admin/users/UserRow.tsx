import { memo } from 'react';
import { Mail, FileText, Settings, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AdminUser, ROLE_COLORS } from '@/types/admin/user';

interface UserRowProps {
    user: AdminUser;
    onManageAccess: (user: AdminUser) => void;
    onEdit: (user: AdminUser) => void;
    onDelete: (userId: number) => void;
}

const UserRow = memo(({ user, onManageAccess, onEdit, onDelete }: UserRowProps) => {
    return (
        <div className="border-b border-outline-variant/10 px-4 py-4 transition-all hover:bg-surface-container/50">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-sm font-bold text-primary-foreground shadow-sm">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                </div>

                {/* Name & email */}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                        <Mail size={12} className="opacity-70" /> {user.email}
                    </div>
                </div>

                {/* Role */}
                <span className={`hidden h-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline ${ROLE_COLORS[user.role]}`}>
                    {user.role}
                </span>

                {/* Status */}
                <Badge variant={user.status ? 'ready' : 'failed'}>
                    {user.statusLabel}
                </Badge>

                {/* Last active */}
                <p className="hidden text-xs text-on-surface-variant lg:block opacity-70 italic whitespace-nowrap">
                    Active {user.lastActive}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-auto">
                    <button
                        type="button"
                        onClick={() => onManageAccess(user)}
                        className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary-container/60 px-3 py-1.5 text-[11px] font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <FileText size={14} /> Manage Access
                    </button>
                    <button 
                        type="button" 
                        onClick={() => onEdit(user)}
                        className="rounded p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                        title="Edit User"
                    >
                        <Settings size={16} />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => onDelete(user.id)}
                        className="rounded p-2 text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors"
                        title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Assigned docs */}
            {user.assignedDocs.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2 pl-14">
                    {user.assignedDocs.map((doc) => (
                        <span key={doc} className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-[10px] font-medium text-on-surface-variant border border-outline-variant/10 shadow-sm">
                            <FileText size={10} className="text-primary" />
                            {doc}
                        </span>
                    ))}
                </div>
            ) : (
                <div className="mt-3 pl-14 flex items-center gap-2 opacity-60">
                    <div className="h-1 w-1 rounded-full bg-error" />
                    <p className="text-[11px] font-medium text-error italic">
                        No documents assigned — user cannot access chat session.
                    </p>
                </div>
            )}
        </div>
    );
});

UserRow.displayName = 'UserRow';

export default UserRow;
