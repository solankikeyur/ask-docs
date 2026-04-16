import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Plus, Bot, FileText, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Chatbot {
    id: number;
    name: string;
    description: string | null;
    public_id: string;
    documents: Array<{ id: number; name: string }>;
}

interface Props {
    chatbots: Chatbot[];
}

export default function Index({ chatbots }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const confirmDelete = () => {
        if (deleteId === null) return;
        router.delete(`/chatbots/${deleteId}`, {
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Chatbots" />

            <ConfirmationDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Chatbot"
                description="Are you sure you want to delete this chatbot? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />

            <div className="max-w-6xl mx-auto space-y-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Chatbots</h1>
                        <p className="text-on-surface-variant mt-1 text-[15px]">Create and manage your embeddable AI chatbots.</p>
                    </div>
                    <Button asChild className="gap-2 shrink-0 bg-primary hover:bg-primary-dim text-primary-foreground h-11 px-6 rounded-[12px] shadow-[0_4px_24px_rgba(17,48,105,0.06)] border-0">
                        <Link href="/chatbots/create">
                            <Plus size={18} />
                            Create Chatbot
                        </Link>
                    </Button>
                </div>

                {/* Chatbots List */}
                <div className="flex flex-col gap-4">
                    {chatbots.map((chatbot) => (
                        <Card key={chatbot.id} className="group overflow-hidden border border-outline-variant/40 shadow-[0_2px_12px_rgba(17,48,105,0.02)] hover:shadow-[0_4px_24px_rgba(17,48,105,0.06)] hover:border-outline-variant/80 transition-all duration-300 rounded-[16px] bg-surface-container-lowest">
                            <div className="flex flex-col md:flex-row md:items-stretch">
                                {/* Left Section: Info */}
                                <div className="flex-1 p-5 md:p-6 flex flex-col sm:flex-row sm:items-start gap-4 md:gap-5 min-w-0">
                                    <div className="w-12 h-12 shrink-0 rounded-[14px] bg-primary-container flex items-center justify-center text-on-primary-container group-hover:bg-primary group-hover:text-primary-foreground transition-colors overflow-hidden relative shadow-sm">
                                        <Bot size={28} className="fill-current opacity-10 absolute" />
                                        <Bot size={22} className="relative z-10" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                            <h3 className="font-semibold text-[17px] text-on-surface truncate">{chatbot.name}</h3>
                                            <Badge variant="outline" className="hidden sm:inline-flex bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 font-mono tracking-wider px-2 py-0.5 text-[10px] rounded-md uppercase">
                                                ID: {chatbot.public_id.substring(0, 8)}
                                            </Badge>
                                        </div>
                                        <p className="text-[14px] text-on-surface-variant line-clamp-2 sm:line-clamp-1 mb-4 leading-relaxed max-w-3xl">
                                            {chatbot.description || <span className="italic opacity-70">No description provided.</span>}
                                        </p>
                                        
                                        {/* Documents assigned */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-on-surface-variant mr-1 shrink-0">
                                                <FileText size={15} className="text-outline"/>
                                                Focus Docs <Badge className="ml-0.5 bg-surface-container text-on-surface-variant border-0 shadow-none px-1.5 py-0 min-w-5 h-5 flex items-center justify-center">{chatbot.documents.length}</Badge>
                                            </div>
                                            {chatbot.documents.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
                                                    {chatbot.documents.slice(0, 5).map((doc) => (
                                                        <Badge key={doc.id} variant="outline" className="text-[11px] font-normal border-outline-variant/40 bg-surface text-on-surface hover:bg-surface-container transition-colors truncate max-w-[180px]">
                                                            {doc.name}
                                                        </Badge>
                                                    ))}
                                                    {chatbot.documents.length > 5 && (
                                                        <Badge variant="outline" className="text-[11px] font-normal border-outline-variant/40 bg-surface-container text-on-surface-variant">
                                                            +{chatbot.documents.length - 5} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[13px] text-outline italic">No sources assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Section: Actions */}
                                <div className="border-t md:border-t-0 md:border-l border-outline-variant/20 p-5 md:p-6 bg-surface-bright group-hover:bg-surface transition-colors shrink-0 flex flex-col items-center justify-center gap-3 w-full md:w-[220px]">
                                    <Link href={`/chatbots/${chatbot.id}`} className="flex-1 md:w-full md:flex-none">
                                        <Button className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary shadow-none transition-colors border-0 h-10 px-5 font-medium rounded-[10px]">
                                            Open Canvas <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    </Link>
                                    <div className="flex flex-row gap-2 w-full justify-end">
                                        <Button variant="outline" asChild className="flex-1 md:flex-auto text-on-surface-variant hover:text-primary border-outline-variant/50 hover:bg-primary-container hover:border-primary-container shadow-none h-10 rounded-[10px]">
                                            <Link href={`/chatbots/${chatbot.id}/edit`}>
                                                <Pencil size={15} className="mr-2 md:mr-0" />
                                                <span className="md:hidden text-sm font-medium">Edit</span>
                                            </Link>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setDeleteId(chatbot.id)}
                                            className="flex-1 md:flex-auto text-on-surface-variant hover:text-error border-outline-variant/50 hover:bg-error-container hover:border-error-container shadow-none h-10 rounded-[10px]"
                                            title="Delete Chatbot"
                                        >
                                            <Trash2 size={15} className="mr-2 md:mr-0" />
                                            <span className="md:hidden text-sm font-medium">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {chatbots.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 mt-8 rounded-[24px] border border-outline-variant/50 bg-surface-container-lowest/50 shadow-sm">
                        <div className="w-16 h-16 rounded-[16px] bg-primary-container text-on-primary-container flex items-center justify-center mb-4 shadow-sm">
                            <Bot size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-on-surface mb-2">Workspace Zero</h3>
                        <p className="text-on-surface-variant mb-6 text-center max-w-sm leading-relaxed text-[15px]">The canvas is empty. Start by creating an intelligent chatbot to curate responses from your documents.</p>
                        <Button asChild className="bg-primary hover:bg-primary-dim text-primary-foreground px-6 h-11 rounded-[12px] shadow-sm border-0">
                            <Link href="/chatbots/create">
                                <Plus size={18} className="mr-2" />
                                Create Chatbot
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
