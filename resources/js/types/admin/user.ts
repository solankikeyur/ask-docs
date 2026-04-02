export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'viewer';
    status: boolean;
    statusLabel: string;
    assignedDocs: string[];
    assignedDocIds: number[];
    lastActive: string;
}

export const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-primary-gradient text-primary-foreground',
    viewer: 'bg-amber-100 text-amber-900',
};
