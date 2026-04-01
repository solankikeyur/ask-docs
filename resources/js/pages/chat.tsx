import { Head } from '@inertiajs/react';
import { useStream } from '@laravel/stream-react';
import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import AppLayout from '@/layouts/app-layout';
import type { Message, Doc, ChatHistory } from '@/types/chat';

const EMPTY_MESSAGES: Message[] = [];
const EMPTY_DOCS: Doc[] = [];
const EMPTY_CHAT_HISTORY: ChatHistory[] = [];

interface ChatPageProps {
    documents: Doc[];
    chatHistory: ChatHistory[];
    chat?: {
        id: number;
        docId: number;
        document: { id: number; name: string };
    };
    messages?: Message[];
}

export default function ChatPage({
    documents = EMPTY_DOCS,
    chatHistory = EMPTY_CHAT_HISTORY,
    chat,
    messages = EMPTY_MESSAGES,
}: ChatPageProps) {
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
    const [localChatId, setLocalChatId] = useState<number | undefined>(chat?.id);
    const [localChatHistory, setLocalChatHistory] = useState<ChatHistory[]>(chatHistory);
    const pendingNewChatRef = useRef<{ title: string; docId: number } | null>(null);

    const csrfToken =
        typeof document !== 'undefined'
            ? (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '')
            : '';

    const { data: streamedData, isFetching, isStreaming, send, clearData } = useStream('/chat', {
        id: 'chat-stream',
        csrfToken,
        onResponse: (response: Response) => {
            const newChatId = response.headers.get('X-Chat-Id');

            if (newChatId && !localChatId) {
                const chatId = Number(newChatId);
                setLocalChatId(chatId);

                if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', `/chat/${newChatId}`);
                }

                const pending = pendingNewChatRef.current;
                setLocalChatHistory((prev) => {
                    const next = prev.map((c) => ({ ...c, active: false }));

                    if (next.some((c) => c.id === chatId)) {
                        return next.map((c) => (c.id === chatId ? { ...c, active: true } : c));
                    }

                    return [
                        {
                            id: chatId,
                            title: pending?.title || 'Untitled Chat',
                            docId: pending?.docId ?? activeDoc?.id ?? 0,
                            active: true,
                        },
                        ...next,
                    ];
                });
            }
        },
    });

    const isStreamingRef = useRef(false);
    useEffect(() => {
        if (isStreamingRef.current && !isStreaming) {
            if (streamedData) {
                setLocalMessages((prev) => [
                    ...prev,
                    { id: Date.now(), role: 'assistant', content: streamedData },
                ]);
            }

            clearData();
        }

        isStreamingRef.current = isStreaming;
    }, [isStreaming, streamedData, clearData]);

    useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);

    useEffect(() => {
        setLocalChatHistory(chatHistory);
    }, [chatHistory]);

    useEffect(() => {
        if (chat) {
            const doc = documents.find((d) => d.id === chat.docId);

            if (doc) {
                setActiveDoc(doc);
            }
        }

        setLocalChatId(chat?.id);
    }, [chat, documents]);

    useEffect(() => {
        setLocalChatHistory((prev) => prev.map((c) => ({ ...c, active: !!localChatId && c.id === localChatId })));
    }, [localChatId]);

    useEffect(() => {
        if (localChatId) {
            if (typeof window !== 'undefined') {
                const url = `/chat/${localChatId}`;

                if (window.location.pathname !== url) {
                    window.history.pushState({}, '', url);
                }
            }
        }
    }, [localChatId]);

    const handleSendMessage = useCallback(
        (content: string) => {
            const userMsg: Message = { id: Date.now(), role: 'user', content };
            setLocalMessages((prev) => [...prev, userMsg]);
            
            clearData();

            if (!localChatId) {
                pendingNewChatRef.current = {
                    title: content.trim().slice(0, 80) || 'Untitled Chat',
                    docId: activeDoc?.id ?? 0,
                };
            }
            
            send({
                document_id: activeDoc?.id,
                chat_id: localChatId,
                content: content,
            });
        },
        [activeDoc, localChatId, send, clearData],
    );

    const handleNewChatSelection = (doc: Doc) => {
        setActiveDoc(doc);
        setLocalChatId(undefined);
        setLocalMessages([]);
        clearData();
        pendingNewChatRef.current = null;
        setLocalChatHistory((prev) => prev.map((c) => ({ ...c, active: false })));

        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/chat');
        }
    };

    const displayMessages = [...localMessages];
    const showSkeleton = (isFetching || isStreaming) && !streamedData;
    
    if (streamedData) {
        displayMessages.push({ id: -1, role: 'assistant', content: streamedData });
    }

    return (
        <AppLayout 
            variant="full"
            breadcrumbs={[{ title: 'Chat', href: '/chat' }]}
            sidebar={
                <ChatSidebar
                    chatHistory={localChatHistory}
                    assignedDocs={documents}
                    activeDoc={activeDoc}
                    onDocSelect={handleNewChatSelection}
                    onNewChat={handleNewChatSelection}
                />
            }
            header={
                activeDoc && (
                    <ChatHeader 
                        activeDoc={activeDoc} 
                        docs={documents} 
                        onDocSelect={setActiveDoc} 
                        isExistingChat={!!localChatId}
                    />
                )
            }
        >
            <Head title={activeDoc ? `Chat — ${activeDoc.name}` : (chat?.document?.name ? `Chat — ${chat.document.name}` : 'Chat')} />

            <main className="flex flex-1 flex-col overflow-hidden bg-background">
                {activeDoc ? (
                    <div className="flex flex-1 flex-col overflow-hidden">
                        {displayMessages.length > 0 || showSkeleton ? (
                            <ChatMessageList messages={displayMessages} isLoading={showSkeleton} />
                        ) : (
                            <div className="flex flex-1 items-center justify-center p-10 text-center">
                                <div className="max-w-xs space-y-3">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-container">
                                        <MessageSquare className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="text-sm font-semibold text-on-surface">Starting new chat session</p>
                                    <p className="text-[11px] leading-relaxed text-on-surface-variant">
                                        Type your first message below to begin analyzing <strong>{activeDoc?.name}</strong>.
                                    </p>
                                </div>
                            </div>
                        )}
                        <ChatInput activeDocName={activeDoc?.name || ''} onSend={handleSendMessage} disabled={isFetching || isStreaming} />
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center p-10 text-center bg-sidebar/30">
                        <div className="max-w-sm space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20">
                                <MessageSquare size={32} className="text-primary opacity-40" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-on-surface">AI Document Assistant</h2>
                                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                                    Select a conversation from the history or start a new analysis by clicking the **+** button in the sidebar.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </AppLayout>
    );
}
