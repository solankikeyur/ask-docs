import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, FileText, ExternalLink, Trash2 } from 'lucide-react';

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

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">Chatbots</h1>
                        <p className="text-on-surface-variant">Create and manage embeddable chatbots</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/chatbots/create">
                            <Plus size={16} className="mr-2" />
                            Create Chatbot
                        </Link>
                    </Button>
                </div>

                {/* Chatbots Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {chatbots.map((chatbot) => (
                        <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bot size={20} className="text-primary" />
                                        <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/chatbot/${chatbot.public_id}/widget.js`} target="_blank">
                                            <ExternalLink size={14} />
                                        </Link>
                                    </Button>
                                </div>
                                {chatbot.description && (
                                    <p className="text-sm text-on-surface-variant">{chatbot.description}</p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-on-surface-variant mb-1">Assigned Documents</p>
                                    <div className="flex flex-wrap gap-1">
                                        {chatbot.documents.length > 0 ? (
                                            chatbot.documents.map((doc) => (
                                                <Badge key={doc.id} variant="secondary" className="text-xs">
                                                    <FileText size={10} className="mr-1" />
                                                    {doc.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge variant="outline" className="text-xs">No documents</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" asChild className="flex-1">
                                        <Link href={`/admin/chatbots/${chatbot.id}`}>View</Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild className="flex-1">
                                        <Link href={`/admin/chatbots/${chatbot.id}/edit`}>Edit</Link>
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={() => handleDelete(chatbot.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {chatbots.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bot size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
                            <h3 className="text-lg font-semibold text-on-surface mb-2">No chatbots yet</h3>
                            <p className="text-on-surface-variant mb-4">Create your first chatbot to get started</p>
                            <Button asChild>
                                <Link href="/admin/chatbots/create">
                                    <Plus size={16} className="mr-2" />
                                    Create Chatbot
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}