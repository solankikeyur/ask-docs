import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, FileText, ExternalLink, Edit, Code } from 'lucide-react';

interface Chatbot {
    id: number;
    name: string;
    description: string | null;
    public_id: string;
    documents: Array<{ id: number; name: string }>;
}

interface Props {
    chatbot: Chatbot;
}

export default function Show({ chatbot }: Props) {
    const embedCode = `<script src="${window.location.origin}/chatbot/${chatbot.public_id}/widget.js"></script>`;

    return (
        <AdminLayout>
            <Head title={chatbot.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/chatbots">
                                <ArrowLeft size={16} />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-on-surface">{chatbot.name}</h1>
                            <p className="text-on-surface-variant">{chatbot.description || 'No description'}</p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/admin/chatbots/${chatbot.id}/edit`}>
                            <Edit size={16} className="mr-2" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Assigned Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText size={20} />
                                    Assigned Documents ({chatbot.documents.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chatbot.documents.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {chatbot.documents.map((doc) => (
                                            <Badge key={doc.id} variant="secondary">
                                                {doc.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-on-surface-variant">
                                        No documents assigned. This chatbot won't be able to answer questions.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Embed Code */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code size={20} />
                                    Embed Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-on-surface-variant">
                                    Add this script tag to any website to embed the chatbot.
                                </p>
                                <div className="bg-surface-container p-3 rounded-md">
                                    <code className="text-xs text-on-surface break-all">
                                        {embedCode}
                                    </code>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(embedCode)}
                                    className="w-full"
                                >
                                    Copy Code
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Public Link */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ExternalLink size={20} />
                                    Public Access
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-on-surface-variant">
                                    Direct link to test the chatbot widget.
                                </p>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <a href={`/chatbot/${chatbot.public_id}/widget.js`} target="_blank">
                                        Test Widget
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Public ID</span>
                                    <code className="text-xs bg-surface-container px-1 py-0.5 rounded">
                                        {chatbot.public_id}
                                    </code>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Documents</span>
                                    <span>{chatbot.documents.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}