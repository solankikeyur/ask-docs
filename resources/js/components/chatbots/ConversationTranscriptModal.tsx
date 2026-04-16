import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { User, Bot, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: string | null;
    messages: Message[];
    isLoading: boolean;
}

export function ConversationTranscriptModal({ open, onOpenChange, sessionId, messages, isLoading }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 border-outline-variant/30 rounded-[20px] overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b border-outline-variant/20 bg-surface">
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-on-surface">
                        <div className="p-2 bg-primary-container text-on-primary-container rounded-[10px]">
                            <Clock size={20} />
                        </div>
                        Conversation Transcript
                    </DialogTitle>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[13px] text-on-surface-variant font-medium">Session ID:</span>
                        <code className="text-[12px] bg-surface-container px-2 py-0.5 rounded text-primary font-mono">
                            {sessionId}
                        </code>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-surface-bright">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3">
                            <Spinner className="w-8 h-8 text-primary" />
                            <p className="text-sm text-on-surface-variant animate-pulse">Loading messages...</p>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            <div className="p-6 space-y-8">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {msg.role === 'user' ? (
                                                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container">
                                                        <User size={14} />
                                                        <span className="text-[12px] font-bold uppercase tracking-wider">Visitor</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-primary-container/50 text-on-primary-container">
                                                        <Bot size={14} />
                                                        <span className="text-[12px] font-bold uppercase tracking-wider">Curator</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-on-surface-variant font-medium">
                                                {new Date(msg.created_at).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </span>
                                        </div>
                                        <div className={`p-4 rounded-[16px] text-[15px] leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-surface-container-low text-on-surface border border-outline-variant/20' 
                                            : 'bg-surface-container-high text-on-surface border border-primary/10'
                                        }`}>
                                            <div className="prose-chat prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
