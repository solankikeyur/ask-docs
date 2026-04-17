import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Bot, Layers, Palette, Sparkles, Globe, MessageSquarePlus, X } from 'lucide-react';

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
        settings: {
            primary_color: '#4f46e5',
            welcome_title: 'Chatbot',
            welcome_subtitle: 'Ask questions about your documents',
            system_prompt: '',
            allowed_domains: [] as string[],
            starter_questions: [] as string[],
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/chatbots');
    };

    const toggleDocument = (documentId: number) => {
        setData('document_ids', data.document_ids.includes(documentId)
            ? data.document_ids.filter(id => id !== documentId)
            : [...data.document_ids, documentId]
        );
    };

    const addDomain = () => setData('settings', { ...data.settings, allowed_domains: [...data.settings.allowed_domains, ''] });
    const updateDomain = (index: number, val: string) => {
        const newDomains = [...data.settings.allowed_domains];
        newDomains[index] = val;
        setData('settings', { ...data.settings, allowed_domains: newDomains });
    };
    const removeDomain = (index: number) => {
        const newDomains = [...data.settings.allowed_domains];
        newDomains.splice(index, 1);
        setData('settings', { ...data.settings, allowed_domains: newDomains });
    };

    const addQuestion = () => setData('settings', { ...data.settings, starter_questions: [...data.settings.starter_questions, ''] });
    const updateQuestion = (index: number, val: string) => {
        const newQs = [...data.settings.starter_questions];
        newQs[index] = val;
        setData('settings', { ...data.settings, starter_questions: newQs });
    };
    const removeQuestion = (index: number) => {
        const newQs = [...data.settings.starter_questions];
        newQs.splice(index, 1);
        setData('settings', { ...data.settings, starter_questions: newQs });
    };

    return (
        <AppLayout>
            <Head title="Create Chatbot" />

            <div className="max-w-4xl mx-auto space-y-8 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-6">
                    <Button variant="ghost" size="icon" asChild className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-[12px]">
                        <Link href="/chatbots">
                            <ArrowLeft size={18} />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Create Chatbot</h1>
                        <p className="text-on-surface-variant mt-1 text-[15px]">Define a new AI curator for your workspace.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest">
                        <CardHeader className="bg-surface pb-4 sm:pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-6 sm:px-8 pt-6 sm:pt-8">
                            <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                <div className="p-2 bg-primary-container text-on-primary-container rounded-[10px]">
                                    <Bot size={20} />
                                </div>
                                Core Identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-4 sm:px-8 py-4 sm:py-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-on-surface">Name <span className="text-error">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Employee Handbook Assistant"
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
                                    placeholder="Briefly describe the focus of this curator..."
                                    rows={3}
                                    className="p-3 rounded-[12px] border border-outline/30 bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-[0_2px_12px_rgba(17,48,105,0.02)] resize-y"
                                />
                                {errors.description && <p className="text-sm text-error font-medium">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Personality & Instructions */}
                    <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest">
                        <CardHeader className="bg-surface pb-4 sm:pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-6 sm:px-8 pt-6 sm:pt-8">
                            <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                <div className="p-2 bg-secondary-container text-on-secondary-container rounded-[10px]">
                                    <Sparkles size={20} />
                                </div>
                                AI Personality & Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-4 sm:px-8 py-4 sm:py-8">
                            <div className="space-y-2">
                                <Label htmlFor="system_prompt" className="text-sm font-semibold text-on-surface">System Prompt / Custom Instructions</Label>
                                <Textarea
                                    id="system_prompt"
                                    value={data.settings.system_prompt}
                                    onChange={(e) => setData('settings', { ...data.settings, system_prompt: e.target.value })}
                                    placeholder="e.g. You are a professional customer support agent for a fintech company. Be helpful, concise, and always refer to the user by name if they provide it. Keep the tone sophisticated but accessible."
                                    rows={5}
                                    className="p-3 rounded-[12px] border border-outline/30 bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-[0_2px_12px_rgba(17,48,105,0.02)] resize-y"
                                />
                                <p className="text-[13px] text-on-surface-variant font-medium">
                                    Define how the AI should behave, its tone, and any special formatting rules. 
                                    <span className="text-primary ml-1">Example: "Answer like a creative copywriter."</span>
                                </p>
                                {errors['settings.system_prompt'] && <p className="text-sm text-error font-medium">{errors['settings.system_prompt']}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance / Branding */}
                    <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest">
                        <CardHeader className="bg-surface pb-4 sm:pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-6 sm:px-8 pt-6 sm:pt-8">
                            <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                <div className="p-2 bg-tertiary-container text-on-tertiary-container rounded-[10px]">
                                    <Palette size={20} />
                                </div>
                                Interface & Branding
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-4 sm:px-8 py-4 sm:py-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="primary_color" className="text-sm font-semibold text-on-surface">Primary Color</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            type="color"
                                            id="primary_color_picker"
                                            value={data.settings.primary_color}
                                            onChange={(e) => setData('settings', { ...data.settings, primary_color: e.target.value })}
                                            className="w-12 h-12 p-1 rounded-[12px] border border-outline/30 cursor-pointer"
                                        />
                                        <Input
                                            id="primary_color"
                                            value={data.settings.primary_color}
                                            onChange={(e) => setData('settings', { ...data.settings, primary_color: e.target.value })}
                                            placeholder="#4f46e5"
                                            className="h-12 flex-1 rounded-[12px] border border-outline/30 bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-[0_2px_12px_rgba(17,48,105,0.02)] uppercase"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="welcome_title" className="text-sm font-semibold text-on-surface">Welcome Title</Label>
                                    <Input
                                        id="welcome_title"
                                        value={data.settings.welcome_title}
                                        onChange={(e) => setData('settings', { ...data.settings, welcome_title: e.target.value })}
                                        placeholder="e.g. Chatbot"
                                        className="h-12 rounded-[12px] border border-outline/30 bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-[0_2px_12px_rgba(17,48,105,0.02)]"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="welcome_subtitle" className="text-sm font-semibold text-on-surface">Welcome Subtitle</Label>
                                <Input
                                    id="welcome_subtitle"
                                    value={data.settings.welcome_subtitle}
                                    onChange={(e) => setData('settings', { ...data.settings, welcome_subtitle: e.target.value })}
                                    placeholder="e.g. Ask questions about your documents"
                                    className="h-12 rounded-[12px] border border-outline/30 bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-[0_2px_12px_rgba(17,48,105,0.02)]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & Engagement */}
                    <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest">
                        <CardHeader className="bg-surface pb-4 sm:pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-6 sm:px-8 pt-6 sm:pt-8">
                            <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                <div className="p-2 bg-error-container text-on-error-container rounded-[10px]">
                                    <Globe size={20} />
                                </div>
                                Security & Engagement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 px-4 sm:px-8 py-4 sm:py-8">
                            
                            {/* Allowed Domains */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-semibold text-on-surface">Allowed Domains (CORS)</Label>
                                    <p className="text-[13px] text-on-surface-variant font-medium mt-1">Restrict which websites can embed your chatbot.</p>
                                </div>
                                <div className="space-y-3">
                                    {data.settings.allowed_domains.map((domain, index) => (
                                        <div key={`domain-${index}`} className="flex gap-2 items-center">
                                            <Input
                                                value={domain}
                                                onChange={(e) => updateDomain(index, e.target.value)}
                                                placeholder="e.g. example.com"
                                                className="h-10 flex-1 rounded-[8px] bg-surface-container border-outline/30 focus-visible:ring-primary focus-visible:border-primary"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeDomain(index)} className="text-error hover:bg-error-container hover:text-on-error-container h-10 w-10">
                                                <X size={18} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addDomain} className="rounded-[8px] border-outline-variant hover:bg-surface-container text-on-surface text-xs h-9">
                                        + Add Domain
                                    </Button>
                                </div>
                            </div>

                            <hr className="border-outline-variant/30" />

                            {/* Starter Questions */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-semibold text-on-surface">Starter Questions</Label>
                                    <p className="text-[13px] text-on-surface-variant font-medium mt-1">Provide clickable starter prompts to help users begin their chat.</p>
                                </div>
                                <div className="space-y-3">
                                    {data.settings.starter_questions.map((q, index) => (
                                        <div key={`q-${index}`} className="flex gap-2 items-center">
                                            <Input
                                                value={q}
                                                onChange={(e) => updateQuestion(index, e.target.value)}
                                                placeholder="e.g. What is the refund policy?"
                                                className="h-10 flex-1 rounded-[8px] bg-surface-container border-outline/30 focus-visible:ring-primary focus-visible:border-primary"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="text-error hover:bg-error-container hover:text-on-error-container h-10 w-10">
                                                <X size={18} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="rounded-[8px] border-outline-variant hover:bg-surface-container text-on-surface text-xs h-9 flex items-center gap-1.5">
                                        <MessageSquarePlus size={14} /> Add Question
                                    </Button>
                                </div>
                            </div>
                            
                        </CardContent>
                    </Card>

                    {/* Document Assignment */}
                    <Card className="border-0 shadow-[0_4px_24px_rgba(17,48,105,0.04)] rounded-[16px] bg-surface-container-lowest overflow-hidden">
                        <CardHeader className="bg-surface pb-4 sm:pb-6 border-b border-outline-variant/30 rounded-t-[16px] px-6 sm:px-8 pt-6 sm:pt-8">
                            <div className="flex flex-col gap-2">
                                <CardTitle className="flex items-center gap-3 text-xl text-on-surface font-semibold">
                                    <div className="p-2 bg-secondary-container text-on-secondary-container rounded-[10px]">
                                        <Layers size={20} />
                                    </div>
                                    Context Grounding
                                </CardTitle>
                                <p className="text-[14px] text-on-surface-variant font-medium pl-[46px]">
                                    Select the documents to embed as the source of truth for this AI.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-8 py-4 sm:py-6">
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
                                        The library is empty.{' '}
                                        <Link href="/documents" className="text-primary hover:text-primary-dim hover:underline font-semibold ml-1">
                                            Curate documents first
                                        </Link>
                                    </p>
                                </div>
                            )}
                            {errors.document_ids && <p className="text-sm text-error font-medium mt-4">{errors.document_ids}</p>}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 pb-12">
                        <Button type="submit" disabled={processing} className="w-full sm:w-auto bg-primary hover:bg-primary-dim text-primary-foreground h-12 px-8 rounded-[12px] shadow-[0_4px_14px_rgba(0,90,194,0.25)] border-0 text-base font-semibold transition-all hover:-translate-y-0.5">
                            {processing ? 'Synthesizing...' : 'Launch Chatbot'}
                        </Button>
                        <Button variant="outline" asChild className="w-full sm:w-auto h-12 px-8 rounded-[12px] border-outline-variant/60 text-on-surface hover:bg-surface-container font-medium text-center">
                            <Link href="/chatbots">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
