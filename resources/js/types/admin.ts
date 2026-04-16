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

    };
}

export interface Conversation {
    session_id: string;
    last_message_at: string;
    message_count: number;
    latest_user_message: string | null;
}

export interface PaginatedConversations {
    data: Conversation[];
    links: { url: string | null; label: string; active: boolean }[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}
