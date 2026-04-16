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
    current_page: number;
    data: any[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
    // Some setups (like using API Resources) might wrap these in meta
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
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
