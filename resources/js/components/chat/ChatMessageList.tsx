import { MessageSquare } from 'lucide-react';
import type { Message } from '@/types/chat';
import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatMessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
    return (
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {messages.map((msg, i) => (
                <ChatMessageBubble key={msg.id || i} message={msg} />
            ))}
            {isLoading && (
                <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground text-xs font-bold">
                        <MessageSquare size={13} />
                    </div>

                    <div className="max-w-2xl rounded-[var(--radius-lg)] p-4 bg-surface-container text-on-surface">
                        <div className="space-y-2.5 w-48 sm:w-64">
                            <div className="h-3.5 bg-on-surface/10 rounded-md animate-pulse w-full"></div>
                            <div className="h-3.5 bg-on-surface/10 rounded-md animate-pulse w-5/6"></div>
                            <div className="h-3.5 bg-on-surface/10 rounded-md animate-pulse w-4/6"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
