export type DocStatus = 'ready' | 'processing' | 'failed';

export interface Doc {
    id: number;
    name: string;
    size: string;
    type: string;
    status: DocStatus;
    assignedTo: string[];   // user names
    assignedUserIds: number[];
    download_url: string;
    updated: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationProps {
    data: any[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        links: PaginationLink[];
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
}

export interface PaginatedDocs extends PaginationProps {
    data: Doc[];
}

export interface Conversation {
    session_id: string;
    last_message_at: string;
    message_count: number;
    latest_user_message: string | null;
}

export interface PaginatedConversations extends PaginationProps {
    data: Conversation[];
}
