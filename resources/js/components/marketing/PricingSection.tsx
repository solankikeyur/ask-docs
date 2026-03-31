import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'For individuals exploring AI document Q&A.',
        cta: 'Get Started Free',
        ctaVariant: 'secondary' as const,
        highlight: false,
        features: [
            '5 documents',
            '50 questions / month',
            'PDF & TXT support',
            'Source citations',
            'Community support',
        ],
    },
    {
        name: 'Pro',
        price: '$19',
        period: 'per month',
        description: 'For professionals who need unlimited intelligence.',
        cta: 'Start Pro Trial',
        ctaVariant: 'default' as const,
        highlight: true,
        features: [
            'Unlimited documents',
            'Unlimited questions',
            'All file formats',
            'Advanced citations',
            'Team sharing',
            'API access',
            'Priority support',
        ],
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: 'contact us',
        description: 'For organizations with custom security and scale needs.',
        cta: 'Contact Sales',
        ctaVariant: 'outline' as const,
        highlight: false,
        features: [
            'Everything in Pro',
            'SSO / SAML',
            'Custom data retention',
            'Dedicated instance',
            'SLA guarantee',
            'Onboarding & training',
        ],
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="px-4 py-24">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                        Pricing
                    </p>
                    <h2 className="mb-4 text-4xl font-bold text-on-surface">
                        Simple, transparent pricing
                    </h2>
                    <p className="mx-auto max-w-xl text-on-surface-variant">
                        Start free. Upgrade when you're ready. No surprise charges.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid gap-5 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-[var(--radius-xl)] p-6 transition-all duration-200 ${
                                plan.highlight
                                    ? 'bg-primary shadow-ambient ring-1 ring-primary/40'
                                    : 'bg-surface-container-low border-ghost hover:bg-surface-container'
                            }`}
                        >
                            {plan.highlight && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-gradient px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-ambient">
                                    Most Popular
                                </span>
                            )}

                            <div className="mb-6">
                                <h3
                                    className={`mb-1 font-semibold ${plan.highlight ? 'text-primary-foreground' : 'text-on-surface'}`}
                                >
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span
                                        className={`text-4xl font-bold ${plan.highlight ? 'text-primary-foreground' : 'text-on-surface'}`}
                                    >
                                        {plan.price}
                                    </span>
                                    <span
                                        className={`text-sm ${plan.highlight ? 'text-primary-foreground/70' : 'text-on-surface-variant'}`}
                                    >
                                        /{plan.period}
                                    </span>
                                </div>
                                <p
                                    className={`mt-2 text-sm ${plan.highlight ? 'text-primary-foreground/80' : 'text-on-surface-variant'}`}
                                >
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="mb-8 flex-1 space-y-2.5">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-center gap-2.5 text-sm">
                                        <Check
                                            size={14}
                                            className={plan.highlight ? 'text-primary-container' : 'text-primary'}
                                        />
                                        <span className={plan.highlight ? 'text-primary-foreground/90' : 'text-on-surface-variant'}>
                                            {feat}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                variant={plan.highlight ? 'secondary' : plan.ctaVariant}
                                className="w-full"
                            >
                                <Link href={register()}>{plan.cta}</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
