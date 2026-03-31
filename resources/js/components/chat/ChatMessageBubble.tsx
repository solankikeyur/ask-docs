import { MessageSquare } from 'lucide-react';
import type { Message } from '@/types/chat';
import { ChatCitation } from './ChatCitation';
import { ChatRevenueTable } from './ChatRevenueTable';
import { ChatRiskItem } from './ChatRiskItem';

interface ChatMessageBubbleProps {
    message: Message;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const isAssistant = message.role === 'assistant';

    return (
        <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isAssistant
                        ? 'bg-primary-gradient text-primary-foreground'
                        : 'bg-secondary-container text-on-secondary-container'
                }`}
            >
                {isAssistant ? <MessageSquare size={13} /> : 'ME'}
            </div>

            <div
                className={`max-w-2xl rounded-[var(--radius-lg)] p-4 text-sm leading-relaxed ${
                    message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-container text-on-surface'
                }`}
            >
                {isAssistant ? (
                    <>
                        <p dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        
                        {message.metadata?.tableData && (
                            <ChatRevenueTable rows={message.metadata.tableData} />
                        )}

                        {message.metadata?.risks && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Key Risks:</p>
                                {message.metadata.risks.map((risk, ri) => (
                                    <ChatRiskItem key={ri} icon={risk.icon} text={risk.text} />
                                ))}
                            </div>
                        )}

                        {message.metadata?.citations && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {message.metadata.citations.map((cite, ci) => (
                                    <ChatCitation key={ci} doc={cite.doc} page={cite.page} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p>{message.content}</p>
                )}
            </div>
        </div>
    );
}
