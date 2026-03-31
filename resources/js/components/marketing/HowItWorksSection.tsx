import { Upload, Zap, CheckCircle } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: Upload,
        title: 'Upload Your Documents',
        description:
            'Drop PDFs, Word files, or plain text. AskDocs processes and indexes them automatically — no configuration required.',
        detail: 'Supports batches of 100+ documents',
    },
    {
        number: '02',
        icon: Zap,
        title: 'AI Builds Your Knowledge Base',
        description:
            'Our AI parses, chunks, embeds, and semantically organizes every piece of content, creating a searchable knowledge graph.',
        detail: 'Processing usually takes under 30 seconds',
    },
    {
        number: '03',
        icon: CheckCircle,
        title: 'Ask, Cite, and Act',
        description:
            'Ask questions in plain language. Get precise answers with source citations. Export insights or share with your team instantly.',
        detail: 'Traceable answers, every time',
    },
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="px-4 py-24">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                        How It Works
                    </p>
                    <h2 className="mb-4 text-4xl font-bold text-on-surface">
                        Three steps to total document mastery
                    </h2>
                    <p className="mx-auto max-w-xl text-on-surface-variant">
                        No prompt engineering, no setup scripts. Just upload and start asking.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative grid gap-8 md:grid-cols-3">
                    {/* Connector line (desktop) */}
                    <div
                        aria-hidden
                        className="absolute top-12 left-[calc(33.33%-1rem)] hidden h-px w-[calc(33.33%+2rem)] bg-gradient-to-r from-primary-container to-primary/30 md:block"
                    />
                    <div
                        aria-hidden
                        className="absolute top-12 left-[calc(66.66%-1rem)] hidden h-px w-[calc(33.33%+2rem)] bg-gradient-to-r from-primary/30 to-primary-container md:block"
                    />

                    {steps.map((step) => {
                        const Icon = step.icon;

                        return (
                            <div key={step.number} className="relative flex flex-col items-center text-center">
                                {/* Step circle */}
                                <div className="relative mb-6">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-container shadow-ambient ring-4 ring-surface">
                                        <Icon size={28} className="text-primary" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-gradient text-[11px] font-bold text-primary-foreground">
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className="mb-3 text-lg font-semibold text-on-surface">
                                    {step.title}
                                </h3>
                                <p className="mb-3 text-sm leading-relaxed text-on-surface-variant">
                                    {step.description}
                                </p>
                                <span className="rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
                                    {step.detail}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
