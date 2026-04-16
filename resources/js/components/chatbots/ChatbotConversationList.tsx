import { MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Conversation {
    session_id: string;
    last_message_at: string;
    message_count: number;
    latest_user_message: string | null;
}

interface Props {
    conversations: Conversation[];
    onViewTranscript: (sessionId: string) => void;
}

export function ChatbotConversationList({ conversations, onViewTranscript }: Props) {
    if (conversations.length === 0) {
        return (
            <div className="text-center py-12 bg-surface-container rounded-[16px] border border-dashed border-outline-variant/80">
                <div className="mx-auto w-12 h-12 bg-surface-bright rounded-full flex items-center justify-center text-on-surface-variant mb-4">
                    <MessageSquare size={24} />
                </div>
                <h3 className="text-lg font-semibold text-on-surface">No conversations yet</h3>
                <p className="text-[15px] text-on-surface-variant max-w-xs mx-auto mt-2">
                    When visitors interact with your chatbot, their sessions will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {conversations.map((conv) => (
                <div 
                    key={conv.session_id} 
                    className="group bg-surface-bright border border-outline-variant/30 rounded-[16px] p-5 hover:border-primary transition-all cursor-pointer shadow-[0_2px_8px_rgba(17,48,105,0.01)] hover:shadow-[0_4px_16px_rgba(17,48,105,0.04)]"
                    onClick={() => onViewTranscript(conv.session_id)}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-container/40 text-primary rounded-[10px]">
                                    <MessageSquare size={18} />
                                </div>
                                <span className="font-mono text-[13px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                                    {conv.session_id.substring(0, 8)}...
                                </span>
                                <div className="flex items-center gap-1.5 text-[13px] text-on-surface-variant ml-auto">
                                    <Calendar size={14} />
                                    {new Date(conv.last_message_at).toLocaleDateString(undefined, { 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            
                            {conv.latest_user_message && (
                                <p className="text-[15px] text-on-surface font-medium line-clamp-2 leading-relaxed italic opacity-80 pl-2 border-l-2 border-primary/20">
                                    "{conv.latest_user_message}"
                                </p>
                            )}

                            <div className="flex items-center gap-4 pt-1">
                                <span className="text-[13px] font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                                    {conv.message_count} messages
                                </span>
                            </div>
                        </div>
                        
                        <div className="self-center">
                            <div className="p-2 rounded-full bg-surface-container-high group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
