import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Code, Layers, FileText } from 'lucide-react';

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

            <div className="max-w-6xl mx-auto space-y-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-[12px]">
                            <Link href="/admin/chatbots">
                                <ArrowLeft size={18} />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-on-surface tracking-tight">{chatbot.name}</h1>
                            <p className="text-on-surface-variant mt-1 text-[15px] max-w-2xl">{chatbot.description || 'No description provided.'}</p>
                        </div>
                    </div>
                    <Button asChild className="gap-2 shrink-0 bg-primary-container hover:bg-surface-dim text-on-primary-container h-10 px-5 rounded-[12px] border-0 shadow-none">
                        <Link href={`/admin/chatbots/${chatbot.id}/edit`}>
                            <Edit size={16} />
                            Edit Protocol
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Assigned Documents */}
                        <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest overflow-hidden">
                            <CardHeader className="bg-surface pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-8 pt-8">
                                <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                    <div className="p-2 bg-secondary-container text-on-secondary-container rounded-[10px]">
                                        <Layers size={20} />
                                    </div>
                                    Assigned Context Sources
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
                                            No documents assigned. This chatbot will fall back to general knowledge.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
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

                        {/* Stats */}
                        <Card className="border border-outline-variant/40 shadow-[0_4px_24px_rgba(17,48,105,0.02)] rounded-[16px] bg-surface-container-lowest">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-on-surface font-semibold">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/20">
                                    <span className="text-on-surface-variant font-medium">Public ID</span>
                                    <code className="text-[12px] font-mono bg-surface-container text-on-surface px-2 py-1 rounded-[6px]">
                                        {chatbot.public_id}
                                    </code>
                                </div>
                                <div className="flex justify-between items-center text-sm py-2">
                                    <span className="text-on-surface-variant font-medium">Data Sources</span>
                                    <Badge variant="secondary" className="bg-surface-container-high text-on-surface-variant border-0 hover:bg-surface-container-high shadow-none">
                                        {chatbot.documents.length} linked
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}