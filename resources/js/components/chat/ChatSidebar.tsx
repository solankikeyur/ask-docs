import { Link, usePage } from '@inertiajs/react';
import { Plus, FileText, History, Files } from 'lucide-react';
import { useState } from 'react';
import { 
    Sidebar, 
    SidebarContent, 
    SidebarHeader, 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator
} from '@/components/ui/sidebar';
import { DocSelectionModal } from './DocSelectionModal';

interface Doc {
    id: number;
    name: string;
    status: 'ready' | 'processing';
}

interface ChatHistory {
    id: number;
    title: string;
    docId: number;
    active: boolean;
}

interface ChatSidebarProps {
    chatHistory: ChatHistory[];
    assignedDocs: Doc[];
    activeDoc?: Doc | null;
    onDocSelect: (doc: Doc) => void;
    onNewChat?: (doc: Doc) => void;
}

export function ChatSidebar({ chatHistory, assignedDocs, activeDoc, onDocSelect, onNewChat }: ChatSidebarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectForNewChat = (doc: Doc) => {
        setIsModalOpen(false);

        if (onNewChat) {
onNewChat(doc);
}
    };

    const { url } = usePage();
    const chatPrefix = url.startsWith('/admin/') ? '/admin/chat' : '/chat';

    return (
        <>
        <aside className="w-64 shrink-0 flex flex-col border-r border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm overflow-hidden">
                <SidebarHeader className="h-16 border-b border-sidebar-border/50 flex flex-row items-center justify-between px-4 py-0">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-secondary" />
                        <span className="text-sm font-semibold tracking-tight">Chat History</span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors"
                        title="New Chat"
                    >
                        <Plus size={16} className="text-on-surface-variant" />
                    </button>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {chatHistory.length > 0 ? (
                                    chatHistory.map((c) => (
                                        <SidebarMenuItem key={c.id}>
                                            <SidebarMenuButton 
                                                asChild 
                                                isActive={c.active}
                                                className="h-auto py-2.5"
                                            >
                                                <Link href={`${chatPrefix}/${c.id}`} className="flex flex-col items-start gap-1 min-w-0 w-full overflow-hidden">
                                                    <span className="line-clamp-2 text-xs leading-relaxed font-medium w-full break-words">
                                                        {c.title || 'Untitled Chat'}
                                                    </span>
                                                    <span className="text-[10px] opacity-50 flex items-center gap-1 w-full overflow-hidden">
                                                        <FileText size={10} className="shrink-0" />
                                                        <span className="truncate">
                                                            {assignedDocs.find((d) => d.id === c.docId)?.name.split('_')[0]}
                                                        </span>
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                ) : (
                                    <div className="px-3 py-6 text-center">
                                        <p className="text-[11px] text-muted-foreground italic">No history yet.</p>
                                    </div>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                </SidebarContent>
            </aside>

            <DocSelectionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                documents={assignedDocs}
                onSelect={handleSelectForNewChat}
            />
        </>
    );
}
