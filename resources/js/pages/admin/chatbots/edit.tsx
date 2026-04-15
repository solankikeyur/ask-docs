import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Bot, Trash2, Layers } from 'lucide-react';

interface Document {
    id: number;
    name: string;
}

interface Chatbot {
    id: number;
    name: string;
    description: string | null;
    public_id: string;
    documents: Array<{ id: number; name: string }>;
}

interface Props {
    chatbot: Chatbot;
    documents: Document[];
}

export default function Edit({ chatbot, documents }: Props) {
    const { data, setData, put, processing, errors, delete: destroy } = useForm({
        name: chatbot.name,
        description: chatbot.description || '',
        document_ids: chatbot.documents.map(d => d.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/chatbots/${chatbot.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
            destroy(`/admin/chatbots/${chatbot.id}`);
        }
    };

    const toggleDocument = (documentId: number) => {
        setData('document_ids', data.document_ids.includes(documentId)
            ? data.document_ids.filter(id => id !== documentId)
            : [...data.document_ids, documentId]
        );
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${chatbot.name}`} />

            <div className="max-w-4xl mx-auto space-y-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-[12px]">
                            <Link href="/admin/chatbots">
                                <ArrowLeft size={18} />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Edit Protocol</h1>
                            <p className="text-on-surface-variant mt-1 text-[15px]">{chatbot.name}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-error hover:bg-error-container hover:text-on-error-container border-error-container/50 bg-surface-container-lowest h-10 px-4 rounded-[12px]">
                        <Trash2 size={16} className="mr-2" />
                        Delete
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest">
                        <CardHeader className="bg-surface pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-8 pt-8">
                            <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                <div className="p-2 bg-primary-container text-on-primary-container rounded-[10px]">
                                    <Bot size={20} />
                                </div>
                                Core Identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-8 py-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-on-surface">Name <span className="text-error">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="My Chatbot"
                                    required
                                    className="h-12 rounded-[12px] border border-outline/30 bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-[0_2px_12px_rgba(17,48,105,0.02)]"
                                />
                                {errors.name && <p className="text-sm text-error font-medium">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold text-on-surface">Mission / Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of what this chatbot does"
                                    rows={3}
                                    className="p-3 rounded-[12px] border border-outline/30 bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-[0_2px_12px_rgba(17,48,105,0.02)] resize-y"
                                />
                                {errors.description && <p className="text-sm text-error font-medium">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Document Assignment */}
                    <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest overflow-hidden">
                        <CardHeader className="bg-surface pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-8 pt-8">
                            <div className="flex flex-col gap-2">
                                <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                    <div className="p-2 bg-secondary-container text-on-secondary-container rounded-[10px]">
                                        <Layers size={20} />
                                    </div>
                                    Context Grounding
                                </CardTitle>
                                <p className="text-[14px] text-on-surface-variant font-medium pl-[46px]">
                                    Modify the documents this AI can use for answering questions.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 py-6">
                            {documents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {documents.map((document) => (
                                        <div key={document.id} className="flex items-center space-x-3 p-4 rounded-[12px] border border-outline/30 hover:bg-surface-container-low hover:border-outline/50 transition-colors group cursor-pointer" onClick={() => toggleDocument(document.id)}>
                                            <Checkbox
                                                id={`doc-${document.id}`}
                                                checked={data.document_ids.includes(document.id)}
                                                onCheckedChange={() => toggleDocument(document.id)}
                                                className="mt-0.5 rounded-[4px] data-[state=checked]:bg-primary data-[state=checked]:border-primary border-outline"
                                                onClick={(e) => e.stopPropagation()} 
                                            />
                                            <Label
                                                htmlFor={`doc-${document.id}`}
                                                className="text-sm font-medium leading-relaxed cursor-pointer group-hover:text-primary transition-colors flex-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {document.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-surface-container rounded-[12px] border border-dashed border-outline-variant/80">
                                    <p className="text-[15px] text-on-surface-variant">
                                        No new documents available.{' '}
                                        <Link href="/admin/documents" className="text-primary hover:text-primary-dim hover:underline font-semibold ml-1">
                                            Upload documents first
                                        </Link>
                                    </p>
                                </div>
                            )}
                            {errors.document_ids && <p className="text-sm text-error font-medium mt-4">{errors.document_ids}</p>}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 pb-12">
                        <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary-dim text-primary-foreground h-12 px-8 rounded-[12px] shadow-[0_4px_14px_rgba(0,90,194,0.25)] border-0 text-base font-semibold transition-all hover:-translate-y-0.5">
                            {processing ? 'Saving...' : 'Apply Changes'}
                        </Button>
                        <Button variant="outline" asChild className="h-12 px-8 rounded-[12px] border-outline-variant/60 text-on-surface hover:bg-surface-container font-medium">
                            <Link href="/admin/chatbots">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}