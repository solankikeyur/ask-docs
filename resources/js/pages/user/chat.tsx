import { Head, router } from '@inertiajs/react';
import { useStream } from '@laravel/stream-react';
import { MessageSquare, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { DocSelectionModal } from '@/components/chat/DocSelectionModal';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import UserLayout from '@/layouts/user/UserLayout';
import type { ChatHistory, Doc, Message } from '@/types/chat';

const EMPTY_MESSAGES: Message[] = [];
const EMPTY_DOCS: Doc[] = [];
const EMPTY_CHAT_HISTORY: ChatHistory[] = [];

interface UserChatProps {
    documents: Doc[];
    chatHistory: ChatHistory[];
    chat?: {
        id: number;
        docId: number;
        document: { id: number; name: string };
    };
    messages?: Message[];
}

export default function UserChat({
    documents = EMPTY_DOCS,
    chatHistory = EMPTY_CHAT_HISTORY,
    chat,
    messages = EMPTY_MESSAGES,
}: UserChatProps) {
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
    const [localChatId, setLocalChatId] = useState<number | undefined>(chat?.id);
    const [localChatHistory, setLocalChatHistory] = useState<ChatHistory[]>(chatHistory);
    const pendingNewChatRef = useRef<{ title: string; docId: number } | null>(null);
    const [streamedDisplay, setStreamedDisplay] = useState('');
    const streamedFullRef = useRef('');
    const streamBufferRef = useRef('');
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [streamEnded, setStreamEnded] = useState(false);
    const [docModalOpen, setDocModalOpen] = useState(false);

    const stopTyping = useCallback(() => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
    }, []);

    const resetTyping = useCallback(() => {
        stopTyping();
        streamedFullRef.current = '';
        streamBufferRef.current = '';
        setStreamedDisplay('');
        setStreamEnded(false);
    }, [stopTyping]);

    useEffect(() => {
        return () => stopTyping();
    }, [stopTyping]);

    const csrfToken =
        typeof document !== 'undefined'
            ? (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '')
            : '';

    const { data: streamedData, isFetching, isStreaming, send, clearData } = useStream('/chat', {
        id: 'user-chat-stream',
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
            if (streamedFullRef.current) {
                setStreamEnded(true);
            } else {
                clearData();
            }
        }

        isStreamingRef.current = isStreaming;
    }, [isStreaming, clearData]);

    useEffect(() => {
        const full = streamedData ?? '';
        const prev = streamedFullRef.current;

        if (full === prev) {
            return;
        }

        const delta = full.startsWith(prev) ? full.slice(prev.length) : full;
        streamedFullRef.current = full;

        if (!delta) {
            return;
        }

        streamBufferRef.current += delta;

        if (!typingIntervalRef.current) {
            typingIntervalRef.current = setInterval(() => {
                const buffer = streamBufferRef.current;

                if (!buffer) {
                    stopTyping();

                    return;
                }

                const charsPerTick = 6;
                const nextChunk = buffer.slice(0, charsPerTick);
                streamBufferRef.current = buffer.slice(charsPerTick);

                setStreamedDisplay((prevText) => prevText + nextChunk);
            }, 25);
        }
    }, [streamedData, stopTyping]);

    useEffect(() => {
        if (!streamEnded) {
            return;
        }

        if (streamBufferRef.current.length > 0) {
            return;
        }

        const full = streamedFullRef.current;

        if (!full) {
            setStreamEnded(false);
            clearData();
            setStreamedDisplay('');

            return;
        }

        if (streamedDisplay.length < full.length) {
            setStreamedDisplay(full);

            return;
        }

        setLocalMessages((prev) => [...prev, { id: Date.now(), role: 'assistant', content: full }]);
        clearData();
        resetTyping();
    }, [streamEnded, streamedDisplay, clearData, resetTyping]);

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
            resetTyping();

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
        [activeDoc, localChatId, send, clearData, resetTyping],
    );

    const handleNewChatSelection = (doc: Doc) => {
        setActiveDoc(doc);
        setLocalChatId(undefined);
        setLocalMessages([]);
        clearData();
        resetTyping();
        pendingNewChatRef.current = null;
        setLocalChatHistory((prev) => prev.map((c) => ({ ...c, active: false })));

        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/chat');
        }
    };

    const handleRenameChat = useCallback(
        (chatId: number, title: string, options?: { onFinish?: () => void; onError?: () => void }) => {
            setLocalChatHistory((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)));

            router.put(
                `/chat/${chatId}`,
                { title },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => options?.onFinish?.(),
                    onError: () => options?.onError?.(),
                },
            );
        },
        [],
    );

    const handleDeleteChat = useCallback(
        (chatId: number, options?: { onFinish?: () => void; onError?: () => void }) => {
            setLocalChatHistory((prev) => prev.filter((c) => c.id !== chatId));

            if (localChatId === chatId) {
                setLocalChatId(undefined);
                setLocalMessages([]);
                clearData();
                resetTyping();

                if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/chat');
                }
            }

            router.delete(`/chat/${chatId}`, {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => options?.onFinish?.(),
                onError: () => options?.onError?.(),
            });
        },
        [localChatId, clearData, resetTyping],
    );

    const displayMessages = [...localMessages];
    const showSkeleton = (isFetching || isStreaming || streamEnded) && streamedDisplay.length === 0;

    if (streamedDisplay) {
        displayMessages.push({ id: -1, role: 'assistant', content: streamedDisplay });
    }

    return (
        <UserLayout>
            <Head title={activeDoc ? `Chat - ${activeDoc.name}` : 'AskDocs Chat'} />

            <DocSelectionModal
                open={docModalOpen}
                onOpenChange={setDocModalOpen}
                documents={documents}
                onSelect={(doc) => {
                    setDocModalOpen(false);
                    handleNewChatSelection(doc);
                }}
            />

            <SidebarProvider defaultOpen={true} className="min-h-0 h-full w-full flex overflow-hidden">
                <ChatSidebar
                    chatHistory={localChatHistory}
                    assignedDocs={documents}
                    chatPrefix="/chat"
                    showNewChatButton={false}
                    onRenameChat={handleRenameChat}
                    onDeleteChat={handleDeleteChat}
                />

                <main className="flex flex-1 flex-col overflow-hidden bg-background min-w-0">
                    <div className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant/10 bg-surface/50 px-4">
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold tracking-tight text-on-surface">
                                {localChatId ? (localChatHistory.find((c) => c.id === localChatId)?.title || 'Untitled Chat') : 'Chat'}
                            </div>
                        </div>
                        <Button size="sm" onClick={() => setDocModalOpen(true)}>
                            <Plus size={14} className="mr-2" />
                            New chat
                        </Button>
                    </div>

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
                                        <p className="text-sm font-semibold text-on-surface">AskDocs Session</p>
                                        <p className="text-[11px] leading-relaxed text-on-surface-variant">
                                            Chatting with <strong>{activeDoc?.name}</strong>.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <ChatInput
                                activeDocName={activeDoc?.name || ''}
                                onSend={handleSendMessage}
                                disabled={isFetching || isStreaming}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-10 text-center bg-sidebar/30">
                            <div className="max-w-sm space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <MessageSquare size={32} className="text-primary opacity-40" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-on-surface">AskDocs</h2>
                                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                                        Start a new chat to ask questions about your assigned documents.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </SidebarProvider>
        </UserLayout>
    );
}
