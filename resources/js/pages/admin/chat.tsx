import { Head, router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminLayout from '@/layouts/admin/AdminLayout';
import type { Message, Doc, ChatHistory } from '@/types/chat';

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

export default function AdminChat({ documents = [], chatHistory = [], chat, messages = [] }: AdminChatProps) {
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const [activeDoc, setActiveDoc] = useState<Doc | null>(null);

    useEffect(() => {
        setLocalMessages(messages || []);
    }, [messages]);

    useEffect(() => {
        if (chat) {
            const doc = documents.find((d) => d.id === chat.docId);

            if (doc) {
                setActiveDoc(doc);
            }
        }
    }, [chat, documents]);

    const handleSendMessage = useCallback(
        (content: string) => {
            const userMsg: Message = { role: 'user', content };
            setLocalMessages((prev) => [...prev, userMsg]);

            router.post(
                '/admin/chat',
                {
                    document_id: activeDoc?.id,
                    chat_id: chat?.id,
                    content: content,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {},
                },
            );
        },
        [activeDoc, chat],
    );

    const handleNewChatSelection = (doc: Doc) => {
        setActiveDoc(doc);
        setLocalMessages([]);
    };

    return (
        <AdminLayout activePath="/admin/chat" fullWidth={true}>
            <Head title={chat ? `Analysis — ${chat.document.name}` : 'Curator AI Analysis'} />

            <SidebarProvider defaultOpen={true} className="min-h-0 h-full w-full flex overflow-hidden">
                <ChatSidebar
                    chatHistory={chatHistory}
                    assignedDocs={documents}
                    activeDoc={activeDoc}
                    onDocSelect={setActiveDoc}
                    onNewChat={handleNewChatSelection}
                />

                <main className="flex flex-1 flex-col overflow-hidden bg-background min-w-0">
                    {activeDoc && (
                        <div className="border-b border-outline-variant/10 bg-surface/50 backdrop-blur-sm px-4">
                            <ChatHeader 
                                activeDoc={activeDoc} 
                                docs={documents} 
                                onDocSelect={setActiveDoc} 
                            />
                        </div>
                    )}

                    {activeDoc ? (
                        <div className="flex flex-1 flex-col overflow-hidden">
                            {localMessages.length > 0 ? (
                                <ChatMessageList messages={localMessages} />
                            ) : (
                                <div className="flex flex-1 items-center justify-center p-10 text-center">
                                    <div className="max-w-xs space-y-3">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-semibold text-on-surface">Curator Review Session</p>
                                        <p className="text-[11px] leading-relaxed text-on-surface-variant">
                                            Analyzing <strong>{activeDoc.name}</strong> with full system access.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <ChatInput activeDocName={activeDoc.name} onSend={handleSendMessage} />
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
