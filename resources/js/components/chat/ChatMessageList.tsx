import { MessageSquare } from 'lucide-react';
import { useEffect, useRef, useCallback } from 'react';
import type { Message } from '@/types/chat';
import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatMessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

// How many pixels from the bottom counts as "at bottom"
const SCROLL_THRESHOLD = 80;

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastMessageCountRef = useRef<number>(0);
    const lastMessageIdRef = useRef<number | undefined>(undefined);
    const lastStreamingLenRef = useRef<number>(0);
    // Whether the user is considered "at the bottom" (auto-follow enabled)
    const isAtBottomRef = useRef<boolean>(true);
    const userScrolledRef = useRef<boolean>(false);
    const scrollListenerRef = useRef<(() => void) | null>(null);

    const isNearBottom = useCallback((container: HTMLDivElement) => {
        return container.scrollHeight - container.scrollTop - container.clientHeight <= SCROLL_THRESHOLD;
    }, []);

    // Attach scroll listener to detect manual scrolling
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onScroll = () => {
            const atBottom = isNearBottom(container);
            isAtBottomRef.current = atBottom;
            // Mark that user manually scrolled up
            if (!atBottom) {
                userScrolledRef.current = true;
            } else {
                userScrolledRef.current = false;
            }
        };

        scrollListenerRef.current = onScroll;
        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll);
    }, [isNearBottom]);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

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

        // A genuinely new message was added (user or assistant finished)
        // → always scroll to bottom and reset user-scrolled state
        if (messageCountChanged || (lastMessageChanged && !isStreaming)) {
            userScrolledRef.current = false;
            isAtBottomRef.current = true;
            requestAnimationFrame(() => {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            });
            return;
        }

        // During streaming, only auto-scroll if user hasn't scrolled away
        if (streamingAdvanced) {
            if (!userScrolledRef.current) {
                container.scrollTop = container.scrollHeight;
            }
            return;
        }

        // Default: scroll if at bottom
        if (isAtBottomRef.current) {
            requestAnimationFrame(() => {
                container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
            });
        }
    }, [messages, isLoading]);

    return (
        <div ref={containerRef} className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden p-4 sm:p-5 w-full max-w-full">
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
