import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

export function CTASection() {
    return (
        <section className="relative overflow-hidden px-4 py-32">
            {/* Background gradient */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(195, 212, 255, 0.4) 0%, transparent 70%)',
                }}
            />

            <div className="relative mx-auto max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-bold text-on-surface md:text-5xl">
                    Ready to make your documents{' '}
                    <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                        talk back?
                    </span>
                </h2>
                <p className="mb-10 text-lg text-on-surface-variant">
                    Join thousands of teams who've turned static files into dynamic knowledge. No credit card required.
                </p>
                <Button asChild size="lg">
                    <Link href={register()} className="group gap-3">
                        Start for Free Today
                        <ArrowRight
                            size={16}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </Link>
                </Button>

                {/* Trust badges */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-on-surface-variant">
                    {['SOC 2 Compliant', 'GDPR Ready', 'End-to-End Encrypted', '99.9% Uptime SLA'].map(
                        (badge) => (
                            <span key={badge} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {badge}
                            </span>
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}
