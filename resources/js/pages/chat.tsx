import AppLayout from '@/layouts/app-layout';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { Head } from '@inertiajs/react';
import { useState, useCallback } from 'react';

// ─── Types & Data ─────────────────────────────────────────────
type RiskIcon = 'warn' | 'alert' | 'info';
interface Message {
    role: 'user' | 'ai';
    content: string;
    risks?: { icon: RiskIcon; text: string }[];
    hasTables?: boolean;
}

const assignedDocs = [
    { id: 1, name: '2024_Financial_Q3_Report.pdf', status: 'ready' as const },
    { id: 2, name: 'Legal_Review_ProjectX.pdf', status: 'ready' as const },
    { id: 3, name: 'Market_Analysis_Europe_v2.docx', status: 'processing' as const },
];

const chatHistory = [
    { id: 1, title: 'Q3 revenue breakdown for North American operations…', docId: 1, active: true },
    { id: 2, title: 'Key compliance obligations in Section 4…', docId: 2, active: false },
];

const initialMessages: Message[] = [
    {
        role: 'user',
        content: 'Can you compare the revenue projections from the North American sector against the EMEA region for Q4? Include key risks.',
    },
    {
        role: 'ai',
        content: 'Based on the **2024_Financial_Q3_Report.pdf**, here is the comparative analysis:',
        hasTables: true,
        risks: [
            { icon: 'warn', text: "Regulatory Delays: EU privacy laws could impact EMEA's data integration timeline by 4-6 weeks." },
            { icon: 'alert', text: 'Supply Chain Volatility: Hardware components for North American server upgrades remain unstable.' },
            { icon: 'info', text: 'Currency Fluctuations: Strengthening USD may impact translation gains from European operations.' },
        ],
    },
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [activeDoc, setActiveDoc] = useState(assignedDocs[0]);

    const handleSendMessage = useCallback((content: string) => {
        setMessages((prev) => [
            ...prev,
            { role: 'user', content },
        ]);

        // Simulating AI response delay
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content: `I've analyzed **${activeDoc.name}** regarding your question: "${content}". Based on the document, I can confirm the details. (This is a mock response in the refactored component architecture).`,
                },
            ]);
        }, 1000);
    }, [activeDoc.name]);

    return (
        <AppLayout>
            <Head title="Chat" />

            <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
                <ChatSidebar
                    chatHistory={chatHistory}
                    assignedDocs={assignedDocs}
                    activeDoc={activeDoc}
                    onDocSelect={setActiveDoc}
                />

                <div className="flex flex-1 flex-col overflow-hidden">
                    <ChatHeader
                        activeDoc={activeDoc}
                        docs={assignedDocs}
                        onDocSelect={setActiveDoc}
                    />

                    <ChatMessageList messages={messages} />

                    <ChatInput
                        activeDocName={activeDoc.name}
                        onSend={handleSendMessage}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
