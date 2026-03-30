import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';
import { ArrowRight, Sparkles, FileText, MessageSquare } from 'lucide-react';

export function HeroSection() {
    return (
        <section
            id="hero"
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-28 pb-20"
        >
            {/* Background blobs */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(ellipse, #c3d4ff 0%, transparent 70%)' }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(ellipse, #d3ceef 0%, transparent 70%)' }}
            />

            <div className="relative mx-auto max-w-5xl text-center">
                {/* Eyebrow */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-1.5 text-xs font-medium uppercase tracking-[0.08em] text-on-primary-container">
                    <Sparkles size={12} />
                    AI-Powered Document Intelligence
                </div>

                {/* Headline */}
                <h1 className="mb-6 text-5xl font-bold leading-tight text-on-surface md:text-6xl lg:text-7xl">
                    Ask Any Question,{' '}
                    <span className="relative inline-block">
                        <span className="relative z-10 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                            Instantly Answered
                        </span>
                        <span
                            aria-hidden
                            className="absolute bottom-1 left-0 h-3 w-full rounded-full opacity-20"
                            style={{ background: 'linear-gradient(90deg, #005ac2, #5f5c78)' }}
                        />
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="mx-auto mb-10 max-w-2xl text-lg text-on-surface-variant leading-relaxed">
                    Upload your documents and let AI answer questions with pinpoint accuracy.
                    Cite sources, trace answers, and build knowledge bases — all in one intelligent workspace.
                </p>

                {/* CTA row */}
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button asChild size="lg">
                        <Link href={register()} className="group gap-3">
                            Start for Free
                            <ArrowRight
                                size={16}
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg">
                        <a href="#how-it-works">See How It Works</a>
                    </Button>
                </div>

                {/* Social proof */}
                <p className="mt-8 text-xs text-on-surface-variant">
                    Trusted by <strong className="text-on-surface">10,000+</strong> researchers, engineers & teams
                </p>

                {/* Hero mockup */}
                <div className="relative mx-auto mt-16 max-w-4xl">
                    <div className="glass border-ghost overflow-hidden rounded-[var(--radius-xl)] shadow-ambient">
                        {/* Window chrome */}
                        <div className="flex items-center gap-2 border-b border-outline-variant/15 bg-surface-container-low px-5 py-3">
                            <span className="h-3 w-3 rounded-full bg-error-container" />
                            <span className="h-3 w-3 rounded-full bg-tertiary-container" />
                            <span className="h-3 w-3 rounded-full bg-primary-container" />
                            <span className="ml-3 text-xs text-on-surface-variant">AskDocs — Workspace</span>
                        </div>

                        {/* Workspace split */}
                        <div className="grid min-h-64 md:grid-cols-[280px_1fr]">
                            {/* Sidebar */}
                            <div className="hidden border-r border-outline-variant/15 bg-surface-container-low p-4 md:block">
                                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Documents</p>
                                {[
                                    { name: 'Q3 Research Report.pdf', status: 'Ready' },
                                    { name: 'Technical Spec v2.docx', status: 'Ready' },
                                    { name: 'Meeting Notes Oct.pdf', status: 'Processing' },
                                ].map((doc) => (
                                    <div key={doc.name} className="mb-2 flex items-center gap-2.5 rounded-[var(--radius-md)] bg-surface-container-lowest p-2.5">
                                        <FileText size={14} className="shrink-0 text-primary-fixed-dim" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs text-on-surface">{doc.name}</p>
                                            <p className={`text-[10px] uppercase tracking-wider ${doc.status === 'Processing' ? 'text-tertiary' : 'text-primary'}`}>
                                                {doc.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat */}
                            <div className="flex flex-col justify-between p-5">
                                <div className="space-y-3">
                                    {/* AI response */}
                                    <div className="flex gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground">
                                            <MessageSquare size={12} />
                                        </div>
                                        <div className="rounded-[var(--radius-md)] bg-surface-container p-3 text-sm text-on-surface">
                                            Based on the Q3 Research Report, the primary finding is that{' '}
                                            <span className="rounded bg-surface-variant px-1 py-0.5 font-medium text-on-surface">
                                                user engagement increased by 34%{' '}
                                            </span>
                                            after implementing personalized recommendations.
                                        </div>
                                    </div>
                                </div>

                                {/* Input */}
                                <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-lg)] border-ghost bg-surface-container-lowest px-4 py-3">
                                    <span className="flex-1 text-sm text-on-surface-variant/50">Ask anything about your documents…</span>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground">
                                        <ArrowRight size={12} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Glow under card */}
                    <div
                        aria-hidden
                        className="absolute -bottom-10 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full opacity-25 blur-2xl"
                        style={{ background: 'linear-gradient(90deg, #005ac2, #5f5c78)' }}
                    />
                </div>
            </div>
        </section>
    );
}
