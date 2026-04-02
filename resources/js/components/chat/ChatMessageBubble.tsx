import { Check, Copy, MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useClipboard } from '@/hooks/use-clipboard';
import type { Message } from '@/types/chat';
import type { SharedData } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatCitation } from './ChatCitation';
import { ChatRevenueTable } from './ChatRevenueTable';
import { ChatRiskItem } from './ChatRiskItem';

interface ChatMessageBubbleProps {
    message: Message;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const isAssistant = message.role === 'assistant';
    const isStreamingMessage = isAssistant && message.id === -1;
    const [copied, setCopied] = useState(false);
    const [, copy] = useClipboard();

    const handleCopy = useCallback(async () => {
        const text = message.content ?? '';

        if (!text) {
            return;
        }

        const ok = await copy(text);

        if (ok) {
            setCopied(true);
        }
    }, [copy, message.content]);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timer = setTimeout(() => setCopied(false), 1200);

        return () => clearTimeout(timer);
    }, [copied]);

    return (
        <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isAssistant
                        ? 'bg-primary-gradient text-primary-foreground'
                        : ''
                }`}
            >
                {isAssistant ? (
                    <MessageSquare size={13} />
                ) : (
                    <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/10 shadow-sm">
                        <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                        <AvatarFallback className="bg-neutral-200 text-[10px] text-black dark:bg-neutral-700 dark:text-white">
                            {getInitials(auth.user?.name ?? '')}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>

            <div className={`flex min-w-0 flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                    className={`max-w-2xl rounded-[var(--radius-lg)] p-4 text-sm leading-relaxed ${
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-surface-container text-on-surface'
                    }`}
                >
                    {isAssistant ? (
                        <>
                                <div className={isStreamingMessage ? 'animate-in fade-in duration-150 relative' : 'relative'}>
                                    <div className="prose-chat">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    {isStreamingMessage && (
                                        <span className="ml-0.5 inline-block h-4 w-px animate-caret-blink bg-on-surface/70 align-middle duration-1000" />
                                    )}
                                </div>

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
                        <div className="prose-chat">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className={`mt-2 flex items-center gap-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant/70 transition-colors hover:bg-on-surface/5 hover:text-on-surface-variant"
                        title="Copy"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
