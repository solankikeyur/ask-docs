import { Head, router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminLayout from '@/layouts/admin/AdminLayout';
import type { Message, Doc, ChatHistory } from '@/types/chat';
import {
    subscribe,
    getSnapshot,
    sendStream,
    clearStreamData,
    abortStream,
    type StreamState,
} from '@/lib/adminChatStream';

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

    // ─── Typing animation state (purely component-local) ───────────────────────
    const [streamedDisplay, setStreamedDisplay] = useState('');
    const streamedFullRef = useRef('');      // how much of the stream we've "consumed" into buffer
    const streamBufferRef = useRef('');      // chars waiting to be typed out
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [streamEnded, setStreamEnded] = useState(false);
    // Track the last stream state so we can detect the isStreaming→false transition
    const wasStreamingRef = useRef(false);
    const localChatIdRef = useRef<number | undefined>(localChatId);

    // Keep ref in sync so the subscribe callback (closure) can read it
    useEffect(() => { localChatIdRef.current = localChatId; }, [localChatId]);

    const csrfToken =
        typeof document !== 'undefined'
            ? (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '')
            : '';

    // ─── Typing helpers ─────────────────────────────────────────────────────────
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
        return () => stopTyping();   // clear interval on unmount (typing is pure display)
    }, [stopTyping]);

    // ─── Subscribe to global stream singleton ───────────────────────────────────
    // The fetch keeps running even when this component is unmounted.
    const [streamState, setStreamState] = useState<StreamState>(getSnapshot);

    useEffect(() => {
        // Subscribe and immediately receive current snapshot
        const unsub = subscribe((s) => setStreamState({ ...s }));
        return unsub;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Destructure for convenience
    const { data: streamedData, isStreaming, isFetching, responseHeaders, error: streamError } = streamState;

    // ─── Handle new chat-id coming back in response headers ─────────────────────
    const handledResponseRef = useRef(false);
    useEffect(() => {
        if (!responseHeaders) return;
        if (handledResponseRef.current) return;

        const newChatId = responseHeaders.get('X-Chat-Id');
        if (newChatId && !localChatIdRef.current) {
            handledResponseRef.current = true;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [responseHeaders]);

    // ─── Detect stream finished ──────────────────────────────────────────────────
    useEffect(() => {
        if (wasStreamingRef.current && !isStreaming) {
            if (streamedFullRef.current) {
                setStreamEnded(true);
            } else {
                clearStreamData();
            }
        }
        wasStreamingRef.current = isStreaming;
    }, [isStreaming]);

    // ─── Feed new data into typing buffer ───────────────────────────────────────
    useEffect(() => {
        const full = streamedData ?? '';
        const prev = streamedFullRef.current;

        if (full === prev) return;

        const delta = full.startsWith(prev) ? full.slice(prev.length) : full;
        streamedFullRef.current = full;

        if (!delta) return;

        streamBufferRef.current += delta;

        if (!typingIntervalRef.current) {
            typingIntervalRef.current = setInterval(() => {
                const buffer = streamBufferRef.current;

                if (!buffer) {
                    stopTyping();
                    return;
                }

                // Dynamic speed: drain the buffer in ~300ms
                const TARGET_DRAIN_MS = 300;
                const TICK_MS = 16;
                const ticksToEmpty = TARGET_DRAIN_MS / TICK_MS;
                const dynamicChars = Math.max(2, Math.ceil(buffer.length / ticksToEmpty));
                const take = Math.min(buffer.length, dynamicChars);

                const next = buffer.slice(0, take);
                streamBufferRef.current = buffer.slice(take);
                setStreamedDisplay((current) => current + next);

                if (streamBufferRef.current.length === 0) {
                    stopTyping();
                }
            }, 16);
        }
    }, [streamedData, stopTyping]);

    // ─── Commit final message once typing animation drains ──────────────────────
    useEffect(() => {
        if (!streamEnded) return;
        if (streamBufferRef.current.length > 0) return;

        const full = streamedFullRef.current;

        if (!full) {
            setStreamEnded(false);
            clearStreamData();
            setStreamedDisplay('');
            return;
        }

        if (streamedDisplay.length < full.length) {
            setStreamedDisplay(full);
            return;
        }

        setLocalMessages((prev) => [...prev, { id: Date.now(), role: 'assistant', content: full }]);
        clearStreamData();
        resetTyping();
        handledResponseRef.current = false;  // allow next message to pick up new chat-id if any
    }, [streamEnded, streamedDisplay, resetTyping]);

    // ─── Sync props → local state ────────────────────────────────────────────────
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
            const url = `/admin/chat/${localChatId}`;
            if (window.location.pathname !== url) {
                window.history.pushState({}, '', url);
            }
        }
    }, [localChatId]);

    // ─── Handlers ────────────────────────────────────────────────────────────────
    const handleSendMessage = useCallback(
        (content: string) => {
            const userMsg: Message = { id: Date.now(), role: 'user', content };
            setLocalMessages((prev) => [...prev, userMsg]);

            clearStreamData();
            resetTyping();
            handledResponseRef.current = false;
            wasStreamingRef.current = false;

            if (!localChatId) {
                pendingNewChatRef.current = {
                    title: content.trim().slice(0, 80) || 'Untitled Chat',
                    docId: activeDoc?.id ?? 0,
                };
            }

            sendStream(
                '/admin/chat',
                {
                    document_id: activeDoc?.id,
                    chat_id: localChatId,
                    content,
                },
                csrfToken,
            );
        },
        [activeDoc, localChatId, csrfToken, resetTyping],
    );

    const handleNewChatSelection = (doc: Doc) => {
        setActiveDoc(doc);
        setLocalChatId(undefined);
        setLocalMessages([]);
        abortStream();
        resetTyping();
        pendingNewChatRef.current = null;
        handledResponseRef.current = false;
        wasStreamingRef.current = false;
        setLocalChatHistory((prev) => prev.map((c) => ({ ...c, active: false })));

        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/admin/chat');
        }
    };

    const handleRenameChat = useCallback(
        (chatId: number, title: string, options?: { onFinish?: () => void; onError?: () => void }) => {
            setLocalChatHistory((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)));
            router.put(
                `/admin/chat/${chatId}`,
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
                abortStream();
                resetTyping();
                wasStreamingRef.current = false;

                if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/admin/chat');
                }
            }

            router.delete(`/admin/chat/${chatId}`, {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => options?.onFinish?.(),
                onError: () => options?.onError?.(),
            });
        },
        [localChatId, resetTyping],
    );

    const handleClearAllChats = useCallback(
        (options?: { onFinish?: () => void; onError?: () => void }) => {
            setLocalChatHistory([]);
            setLocalChatId(undefined);
            setLocalMessages([]);
            abortStream();
            resetTyping();
            wasStreamingRef.current = false;

            if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/admin/chat');
            }

            router.delete('/admin/chat', {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => options?.onFinish?.(),
                onError: () => options?.onError?.(),
            });
        },
        [resetTyping],
    );

    // ─── Derive display state ─────────────────────────────────────────────────────
    const displayMessages = [...localMessages];
    const showSkeleton = (isFetching || isStreaming || streamEnded) && streamedDisplay.length === 0;

    if (streamedDisplay) {
        displayMessages.push({ id: -1, role: 'assistant', content: streamedDisplay });
    }

    return (
        <AdminLayout activePath="/admin/chat" fullWidth={true}>
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
                                <div className="flex flex-1 items-center justify-center p-10 text-center">
                                    <div className="max-w-xs space-y-3">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-semibold text-on-surface">AskDocs Review Session</p>
                                        <p className="text-[11px] leading-relaxed text-on-surface-variant">
                                            Analyzing <strong>{activeDoc?.name}</strong> with full system access.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {streamError && (
                                <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                    <span className="mt-0.5 shrink-0">⚠</span>
                                    <span>{streamError}</span>
                                </div>
                            )}
                            <ChatInput activeDocName={activeDoc?.name || ''} onSend={handleSendMessage} disabled={isFetching || isStreaming} />
                        </div>
                    ) : (
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
                    )}
                </main>
            </SidebarProvider>
        </AdminLayout>
    );
}
