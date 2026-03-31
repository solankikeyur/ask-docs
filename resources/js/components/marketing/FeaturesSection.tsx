import {
    Upload,
    Cpu,
    Search,
    MessageSquare,
    Link2,
    BarChart3,
} from 'lucide-react';

const features = [
    {
        icon: Upload,
        title: 'Multi-Format Uploads',
        description:
            'PDF, DOCX, TXT, Markdown — drag and drop any document type. Bulk upload entire knowledge bases in seconds.',
        color: 'primary',
    },
    {
        icon: Cpu,
        title: 'AI-Powered Parsing',
        description:
            'State-of-the-art language models process your documents, understand context, and build a semantic index.',
        color: 'tertiary',
    },
    {
        icon: MessageSquare,
        title: 'Conversational Q&A',
        description:
            'Ask follow-up questions naturally. The AI remembers context within your session for fluid conversations.',
        color: 'primary',
    },
    {
        icon: Link2,
        title: 'Source Citations',
        description:
            'Every answer links back to the exact paragraph and page. Verify claims without hunting through documents.',
        color: 'tertiary',
    },
    {
        icon: Search,
        title: 'Semantic Search',
        description:
            'Find information by meaning, not just keywords. Surface insights buried deep in your document library.',
        color: 'primary',
    },
    {
        icon: BarChart3,
        title: 'Usage Analytics',
        description:
            'Track document usage, popular questions, and team activity to understand your knowledge workflow.',
        color: 'tertiary',
    },
];

const colorMap = {
    primary: {
        bg:   'bg-primary-container',
        icon: 'text-primary',
        card: 'hover:bg-surface-container',
    },
    tertiary: {
        bg:   'bg-tertiary-container',
        icon: 'text-tertiary',
        card: 'hover:bg-surface-container',
    },
};

export function FeaturesSection() {
    return (
        <section id="features" className="px-4 py-24">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                        Features
                    </p>
                    <h2 className="mb-4 text-4xl font-bold text-on-surface">
                        Everything you need to unlock
                        <br />
                        your document knowledge
                    </h2>
                    <p className="mx-auto max-w-xl text-on-surface-variant">
                        From ingestion to insight, AskDocs handles the entire pipeline so your team can focus on answers, not infrastructure.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feat) => {
                        const Icon = feat.icon;
                        const colors = colorMap[feat.color as keyof typeof colorMap];

                        return (
                            <div
                                key={feat.title}
                                className={`group rounded-[var(--radius-lg)] bg-surface-container-low p-6 transition-all duration-200 ${colors.card} cursor-default`}
                            >
                                <div
                                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] ${colors.bg}`}
                                >
                                    <Icon size={18} className={colors.icon} />
                                </div>
                                <h3 className="mb-2 font-semibold text-on-surface">
                                    {feat.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-on-surface-variant">
                                    {feat.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
