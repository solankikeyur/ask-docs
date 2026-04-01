import { Head, usePage } from '@inertiajs/react';
import { CTASection } from '@/components/marketing/CTASection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { Footer } from '@/components/marketing/Footer';
import { HeroSection } from '@/components/marketing/HeroSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { Navbar } from '@/components/marketing/Navbar';
import { PricingSection } from '@/components/marketing/PricingSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="AskDocs — Administrative Intelligence Unit">
                <meta
                    name="description"
                    content="Enterprise-grade document analysis and administrative control for high-stakes intelligence."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background text-on-surface antialiased">
                <Navbar isAuthenticated={!!auth.user} canRegister={canRegister} />
                <main>
                    <HeroSection />
                    <FeaturesSection />
                    <HowItWorksSection />
                    <TestimonialsSection />
                    <PricingSection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </>
    );
}
