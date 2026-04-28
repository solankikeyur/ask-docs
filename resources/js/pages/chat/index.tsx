import { Head, router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/AppLayout';
import type { Message, Doc, ChatHistory } from '@/types/chat';
import { useChatStream } from '@/modules/Chat/hooks/useChatStream';

const EMPTY_MESSAGES: Message[] = [];
const EMPTY_DOCS: Doc[] = [];
const EMPTY_CHAT_HISTORY: ChatHistory[] = [];

interface ChatProps {
    documents: {
        data: Doc[];
    };
    chatHistory: ChatHistory[];
    chat?: {
        id: string;
        docId: string;
        document: { id: string; name: string };
    };
    messages?: Message[];
}

export default function ChatIndex({
    documents: documentsProp,
    chatHistory = EMPTY_CHAT_HISTORY,
    chat,
    messages = EMPTY_MESSAGES,
}: ChatProps) {
    const documents = documentsProp?.data || EMPTY_DOCS;
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
    const [localChatId, setLocalChatId] = useState<string | undefined>(chat?.id);
    const [localChatHistory, setLocalChatHistory] = useState<ChatHistory[]>(chatHistory);

    const csrfToken = useMemo(() => 
        typeof document !== 'undefined'
            ? (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '')
            : '', []
    );

    const {
        streamedDisplay,
        streamError,
        isStreaming,
        isFetching,
        streamedCitations,
        sendMessage,
        abortStream,
        resetTyping,
    } = useChatStream({
        localChatId,
        setLocalChatId,
        setLocalMessages,
        setLocalChatHistory,
        activeDoc,
        csrfToken,
    });

    // Sync props to local state
    useEffect(() => { setLocalMessages(messages); }, [messages]);
    useEffect(() => { setLocalChatHistory(chatHistory); }, [chatHistory]);

    useEffect(() => {
        if (chat) {
            const doc = documents.find((d) => d.id === chat.docId);
            if (doc) setActiveDoc(doc);
        }
        setLocalChatId(chat?.id);
    }, [chat, documents]);

    useEffect(() => {
        setLocalChatHistory((prev) =>
            prev.map((c) => ({ ...c, active: !!localChatId && c.id === localChatId })),
        );
    }, [localChatId]);

    useEffect(() => {
        if (localChatId && typeof window !== 'undefined') {
            const url = `/chat/${localChatId}`;
            if (window.location.pathname !== url) {
                window.history.pushState({}, '', url);
            }
        }
    }, [localChatId]);

    const handleNewChatSelection = (doc: Doc) => {
        setActiveDoc(doc);
        setLocalChatId(undefined);
        setLocalMessages([]);
        abortStream();
        resetTyping();
        setLocalChatHistory((prev) => prev.map((c) => ({ ...c, active: false })));

        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/chat');
        }
    };

    const handleRenameChat = useCallback((chatId: string, title: string) => {
        setLocalChatHistory((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)));
        router.put(`/chat/${chatId}`, { title }, { preserveScroll: true, preserveState: true });
    }, []);

    const handleDeleteChat = useCallback((chatId: string) => {
        setLocalChatHistory((prev) => prev.filter((c) => c.id !== chatId));
        if (localChatId === chatId) {
            setLocalChatId(undefined);
            setLocalMessages([]);
            abortStream();
            resetTyping();
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/chat');
        }
        router.delete(`/chat/${chatId}`, { preserveScroll: true, preserveState: true });
    }, [localChatId, abortStream, resetTyping]);

    const handleClearAllChats = useCallback(() => {
        setLocalChatHistory([]);
        setLocalChatId(undefined);
        setLocalMessages([]);
        abortStream();
        resetTyping();
        if (typeof window !== 'undefined') window.history.pushState({}, '', '/chat');
        router.delete('/chat', { preserveScroll: true, preserveState: true });
    }, [abortStream, resetTyping]);

    const displayMessages = useMemo(() => {
        const msgs = [...localMessages];
        if (streamedDisplay) {
            msgs.push({ 
                id: 'stream', 
                role: 'assistant', 
                content: streamedDisplay,
                metadata: streamedCitations ? { citations: streamedCitations } : undefined
            });
        }
        return msgs;
    }, [localMessages, streamedDisplay, streamedCitations]);

    const showSkeleton = (isFetching || isStreaming) && streamedDisplay.length === 0;

    return (
        <AppLayout activePath="/chat" fullWidth={true}>
            <Head title={activeDoc ? `Analysis — ${activeDoc.name}` : (chat?.document?.name ? `Analysis — ${chat.document.name}` : 'AskDocs Analysis')} />

            <SidebarProvider defaultOpen={true} className="min-h-0 h-full w-full flex overflow-hidden">
                <ChatSidebar
                    chatHistory={localChatHistory}
                    assignedDocs={documents}
                    onNewChat={handleNewChatSelection}
                    onRenameChat={handleRenameChat}
                    onDeleteChat={handleDeleteChat}
                    onClearAllChats={handleClearAllChats}
                />

                <main className="flex flex-1 flex-col overflow-hidden bg-background min-w-0">
                    {activeDoc && (
                        <div className="border-b border-outline-variant/10 bg-surface/50 backdrop-blur-sm px-4">
                            <ChatHeader
                                activeDoc={activeDoc}
                                docs={documents}
                                onDocSelect={setActiveDoc}
                                isExistingChat={!!localChatId}
                            />
                        </div>
                    )}

                    {activeDoc ? (
                        <div className="flex flex-1 flex-col overflow-hidden">
                            {displayMessages.length > 0 || showSkeleton ? (
                                <ChatMessageList messages={displayMessages} isLoading={showSkeleton} />
                            ) : (
                                <EmptyChatState activeDocName={activeDoc.name} />
                            )}
                            {streamError && <StreamError error={streamError} />}
                            <ChatInput 
                                activeDocName={activeDoc.name} 
                                onSend={sendMessage} 
                                disabled={isFetching || isStreaming} 
                            />
                        </div>
                    ) : (
                        <NoDocumentSelected />
                    )}
                </main>
            </SidebarProvider>
        </AppLayout>
    );
}

function EmptyChatState({ activeDocName }: { activeDocName: string }) {
    return (
        <div className="flex flex-1 items-center justify-center p-10 text-center">
            <div className="max-w-xs space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-on-surface">AskDocs Review Session</p>
                <p className="text-[11px] leading-relaxed text-on-surface-variant">
                    Analyzing <strong>{activeDocName}</strong> with full system access.
                </p>
            </div>
        </div>
    );
}

function StreamError({ error }: { error: string }) {
    return (
        <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>{error}</span>
        </div>
    );
}

function NoDocumentSelected() {
    return (
        <div className="flex flex-1 flex-col bg-sidebar/30">
            <div className="p-4 md:hidden border-b border-outline-variant/10 bg-surface/50 backdrop-blur-sm flex items-center">
                <SidebarTrigger />
            </div>
            <div className="flex flex-1 items-center justify-center p-10 text-center">
                <div className="max-w-sm space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquare size={32} className="text-primary opacity-40" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-on-surface">AskDocs Intelligence Unit</h2>
                        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                            Select a document or existing conversation to begin your analysis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
