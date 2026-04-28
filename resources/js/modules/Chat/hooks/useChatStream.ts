import { useCallback, useEffect, useRef, useState } from 'react';
import {
    subscribe,
    getSnapshot,
    sendStream,
    clearStreamData,
    abortStream,
    type StreamState,
} from '@/lib/adminChatStream';
import type { Message, Doc, ChatHistory } from '@/types/chat';

interface UseChatStreamProps {
    localChatId: string | undefined;
    setLocalChatId: (id: string) => void;
    setLocalMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setLocalChatHistory: React.Dispatch<React.SetStateAction<ChatHistory[]>>;
    activeDoc: Doc | null;
    csrfToken: string;
}

export function useChatStream({
    localChatId,
    setLocalChatId,
    setLocalMessages,
    setLocalChatHistory,
    activeDoc,
    csrfToken,
}: UseChatStreamProps) {
    const [streamState, setStreamState] = useState<StreamState>(getSnapshot);
    const [streamedDisplay, setStreamedDisplay] = useState('');
    const [streamEnded, setStreamEnded] = useState(false);
    
    const streamedFullRef = useRef('');
    const streamBufferRef = useRef('');
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const wasStreamingRef = useRef(false);
    const handledResponseRef = useRef(false);
    const pendingNewChatRef = useRef<{ title: string; docId: string } | null>(null);

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
        const unsub = subscribe((s) => setStreamState({ ...s }));
        return () => {
            unsub();
            stopTyping();
        };
    }, [stopTyping]);

    const { data: streamedData, citations: streamedCitations, isStreaming, isFetching, responseHeaders, error: streamError } = streamState;

    // Handle new chat ID from headers
    useEffect(() => {
        if (!responseHeaders || handledResponseRef.current) return;

        const newChatId = responseHeaders.get('X-Chat-Id');
        if (newChatId && !localChatId) {
            handledResponseRef.current = true;
            setLocalChatId(newChatId);

            if (typeof window !== 'undefined') {
                window.history.pushState({}, '', `/chat/${newChatId}`);
            }

            const pending = pendingNewChatRef.current;
            setLocalChatHistory((prev) => {
                const next = prev.map((c) => ({ ...c, active: false }));
                if (next.some((c) => c.id === newChatId)) {
                    return next.map((c) => (c.id === newChatId ? { ...c, active: true } : c));
                }
                return [
                    {
                        id: newChatId,
                        title: pending?.title || 'Untitled Chat',
                        docId: pending?.docId ?? activeDoc?.id ?? '',
                        active: true,
                    },
                    ...next,
                ];
            });
        }
    }, [responseHeaders, localChatId, activeDoc, setLocalChatId, setLocalChatHistory]);

    // Detect stream end
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

    // Feed buffer
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

    // Commit message
    useEffect(() => {
        if (!streamEnded || streamBufferRef.current.length > 0) return;

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

        setLocalMessages((prev) => [...prev, { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: full,
            metadata: streamedCitations ? { citations: streamedCitations } : undefined
        }]);

        clearStreamData();
        resetTyping();
        handledResponseRef.current = false;
    }, [streamEnded, streamedDisplay, resetTyping, streamedCitations, setLocalMessages]);

    const sendMessage = useCallback((content: string) => {
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
        setLocalMessages((prev) => [...prev, userMsg]);

        clearStreamData();
        resetTyping();
        handledResponseRef.current = false;
        wasStreamingRef.current = false;

        if (!localChatId) {
            pendingNewChatRef.current = {
                title: content.trim().slice(0, 80) || 'Untitled Chat',
                docId: activeDoc?.id ?? '',
            };
        }

        sendStream(
            '/chat',
            {
                document_id: activeDoc?.id,
                chat_id: localChatId,
                content,
            },
            csrfToken,
        );
    }, [activeDoc, localChatId, csrfToken, resetTyping, setLocalMessages]);

    return {
        streamedDisplay,
        streamError,
        isStreaming,
        isFetching,
        streamedCitations,
        sendMessage,
        abortStream,
        resetTyping,
    };
}
