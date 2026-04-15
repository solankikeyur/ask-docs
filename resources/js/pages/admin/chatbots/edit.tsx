import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Bot, Trash2 } from 'lucide-react';

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
                            <h1 className="text-2xl font-bold text-on-surface">Edit Chatbot</h1>
                            <p className="text-on-surface-variant">{chatbot.name}</p>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 size={16} className="mr-2" />
                        Delete
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot size={20} />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="My Chatbot"
                                    required
                                />
                                {errors.name && <p className="text-sm text-error">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of what this chatbot does"
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-error">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Document Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assign Documents</CardTitle>
                            <p className="text-sm text-on-surface-variant">
                                Select documents this chatbot can use for answering questions
                            </p>
                        </CardHeader>
                        <CardContent>
                            {documents.length > 0 ? (
                                <div className="space-y-3">
                                    {documents.map((document) => (
                                        <div key={document.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`doc-${document.id}`}
                                                checked={data.document_ids.includes(document.id)}
                                                onCheckedChange={() => toggleDocument(document.id)}
                                            />
                                            <Label
                                                htmlFor={`doc-${document.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {document.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-on-surface-variant">
                                    No documents available.{' '}
                                    <Link href="/admin/documents" className="text-primary hover:underline">
                                        Upload some documents first
                                    </Link>
                                </p>
                            )}
                            {errors.document_ids && <p className="text-sm text-error">{errors.document_ids}</p>}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/chatbots">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}