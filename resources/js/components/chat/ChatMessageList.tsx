import { MessageSquare } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Message } from '@/types/chat';
import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatMessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastMessageIdRef = useRef<number | undefined>(undefined);
    const lastMessageCountRef = useRef<number>(0);
    const lastStreamingLenRef = useRef<number>(0);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
return;
}

        const last = messages[messages.length - 1];
        const lastId = last?.id;
        const isStreaming = lastId === -1;
        const streamingLen = isStreaming ? (last?.content?.length ?? 0) : 0;

        const messageCountChanged = messages.length !== lastMessageCountRef.current;
        const lastMessageChanged = lastId !== lastMessageIdRef.current;
        const streamingAdvanced = isStreaming && streamingLen !== lastStreamingLenRef.current;

        lastMessageCountRef.current = messages.length;
        lastMessageIdRef.current = lastId;
        lastStreamingLenRef.current = streamingLen;

        const behavior: ScrollBehavior = messageCountChanged || lastMessageChanged ? 'smooth' : 'auto';

        if (streamingAdvanced) {
            // Avoid jitter during rapid typing updates.
            container.scrollTop = container.scrollHeight;

            return;
        }

        // Ensure DOM has rendered before measuring scrollHeight.
        requestAnimationFrame(() => {
            container.scrollTo({ top: container.scrollHeight, behavior });
        });
    }, [messages, isLoading]);

    return (
        <div ref={containerRef} className="flex-1 space-y-5 overflow-y-auto p-5">
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
