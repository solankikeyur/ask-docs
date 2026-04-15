import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Bot } from 'lucide-react';

interface Document {
    id: number;
    name: string;
}

interface Props {
    documents: Document[];
}

export default function Create({ documents }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        document_ids: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/chatbots');
    };

    const toggleDocument = (documentId: number) => {
        setData('document_ids', data.document_ids.includes(documentId)
            ? data.document_ids.filter(id => id !== documentId)
            : [...data.document_ids, documentId]
        );
    };

    return (
        <AdminLayout>
            <Head title="Create Chatbot" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/chatbots">
                            <ArrowLeft size={16} />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">Create Chatbot</h1>
                        <p className="text-on-surface-variant">Set up a new embeddable chatbot</p>
                    </div>
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
                            {processing ? 'Creating...' : 'Create Chatbot'}
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