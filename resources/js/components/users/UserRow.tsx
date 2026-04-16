import { Mail, FileText, Settings, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { AdminUser} from '@/types/admin/user';
import { ROLE_COLORS } from '@/types/admin/user';

interface UserRowProps {
    user: AdminUser;
    onEdit: (user: AdminUser) => void;
    onDelete: (userId: number) => void;
}

const UserRow = memo(({ user, onEdit, onDelete }: UserRowProps) => {
    return (
        <div className="border-b border-outline-variant/10 px-4 py-4 transition-all hover:bg-surface-container/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* User Info Container */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-sm font-bold text-primary-foreground shadow-sm">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    {/* Name & email */}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                            <Mail size={12} className="opacity-70 shrink-0" /> <span className="truncate">{user.email}</span>
                        </div>
                    </div>

                    {/* Role */}
                    <span className={`hidden h-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline ${ROLE_COLORS[user.role]}`}>
                        {user.role}
                    </span>

                    {/* Status */}
                    <Badge variant={user.status ? 'ready' : 'failed'} className="shrink-0">
                        {user.statusLabel}
                    </Badge>

                    {/* Last active */}
                    <p className="hidden text-xs text-on-surface-variant lg:block opacity-70 italic whitespace-nowrap">
                        Active {user.lastActive}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:ml-auto ml-13">
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

        </div>
    );
});

UserRow.displayName = 'UserRow';

export default UserRow;
