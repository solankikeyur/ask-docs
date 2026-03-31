import type { RiskIcon } from '@/components/chat/ChatRiskItem';

export interface Citation {
    doc: string;
    page: string;
}

export interface TableRow {
    region: string;
    value: string;
    change: string;
    confidence: 'ready' | 'processing';
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    metadata?: { 
        risks?: { icon: RiskIcon; text: string }[];
        tableData?: TableRow[];
        citations?: Citation[];
    };
}

export interface Doc {
    id: number;
    name: string;
    status: 'ready' | 'processing';
}

export interface ChatHistory {
    id: number;
    title: string;
    docId: number;
    active: boolean;
}
