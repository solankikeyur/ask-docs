import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, FileText, Pencil, Trash2, ArrowRight } from 'lucide-react';

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
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
            router.delete(`/admin/chatbots/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Chatbots" />

            <div className="max-w-6xl mx-auto space-y-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Chatbots</h1>
                        <p className="text-on-surface-variant mt-1 text-[15px]">Create and manage your embeddable AI chatbots.</p>
                    </div>
                    <Button asChild className="gap-2 shrink-0 bg-primary hover:bg-primary-dim text-primary-foreground h-11 px-6 rounded-[12px] shadow-[0_4px_24px_rgba(17,48,105,0.06)] border-0">
                        <Link href="/admin/chatbots/create">
                            <Plus size={18} />
                            Create Chatbot
                        </Link>
                    </Button>
                </div>

                {/* Chatbots Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {chatbots.map((chatbot) => (
                        <Card key={chatbot.id} className="group overflow-hidden border border-outline-variant/40 shadow-[0_4px_24px_rgba(17,48,105,0.02)] hover:shadow-[0_8px_32px_rgba(17,48,105,0.08)] hover:border-outline-variant/80 transition-all duration-300 rounded-[16px] flex flex-col bg-surface-container-lowest">
                            <CardHeader className="pb-4 bg-surface-bright group-hover:bg-surface-container transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-[12px] bg-primary-container flex items-center justify-center text-on-primary-container group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Bot size={20} className="fill-current opacity-20 absolute" />
                                            <Bot size={20} className="relative z-10" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-on-surface line-clamp-1 text-[16px]">{chatbot.name}</h3>
                                            <p className="text-xs text-on-surface-variant font-medium mt-0.5 tracking-wide">ID: {chatbot.public_id.substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[14px] text-on-surface-variant mt-4 line-clamp-2 h-10 leading-relaxed">
                                    {chatbot.description || 'No description provided.'}
                                </p>
                            </CardHeader>
                            
                            <CardContent className="p-0 flex-1 flex flex-col border-t border-outline-variant/20">
                                <div className="px-6 py-4 flex-1">
                                    <div className="flex items-center justify-between mb-3 text-sm font-medium text-on-surface">
                                        <span className="flex items-center gap-1.5"><FileText size={15} className="text-outline"/> Documents Focus</span>
                                        <Badge className="bg-surface-container text-on-surface-variant hover:bg-surface-container-high shadow-none border-0 px-2 py-0.5 text-xs">{chatbot.documents.length}</Badge>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1.5">
                                        {chatbot.documents.length > 0 ? (
                                            chatbot.documents.slice(0, 3).map((doc) => (
                                                <Badge key={doc.id} variant="outline" className="text-[11px] font-normal border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant">
                                                    {doc.name.length > 20 ? doc.name.substring(0, 20) + '...' : doc.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-outline italic">No sources assigned</span>
                                        )}
                                        {chatbot.documents.length > 3 && (
                                            <Badge variant="outline" className="text-[11px] font-normal border-outline-variant/40 bg-surface-container text-on-surface-variant">
                                                +{chatbot.documents.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-outline-variant/20 bg-surface flex items-center gap-2">
                                    <Link href={`/admin/chatbots/${chatbot.id}`} className="flex-1">
                                        <Button variant="secondary" className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface shadow-none transition-colors border-0 h-9">
                                            Open Canvas <ArrowRight size={14} className="ml-1.5 opacity-70" />
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="icon" asChild className="shrink-0 text-on-surface-variant hover:text-primary hover:bg-primary-container border-outline-variant/50 hover:border-primary-container shadow-none h-9 w-9">
                                        <Link href={`/admin/chatbots/${chatbot.id}/edit`}>
                                            <Pencil size={14} />
                                        </Link>
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => handleDelete(chatbot.id)}
                                        className="shrink-0 text-on-surface-variant hover:text-error hover:bg-error-container border-outline-variant/50 hover:border-error-container shadow-none h-9 w-9"
                                        title="Delete Chatbot"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
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
                            <Link href="/admin/chatbots/create">
                                <Plus size={18} className="mr-2" />
                                Create Chatbot
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}