import { MessageSquare } from 'lucide-react';
import { ChatCitation } from './ChatCitation';
import { ChatRiskItem, RiskIcon } from './ChatRiskItem';
import { ChatRevenueTable } from './ChatRevenueTable';

interface Message {
    role: 'user' | 'ai';
    content: string;
    risks?: { icon: RiskIcon; text: string }[];
    hasTables?: boolean;
}

interface ChatMessageBubbleProps {
    message: Message;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const isAi = message.role === 'ai';

    return (
        <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isAi
                        ? 'bg-primary-gradient text-primary-foreground'
                        : 'bg-secondary-container text-on-secondary-container'
                }`}
            >
                {isAi ? <MessageSquare size={13} /> : 'ME'}
            </div>

            <div
                className={`max-w-2xl rounded-[var(--radius-lg)] p-4 text-sm leading-relaxed ${
                    message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-container text-on-surface'
                }`}
            >
                {isAi ? (
                    <>
                        <p dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        {message.hasTables && <ChatRevenueTable />}
                        {message.risks && (
                            <>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Key Risks:</p>
                                {message.risks.map((risk, ri) => (
                                    <ChatRiskItem key={ri} icon={risk.icon} text={risk.text} />
                                ))}
                            </>
                        )}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            <ChatCitation doc="2024_Financial_Q3_Report.pdf" page="p.12" />
                            <ChatCitation doc="2024_Financial_Q3_Report.pdf" page="p.18-19" />
                        </div>
                    </>
                ) : (
                    <p>{message.content}</p>
                )}
            </div>
        </div>
    );
}
