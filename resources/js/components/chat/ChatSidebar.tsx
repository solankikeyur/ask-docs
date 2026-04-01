import { Link } from '@inertiajs/react';
import { FileText, History, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
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
    chatPrefix?: string;
    showNewChatButton?: boolean;
    onNewChat?: (doc: Doc) => void;
    onRenameChat?: (chatId: number, title: string, options?: { onFinish?: () => void; onError?: () => void }) => void;
    onDeleteChat?: (chatId: number, options?: { onFinish?: () => void; onError?: () => void }) => void;
    onClearAllChats?: (options?: { onFinish?: () => void; onError?: () => void }) => void;
}

export function ChatSidebar({
    chatHistory,
    assignedDocs,
    chatPrefix = '/admin/chat',
    showNewChatButton = true,
    onNewChat,
    onRenameChat,
    onDeleteChat,
    onClearAllChats,
}: ChatSidebarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [renameChatId, setRenameChatId] = useState<number | null>(null);
    const [renameTitle, setRenameTitle] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [deleteChatId, setDeleteChatId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [clearAllOpen, setClearAllOpen] = useState(false);
    const [isClearingAll, setIsClearingAll] = useState(false);

    const handleSelectForNewChat = (doc: Doc) => {
        setIsModalOpen(false);

        if (onNewChat) {
            onNewChat(doc);
        }
    };

    const deleteChat = chatHistory.find((c) => c.id === deleteChatId) ?? null;

    return (
        <>
            <aside className="w-64 shrink-0 flex flex-col border-r border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm overflow-hidden">
                <SidebarHeader className="h-16 border-b border-sidebar-border/50 flex flex-row items-center justify-between px-4 py-0">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-secondary" />
                        <span className="text-sm font-semibold tracking-tight">Chat History</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {onClearAllChats && chatHistory.length > 0 && (
                            <button
                                onClick={() => setClearAllOpen(true)}
                                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors"
                                title="Clear all chats"
                                type="button"
                            >
                                <Trash2 size={16} className="text-on-surface-variant" />
                            </button>
                        )}
                        {showNewChatButton && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors"
                                title="New Chat"
                                type="button"
                            >
                                <Plus size={16} className="text-on-surface-variant" />
                            </button>
                        )}
                    </div>
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

                                            {(onRenameChat || onDeleteChat) && (
                                                <DropdownMenu>
                                                    <SidebarMenuAction asChild showOnHover>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="h-7 w-7"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                }}
                                                                title="Chat actions"
                                                            >
                                                                <MoreVertical size={14} />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                    </SidebarMenuAction>

                                                    <DropdownMenuContent side="right" align="start">
                                                        {onRenameChat && (
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    setRenameChatId(c.id);
                                                                    setRenameTitle(c.title || '');
                                                                }}
                                                            >
                                                                <Pencil size={14} />
                                                                Rename
                                                            </DropdownMenuItem>
                                                        )}

                                                        {onDeleteChat && (
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    setDeleteChatId(c.id);
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
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

            <Dialog
                open={renameChatId !== null}
                onOpenChange={(open) => {
                    if (isRenaming) {
return;
}

                    if (!open) {
setRenameChatId(null);
}
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename chat</DialogTitle>
                        <DialogDescription>Update the title shown in your chat history.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Input
                            value={renameTitle}
                            onChange={(e) => setRenameTitle(e.target.value)}
                            placeholder="Chat title"
                            disabled={isRenaming}
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setRenameChatId(null)}
                            disabled={isRenaming}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (!onRenameChat || renameChatId === null) {
return;
}

                                setIsRenaming(true);
                                onRenameChat(renameChatId, renameTitle.trim(), {
                                    onFinish: () => {
                                        setIsRenaming(false);
                                        setRenameChatId(null);
                                    },
                                    onError: () => setIsRenaming(false),
                                });
                            }}
                            disabled={isRenaming || renameChatId === null}
                        >
                            {isRenaming && <Spinner className="mr-2" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteChatId !== null}
                onOpenChange={(open) => {
                    if (isDeleting) {
return;
}

                    if (!open) {
setDeleteChatId(null);
}
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete chat?</DialogTitle>
                        <DialogDescription>
                            This permanently deletes{deleteChat?.title ? ` “${deleteChat.title}”` : ' this chat'} and all its messages.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setDeleteChatId(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                if (!onDeleteChat || deleteChatId === null) {
return;
}

                                setIsDeleting(true);
                                onDeleteChat(deleteChatId, {
                                    onFinish: () => {
                                        setIsDeleting(false);
                                        setDeleteChatId(null);
                                    },
                                    onError: () => setIsDeleting(false),
                                });
                            }}
                            disabled={isDeleting || deleteChatId === null}
                        >
                            {isDeleting && <Spinner className="mr-2" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={clearAllOpen}
                onOpenChange={(open) => {
                    if (isClearingAll) {
 return;
 }

                    setClearAllOpen(open);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear all chats?</DialogTitle>
                        <DialogDescription>This permanently deletes all chats and messages in your history.</DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setClearAllOpen(false)} disabled={isClearingAll}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                if (!onClearAllChats) {
 return;
 }

                                setIsClearingAll(true);
                                onClearAllChats({
                                    onFinish: () => {
                                        setIsClearingAll(false);
                                        setClearAllOpen(false);
                                    },
                                    onError: () => setIsClearingAll(false),
                                });
                            }}
                            disabled={isClearingAll}
                        >
                            {isClearingAll && <Spinner className="mr-2" />}
                            Clear all
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
