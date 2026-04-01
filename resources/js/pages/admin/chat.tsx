import { Head } from '@inertiajs/react';
import { useStream } from '@laravel/stream-react';
import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminLayout from '@/layouts/admin/AdminLayout';
import type { Message, Doc, ChatHistory } from '@/types/chat';

const EMPTY_MESSAGES: Message[] = [];
const EMPTY_DOCS: Doc[] = [];
const EMPTY_CHAT_HISTORY: ChatHistory[] = [];

interface AdminChatProps {
    documents: Doc[];
    chatHistory: ChatHistory[];
    chat?: {
        id: number;
        docId: number;
        document: { id: number; name: string };
    };
    messages?: Message[];
}

export default function AdminChat({
    documents = EMPTY_DOCS,
    chatHistory = EMPTY_CHAT_HISTORY,
    chat,
    messages = EMPTY_MESSAGES,
}: AdminChatProps) {
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
    const [localChatId, setLocalChatId] = useState<number | undefined>(chat?.id);
    const [localChatHistory, setLocalChatHistory] = useState<ChatHistory[]>(chatHistory);
    const pendingNewChatRef = useRef<{ title: string; docId: number } | null>(null);

    const csrfToken =
        typeof document !== 'undefined'
            ? (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '')
            : '';

    const { data: streamedData, isFetching, isStreaming, send, clearData } = useStream('/admin/chat', {
        id: 'admin-chat-stream',
        csrfToken,
        onResponse: (response: Response) => {
            const newChatId = response.headers.get('X-Chat-Id');

            if (newChatId && !localChatId) {
                const chatId = Number(newChatId);
                setLocalChatId(chatId);

                if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', `/admin/chat/${newChatId}`);
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
                const url = `/admin/chat/${localChatId}`;

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
            window.history.pushState({}, '', '/admin/chat');
        }
    };

    const displayMessages = [...localMessages];
    const showSkeleton = (isFetching || isStreaming) && !streamedData;

    if (streamedData) {
        displayMessages.push({ id: -1, role: 'assistant', content: streamedData });
    }

    return (
        <AdminLayout activePath="/admin/chat" fullWidth={true}>
            <Head title={activeDoc ? `Analysis — ${activeDoc.name}` : (chat?.document?.name ? `Analysis — ${chat.document.name}` : 'Curator AI Analysis')} />

            <SidebarProvider defaultOpen={true} className="min-h-0 h-full w-full flex overflow-hidden">
                <ChatSidebar
                    chatHistory={localChatHistory}
                    assignedDocs={documents}
                    activeDoc={activeDoc}
                    onDocSelect={handleNewChatSelection}
                    onNewChat={handleNewChatSelection}
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
                                <div className="flex flex-1 items-center justify-center p-10 text-center">
                                    <div className="max-w-xs space-y-3">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-semibold text-on-surface">Curator Review Session</p>
                                        <p className="text-[11px] leading-relaxed text-on-surface-variant">
                                            Analyzing <strong>{activeDoc?.name}</strong> with full system access.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <ChatInput activeDocName={activeDoc?.name || ''} onSend={handleSendMessage} disabled={isFetching || isStreaming} />
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-10 text-center bg-sidebar/30">
                            <div className="max-w-sm space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <MessageSquare size={32} className="text-primary opacity-40" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-on-surface">Curator Intelligence Unit</h2>
                                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                                        Select a document or existing conversation to begin your analysis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </SidebarProvider>
        </AdminLayout>
    );
}
