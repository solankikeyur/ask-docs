import type { Message } from '@/types/chat';
import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatMessageListProps {
    messages: Message[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
    return (
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {messages.map((msg, i) => (
                <ChatMessageBubble key={i} message={msg} />
            ))}
        </div>
    );
}
