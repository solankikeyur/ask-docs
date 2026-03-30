const testimonials = [
    {
        quote:
            'AskDocs cut our legal review time by 60%. We can now answer client questions that used to take days in under five minutes.',
        name: 'Sarah Chen',
        role: 'Legal Counsel, Meridian Group',
        avatar: 'SC',
    },
    {
        quote:
            'The citation feature is a game-changer. Our research team trusts every answer because they can trace it directly to the source.',
        name: 'James Okonkwo',
        role: 'Head of Research, TechForward',
        avatar: 'JO',
    },
    {
        quote:
            'Onboarding new engineers used to take weeks. Now I just point them to AskDocs and our internal wiki. Incredible.',
        name: 'Priya Nair',
        role: 'Engineering Manager, Stacklane',
        avatar: 'PN',
    },
];

export function TestimonialsSection() {
    return (
        <section id="testimonials" className="bg-surface-container-low px-4 py-24">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                        Testimonials
                    </p>
                    <h2 className="mb-4 text-4xl font-bold text-on-surface">
                        Loved by teams that move fast
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid gap-5 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <div
                            key={t.name}
                            className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-surface-container-lowest p-6 shadow-ambient"
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#005ac2">
                                        <path d="M7 1l1.55 3.14 3.45.5-2.5 2.44.59 3.44L7 8.77 3.91 10.52l.59-3.44L2 4.64l3.45-.5z" />
                                    </svg>
                                ))}
                            </div>

                            <blockquote className="flex-1 text-sm leading-relaxed text-on-surface">
                                "{t.quote}"
                            </blockquote>

                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-gradient text-xs font-bold text-primary-foreground">
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-on-surface">{t.name}</p>
                                    <p className="text-xs text-on-surface-variant">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
