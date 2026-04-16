import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Code, Layers, FileText, MessageSquare, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { ChatbotConversationList } from '@/components/chatbots/ChatbotConversationList';
import { ConversationTranscriptModal } from '@/components/chatbots/ConversationTranscriptModal';
import { cn } from '@/lib/utils';
import type { PaginatedConversations } from '@/types/admin';

interface Chatbot {
    id: number;
    name: string;
    description: string | null;
    public_id: string;
    documents: Array<{ id: number; name: string }>;
}

interface Props {
    chatbot: Chatbot;
    conversations: PaginatedConversations;
}

export default function Show({ chatbot, conversations }: Props) {
    const [activeTab, setActiveTab] = useState<'config' | 'history'>('config');
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
    const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

    const embedCode = `<script src="${window.location.origin}/chatbot/${chatbot.public_id}/widget.js"></script>`;

    const handleViewTranscript = async (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setIsTranscriptModalOpen(true);
        setIsLoadingTranscript(true);
        
        try {
            const response = await fetch(`/chatbots/${chatbot.id}/sessions/${sessionId}`);
            const data = await response.json();
            setMessages(data.messages);
        } catch (error) {
            console.error('Failed to fetch transcript:', error);
        } finally {
            setIsLoadingTranscript(false);
        }
    };

    return (
        <AppLayout>
            <Head title={chatbot.name} />

            <div className="max-w-6xl mx-auto space-y-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-[12px]">
                            <Link href="/chatbots">
                                <ArrowLeft size={18} />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-on-surface tracking-tight">{chatbot.name}</h1>
                            <p className="text-on-surface-variant mt-1 text-[15px] max-w-2xl">{chatbot.description || 'No description provided.'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild className="gap-2 shrink-0 bg-primary-container hover:bg-surface-dim text-on-primary-container h-10 px-5 rounded-[12px] border-0 shadow-none">
                            <Link href={`/chatbots/${chatbot.id}/edit`}>
                                <Edit size={16} />
                                Edit curator
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Sub-navigation Tabs */}
                <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-[14px] w-fit border border-outline-variant/20">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all",
                            activeTab === 'config' 
                            ? "bg-surface-bright text-primary shadow-[0_2px_8px_rgba(0,0,0,0.04)]" 
                            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                        )}
                    >
                        <Settings2 size={16} />
                        Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all",
                            activeTab === 'history' 
                            ? "bg-surface-bright text-primary shadow-[0_2px_8px_rgba(0,0,0,0.04)]" 
                            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                        )}
                    >
                        <MessageSquare size={16} />
                        Conversation History
                        {conversations.meta.total > 0 && (
                            <span className="ml-1 bg-primary/10 text-primary text-[11px] px-2 py-0.5 rounded-full">
                                {conversations.meta.total}
                            </span>
                        )}
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    {/* Main Content Area (Dynamic based on tab) */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'config' ? (
                            <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest overflow-hidden">
                                <CardHeader className="bg-surface pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-8 pt-8">
                                    <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                        <div className="p-2 bg-secondary-container text-on-secondary-container rounded-[10px]">
                                            <Layers size={20} />
                                        </div>
                                        Context Sources
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 py-6">
                                    {chatbot.documents.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {chatbot.documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-bright border border-outline-variant/30 text-on-surface text-[15px] font-medium shadow-[0_2px_8px_rgba(17,48,105,0.01)] hover:border-outline-variant/80 transition-colors">
                                                    <div className="p-1.5 bg-surface-container-high rounded-[8px] text-on-surface-variant">
                                                        <FileText size={16} />
                                                    </div>
                                                    {doc.name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-surface-container rounded-[12px] border border-dashed border-outline-variant/80">
                                            <p className="text-[15px] text-on-surface-variant">
                                                No documents assigned. This curator will fall back to general knowledge.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-on-surface px-1">Recent Interactions</h2>
                                <ChatbotConversationList 
                                    conversations={conversations} 
                                    onViewTranscript={handleViewTranscript} 
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Embed Code */}
                        <Card className="border border-outline-variant/40 shadow-[0_4px_24px_rgba(17,48,105,0.02)] rounded-[16px] bg-surface-container-lowest">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg text-on-surface font-semibold">
                                    <Code size={18} className="text-primary" />
                                    Deployment Snippet
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    Embed this script at the bottom of your website's body tag to activate the curator widget.
                                </p>
                                <div className="bg-inverse-surface p-4 rounded-[12px] border border-inverse-on-surface/20 shadow-inner group relative overflow-hidden">
                                    <code className="text-[12px] text-inverse-on-surface break-all font-mono">
                                        {embedCode}
                                    </code>
                                </div>
                                <Button
                                    onClick={() => navigator.clipboard.writeText(embedCode)}
                                    className="w-full bg-primary hover:bg-primary-dim text-primary-foreground h-11 rounded-[12px] font-semibold border-0 shadow-[0_2px_12px_rgba(0,90,194,0.15)]"
                                >
                                    Copy Code to Clipboard
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Metadata Stats */}
                        <Card className="border border-outline-variant/40 shadow-[0_4px_24px_rgba(17,48,105,0.02)] rounded-[16px] bg-surface-container-lowest">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-on-surface font-semibold">Curation Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/20">
                                    <span className="text-on-surface-variant font-medium">Public ID</span>
                                    <code className="text-[12px] font-mono bg-surface-container text-on-surface px-2 py-1 rounded-[6px]">
                                        {chatbot.public_id}
                                    </code>
                                </div>
                                <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/20">
                                    <span className="text-on-surface-variant font-medium">Linked Sources</span>
                                    <Badge variant="secondary" className="bg-surface-container-high text-on-surface-variant border-0 hover:bg-surface-container-high shadow-none">
                                        {chatbot.documents.length} sources
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm py-2">
                                    <span className="text-on-surface-variant font-medium">Total Sessions</span>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 hover:bg-primary/10 shadow-none">
                                        {conversations.meta.total} total
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConversationTranscriptModal 
                open={isTranscriptModalOpen}
                onOpenChange={setIsTranscriptModalOpen}
                sessionId={selectedSessionId}
                messages={messages}
                isLoading={isLoadingTranscript}
            />
        </AppLayout>
    );
}
