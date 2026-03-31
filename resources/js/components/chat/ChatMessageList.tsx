import { ChatMessageBubble } from './ChatMessageBubble';
import { RiskIcon } from './ChatRiskItem';

interface Message {
    role: 'user' | 'ai';
    content: string;
    risks?: { icon: RiskIcon; text: string }[];
    hasTables?: boolean;
}

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
